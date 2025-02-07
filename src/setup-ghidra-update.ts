import * as core from "@actions/core";
import * as pipeline_helper from "./pipeline-helper.js";

async function run() {
  try {
    // Collect action parameters
    let paramOwner = core.getInput("owner");
    let paramRepo = core.getInput("repo");
    let paramAuthToken = core.getInput("auth_token");

    // Get all possible pipeline files
    let pipelineFiles = await pipeline_helper.getPipelineFiles();
  } catch (err) {
    core.setFailed((err as Error).message);
  }
}

run();
