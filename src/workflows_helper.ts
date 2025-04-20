import { promises as fsPromises } from "fs";

async function getWorkflowFolders(): Promise<string[]> {
  let folders = [".github/actions/", ".github/workflows/"];
  return folders;
}

async function getWorkflowFolderFiles(folder: string): Promise<string[]> {
  let files: string[] = [];
  for await (const entry of fsPromises.glob(`${folder}/**/*.yaml`))
    files.push(entry);
  for await (const entry of fsPromises.glob(`${folder}/**/*.yml`))
    files.push(entry);
  return files;
}

export async function getWorkflowFiles() {
  let files: string[] = [];
  let folders = await getWorkflowFolders();
  for (const f of folders)
    files = files.concat(await getWorkflowFolderFiles(f));
  return files;
}
