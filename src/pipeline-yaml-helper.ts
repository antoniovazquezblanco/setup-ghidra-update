import * as yaml from 'yaml';

/*
async function getJobSteps(node: yaml.Node) {
    
}

async function getDocumentJobs(node: yaml.YAMLMap) : Promise<yaml.YAMLMap|null> {
    if (node == null)
        return null;
    return node.get('jobs');
}

export async function hasSetupGhidraAction(file: string) : Promise<boolean> {
    const document = yaml.parseDocument(file);
    const jobs = await getDocumentJobs(document.contents);
    const steps = await getJobSteps(jobs);
    return false;
}
*/