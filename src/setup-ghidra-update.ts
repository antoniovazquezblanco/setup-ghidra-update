import * as core from "@actions/core";
import * as github_helper from "./github_helper.js";
import * as workflows_helper from "./workflows_helper.js";
import * as workflow_helper from "./workflow_helper.js";

async function run() {
  try {
    // Collect action parameters
    let paramOwner = core.getInput("owner");
    let paramRepo = core.getInput("repo");
    let paramAuthToken = core.getInput("auth_token");

    // Obtain an Octokit instance
    const octokit = github_helper.getOctokit(paramAuthToken);

    // Get all release versions
    // TODO
    //const versions = await github_helper.getAllReleaseVersions(octokit, paramOwner, paramRepo);
    const versions = [
      '11.3.1', '11.3', '11.2.1',
      '11.2', '11.1.2', '11.1.1',
      '11.1', '11.0.3', '11.0.2',
      '11.0.1', '11.0', '10.4',
      '10.3.3', '10.3.2', '10.3.1',
      '10.3', '10.2.3', '10.2.2',
      '10.2.1', '10.2', '10.1.5',
      '10.1.4', '10.1.3', '10.1.2',
      '10.1.1', '10.1', '10.0.4',
      '10.0.3', '10.0.2', '10.0.1'
    ]

    // Get all possible pipeline files
    const workflowFiles = await workflows_helper.getWorkflowFiles();

    // Filter out the workflows that do not have the setup Ghidra action...
    let ghidraWorkflowFiles = []
    for (const wf of workflowFiles)
      if (await workflow_helper.hasSetupGhidraAction(wf))
        ghidraWorkflowFiles.push(wf);

    // Get Ghidra versions in pipeline
    for (const wf of ghidraWorkflowFiles)
    {
      const versions = await workflow_helper.getSetupGhidraVersions(wf)
      console.log(`${wf} -> ${versions}`);
    }

    
  } catch (err) {
    core.setFailed((err as Error).message);
  }
}

run();
