import * as core from "@actions/core";
import * as github_helper from "./github_helper.js";
//import * as pipeline_helper from "./pipeline-helper.js";

async function run() {
  try {
    // Collect action parameters
    let paramOwner = core.getInput("owner");
    let paramRepo = core.getInput("repo");
    let paramAuthToken = core.getInput("auth_token");

    // Get all possible pipeline files
    //let pipelineFiles = await pipeline_helper.getPipelineFiles();

    // Obtain an Octokit instance
    const octokit = github_helper.getOctokit(paramAuthToken);

    // Get latest Ghidra release
    const release = await github_helper.getLatestRelease(octokit, paramOwner, paramRepo)
    console.log(release)
  } catch (err) {
    core.setFailed((err as Error).message);
  }
}

run();
