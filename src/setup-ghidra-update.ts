import * as core from "@actions/core";
import * as github_helper from "./github_helper.js";
import * as workflows_helper from "./workflows_helper.js";
import * as workflow_helper from "./workflow_helper.js";
import * as versions_helper from "./versions_helper.js";
import * as yaml from "yaml";

async function checkMatrixVersionOption(
  job: yaml.Pair<yaml.Scalar, yaml.YAMLMap>,
  varname: string,
  available_versions: string[],
): Promise<boolean> {
  // Obtain yaml version element
  let version_var = await workflow_helper.getJobStrategyMatrixVariable(
    job,
    varname,
  );
  if (version_var == null) {
    console.warn(
      `checkMatrixVersionOption: Could not retrieve matrix "${varname}"!`,
    );
    return false;
  }

  // Get a versions list
  let versions =
    await workflow_helper.getVersionsFromMatrixVariable(version_var);
  if (versions == null) {
    console.warn(`checkMatrixVersionOption: Could not retrieve versions!`);
    return false;
  }
  let versions_sorted = versions_helper.sortVersionArray(versions);

  // Calculate the target versions
  const oldest_verstion = versions_helper.getOldestVersion(versions_sorted);
  const target_versions = versions_helper.getVersionsEqualOrNewerThan(
    available_versions,
    oldest_verstion,
  );

  // Verify if update is needed...
  if (versions_helper.areVersionArraysTheSame(versions_sorted, target_versions))
    return false;

  // Updates are available. Modify the versions array!
  console.log(
    `Updating setup-ghidra matrix to\nfrom: ${versions_sorted}\nto  : ${target_versions}`,
  );
  await workflow_helper.setVersionsInMatrixVariable(
    version_var,
    target_versions,
  );
  return true;
}

async function checkVariableVersionOption(
  job: yaml.Pair<yaml.Scalar, yaml.YAMLMap>,
  vers_opt: yaml.Scalar<string>,
  available_versions: string[],
): Promise<boolean> {
  // Get variable name...
  const vers_var_str = vers_opt.value
    .replace(/^(\$\{\{)/, "")
    .replace(/(\}\})$/, "")
    .trim();

  // Get the scope...
  const parts = vers_var_str.split(".");
  if (parts.length != 2) {
    console.warn(
      `checkVariableVersionOption: Unsupported version variable "${vers_var_str}"!`,
    );
    return false;
  }
  const scope = parts[0];
  const variable = parts[1];
  if (scope != "matrix") {
    console.warn(`checkVariableVersionOption: Unsupported scope "${scope}"!`);
    return false;
  }

  return await checkMatrixVersionOption(job, variable, available_versions);
}

async function checkSingleVersionOption(
  vers_opt: yaml.Scalar<string>,
  available_versions: string[],
): Promise<boolean> {
  // Get the version string
  const vers_str = vers_opt.value;

  // Automatically up to date...
  if (vers_str == "latest") return false;

  // Get latest available version...
  const latest_version = versions_helper.getLatestVersion(available_versions);
  if (latest_version == null) return false;

  // If no update needed, just return...
  if (!versions_helper.shouldUpdate(vers_str, latest_version)) return false;

  // Time to update
  console.log(
    `Updating setup-ghidra version: ${vers_str} -> ${latest_version}`,
  );
  vers_opt.value = latest_version;
  return true;
}

async function checkStep(
  job: yaml.Pair<yaml.Scalar, yaml.YAMLMap>,
  step: yaml.YAMLMap,
  available_versions: string[],
): Promise<boolean> {
  // If no version option we are done...
  const vers_opt = await workflow_helper.getSetupGhidraVersionOption(step);
  if (vers_opt === null) return false;

  // Get the version string
  const vers_str = vers_opt.value;

  // If the string is not a variable, return the results
  if (!vers_str.startsWith("$")) {
    return await checkSingleVersionOption(vers_opt, available_versions);
  } else {
    return await checkVariableVersionOption(job, vers_opt, available_versions);
  }
}

async function checkJob(
  job: yaml.Pair<yaml.Scalar, yaml.YAMLMap>,
  available_versions: string[],
): Promise<boolean> {
  console.log(`Cheking job ${job.key.value}...`);

  // Get the ghidra setup steps in the workflow...
  const steps = await workflow_helper.getJobGhidraSetupSteps(job);

  if (steps.length == 0) {
    console.log(`No setup-ghidra steps found.`);
    return false;
  }

  // Now check steps...
  let updated = false;
  for (let i = 0; i < steps.length; i++) {
    updated ||= await checkStep(job, steps[i], available_versions);
  }

  return updated;
}

async function checkWorkflowFile(
  filepath: string,
  available_versions: string[],
) {
  // Parse the workflow file...
  console.log(`Parsing ${filepath}...`);
  const doc = await workflow_helper.parseWorkflowFile(filepath);

  // Get the jobs in the workflow...
  const jobs = await workflow_helper.getAllJobs(doc);

  // Check each job...
  let updated = false;
  for (let i = 0; i < jobs.length; i++) {
    updated ||= await checkJob(jobs[i], available_versions);
  }

  // If a step has been updated we must write the document...
  if (updated) {
    console.log(`Writing updated workflow...`);
    workflow_helper.writeWorkflowFile(filepath, doc);
  } else {
    console.log(`Already up to date!`);
  }
}

async function run() {
  try {
    // Collect action parameters
    let paramOwner = core.getInput("owner");
    let paramRepo = core.getInput("repo");
    let paramAuthToken = core.getInput("auth_token");

    // Obtain an Octokit instance
    const octokit = github_helper.getOctokit(paramAuthToken);

    // Get all release versions
    console.log(
      `Getting available Ghidra release versions from ${paramOwner}/${paramRepo}`,
    );
  const available_versions = versions_helper.sortVersionArray(
  await github_helper.getAllReleaseVersions(octokit, paramOwner, paramRepo),
  );
    console.log(`Available versions: ${available_versions}`);

    // Get all possible pipeline files
    console.log(`Obtaining repository workflow files...`);
    const workflowFiles = await workflows_helper.getWorkflowFiles();

    // Check them...
    for (let i = 0; i < workflowFiles.length; i++) {
      await checkWorkflowFile(workflowFiles[i], available_versions);
    }
  } catch (err) {
    core.setFailed((err as Error).message);
  }
}

run();
