import * as yaml from "yaml";
import { promises as fsPromises } from "fs";

async function parseWorkflowFile(file: string): Promise<yaml.Document> {
  let fileContents = await fsPromises.readFile(file, "utf8");
  return yaml.parseDocument(fileContents);
}

export async function hasSetupGhidraAction(file: string): Promise<boolean> {
  const document = await parseWorkflowFile(file);
  if (document == null) return false;
  let found = false;
  yaml.visit(document.contents, {
    Pair(key, node, path) {
      if (!yaml.isScalar(node.key)) return;
      if (node.key.value !== "uses") return;
      if (!yaml.isScalar(node.value)) return;
      if (typeof node.value.value !== "string") return;
      if (!node.value.value.startsWith("antoniovazquezblanco/setup-ghidra"))
        return;
      found = true;
      return yaml.visit.BREAK;
    },
  });
  return found;
}

export async function getSetupGhidraVersions(
  file: string,
): Promise<Array<string>> {
  let res = Array<string>();
  const document = await parseWorkflowFile(file);
  if (document == null) return res;
  yaml.visit(document.contents, {
    // TODO
  });
  return res;
}
