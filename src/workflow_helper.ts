import * as yaml from "yaml";
import { promises as fsPromises } from "fs";

export async function parseWorkflowFile(file: string): Promise<yaml.Document> {
  let fileContents = await fsPromises.readFile(file, "utf8");
  return yaml.parseDocument(fileContents);
}

export async function getAllJobs(
  doc: yaml.Document,
): Promise<Array<yaml.Pair<yaml.Scalar, yaml.YAMLMap>>> {
  let jobs = Array<yaml.Pair<yaml.Scalar, yaml.YAMLMap>>();
  if (doc == null) return jobs;
  yaml.visit(doc.contents, {
    Pair(key, node, path) {
      if (!yaml.isScalar(node.key)) return;
      if (node.key.value !== "jobs") return;
      if (!yaml.isMap<yaml.Scalar, yaml.YAMLMap>(node.value)) return;
      jobs.push(...node.value.items);
      return yaml.visit.BREAK;
    },
  });
  return jobs;
}

export async function getAllJobSteps(
  job: yaml.Pair<yaml.Scalar, yaml.YAMLMap>,
): Promise<Array<yaml.YAMLMap>> {
  let steps = Array<yaml.YAMLMap>();
  if (job == null) return steps;
  yaml.visit(job.value, {
    Pair(key, node, path) {
      if (!yaml.isScalar(node.key)) return;
      if (node.key.value !== "steps") return;
      if (!yaml.isSeq<yaml.YAMLMap>(node.value)) return;
      steps.push(...node.value.items);
      return yaml.visit.BREAK;
    },
  });
  return steps;
}

function isStepGhidraSetup(step: yaml.YAMLMap): boolean {
  let found = false;
  yaml.visit(step, {
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

export async function getJobGhidraSetupSteps(
  job: yaml.Pair<yaml.Scalar, yaml.YAMLMap>,
): Promise<Array<yaml.YAMLMap>> {
  const steps = await getAllJobSteps(job);
  return steps.filter((step) => isStepGhidraSetup(step));
}

async function getStepWithOptions(
  step: yaml.YAMLMap,
): Promise<Array<yaml.Pair>> {
  let opts = Array<yaml.Pair>();
  yaml.visit(step, {
    Pair(key, node, path) {
      if (!yaml.isScalar(node.key)) return;
      if (node.key.value !== "with") return;
      if (!yaml.isMap<yaml.Pair>(node.value)) return;
      opts.push(...node.value.items);
      return yaml.visit.BREAK;
    },
  });
  return opts;
}

export async function getSetupGhidraVersionOption(
  step: yaml.YAMLMap,
): Promise<yaml.Scalar<string> | null> {
  const opts = await getStepWithOptions(step);
  let version = null;
  opts.forEach((opt) => {
    if (!yaml.isScalar(opt.key)) return;
    if (opt.key.value !== "version") return;
    if (!yaml.isScalar(opt.value)) return;
    version = opt.value;
  });
  return version;
}

async function getJobStrategy(
  job: yaml.Pair<yaml.Scalar, yaml.YAMLMap>,
): Promise<yaml.YAMLMap<yaml.Pair> | null> {
  let node = job.value?.get("strategy");
  if (!yaml.isMap<yaml.Pair>(node)) return null;
  return node;
}

async function getJobStrategyMatrix(
  job: yaml.Pair<yaml.Scalar, yaml.YAMLMap>,
): Promise<yaml.Pair | null> {
  let strategy = await getJobStrategy(job);
  if (strategy == null) return null;
  for (let i = 0; i < strategy.items.length; i++) {
    if (!yaml.isScalar(strategy.items[i].key)) continue;
    if (strategy.items[i].key.value == "matrix") return strategy.items[i];
  }
  return null;
}

async function getJobStrategyMatrixElements(
  job: yaml.Pair<yaml.Scalar, yaml.YAMLMap>,
): Promise<Array<yaml.Pair<yaml.Scalar, yaml.YAMLSeq>> | null> {
  let matrix = await getJobStrategyMatrix(job);
  if (matrix == null) return null;
  let matrix_value = matrix.value;
  if (!yaml.isMap<yaml.Scalar, yaml.YAMLSeq>(matrix_value)) return null;
  let elements = Array<yaml.Pair<yaml.Scalar, yaml.YAMLSeq>>();
  elements.push(...matrix_value.items);
  return elements;
}

export async function getJobStrategyMatrixVariable(
  job: yaml.Pair<yaml.Scalar, yaml.YAMLMap>,
  varname: string,
): Promise<yaml.Pair<yaml.Scalar, yaml.YAMLSeq> | null> {
  let elements = await getJobStrategyMatrixElements(job);
  if (elements == null) return null;
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].key.value == varname) return elements[i];
  }
  return null;
}

export async function getVersionsFromMatrixVariable(
  variable: yaml.Pair<yaml.Scalar, yaml.YAMLSeq>,
): Promise<Array<string> | null> {
  if (variable == null) return null;
  const value = variable.value;
  if (!yaml.isSeq<yaml.Scalar<string>>(value)) return null;
  let vers = Array<string>();
  value.items.forEach((element) => {
    vers.push(element.value);
  });
  return vers;
}

export async function setVersionsInMatrixVariable(
  variable: yaml.Pair<yaml.Scalar, yaml.YAMLSeq>,
  versions: Array<string>,
) {
  let node_new = new yaml.YAMLSeq<yaml.Scalar<string>>();
  versions.forEach((ver) => {
    let scalar = new yaml.Scalar<string>(ver);
    scalar.type = 'QUOTE_DOUBLE';
    node_new.add(scalar);
  });
  variable.value = node_new;
}

export async function writeWorkflowFile(path: string, doc: yaml.Document) {
  await fsPromises.writeFile(path, yaml.stringify(doc));
}
