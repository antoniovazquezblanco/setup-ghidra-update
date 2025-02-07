import { promises as fsPromises } from "fs";

async function getPipelineFolders(): Promise<string[]> {
  let folders = [".github/actions/", ".github/workflows/"];
  return folders;
}

async function getPipelineFolderFiles(folder: string): Promise<string[]> {
  let files: string[] = [];
  for await (const entry of fsPromises.glob(`${folder}/**/*.yaml`))
    files.push(entry);
  for await (const entry of fsPromises.glob(`${folder}/**/*.yml`))
    files.push(entry);
  return files;
}

export async function getPipelineFiles() {
  let files: string[] = [];
  let folders = await getPipelineFolders();
  folders.forEach(async (f) => {
    files.concat(await getPipelineFolderFiles(f));
  });
  return files;
}
