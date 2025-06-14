import { promises as fsPromises } from "fs";
import * as path from 'path';

async function getWorkflowFolders(): Promise<string[]> {
  let folders = [".github/actions/", ".github/workflows/"];
  return folders;
}

function hasYamlExtension(file: string): boolean {
  return file.endsWith('.yaml') || file.endsWith('.yml');
}

async function getYamlFilesRecursively(filepath: string): Promise<string[]> {
  try {
  const stats = await fsPromises.stat(filepath);
  if (stats.isFile() && hasYamlExtension(filepath)) {
    return [filepath];
  } else if (stats.isDirectory()) {
    const files = await fsPromises.readdir(filepath);
    const promises = files.map(async file => await getYamlFilesRecursively(path.join(filepath, file)));
    const resultsArray = await Promise.all(promises);
    const results = resultsArray.reduce((all, res) => all.concat(res), []);
    return results;
  }
  } catch {
  }
  return [];
}

export async function getWorkflowFiles() {
  let files: string[] = [];
  let folders = await getWorkflowFolders();
  for (const f of folders)
    files = files.concat(await getYamlFilesRecursively(f));
  return files;
}
