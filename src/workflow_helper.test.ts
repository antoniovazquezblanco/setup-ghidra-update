import * as yaml from "yaml";
import { promises as fsPromises } from "fs";
import * as path from "path";
import * as os from "os";
import {
  parseWorkflowFile,
  getAllJobs,
  getAllJobSteps,
  getJobGhidraSetupSteps,
  getJobStrategyMatrixVariable,
  getVersionsFromMatrixVariable,
  writeWorkflowFile,
  getSetupGhidraVersionOption,
  setVersionsInMatrixVariable,
} from "./workflow_helper.js";

describe("workflow_helper", () => {
  describe("parseWorkflowFile", () => {
    it("should parse a yaml workflow file", async () => {
      const tmpDir = os.tmpdir();
      const tmpFile = path.join(tmpDir, "test-workflow.yml");
      const content = `name: Test
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
`;
      await fsPromises.writeFile(tmpFile, content);

      const doc = await parseWorkflowFile(tmpFile);

      expect(doc).toBeDefined();
      expect(doc.contents).toBeDefined();

      await fsPromises.unlink(tmpFile);
    });
  });

  describe("getAllJobs", () => {
    it("should return all jobs from workflow document", async () => {
      const doc = yaml.parseDocument(`
name: Test
on: push
jobs:
  build:
    runs-on: ubuntu-latest
  test:
    runs-on: ubuntu-latest
`);
      const jobs = await getAllJobs(doc);
      expect(jobs.length).toBe(2);
      expect(jobs[0].key.value).toBe("build");
      expect(jobs[1].key.value).toBe("test");
    });

    it("should return empty array for null document", async () => {
      const jobs = await getAllJobs(null as any);
      expect(jobs).toEqual([]);
    });

    it("should return empty array if no jobs section", async () => {
      const doc = yaml.parseDocument(`
name: Test
on: push
`);
      const jobs = await getAllJobs(doc);
      expect(jobs).toEqual([]);
    });
  });

  describe("getAllJobSteps", () => {
    it("should return all steps from a job", async () => {
      const doc = yaml.parseDocument(`
name: Test
on: push
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm test
`);
      const jobs = await getAllJobs(doc);
      const steps = await getAllJobSteps(jobs[0]);
      expect(steps.length).toBe(2);
    });

    it("should return empty array for null job", async () => {
      const steps = await getAllJobSteps(null as any);
      expect(steps).toEqual([]);
    });

    it("should return empty array if no steps section", async () => {
      const doc = yaml.parseDocument(`
name: Test
jobs:
  test:
    runs-on: ubuntu-latest
`);
      const jobs = await getAllJobs(doc);
      const steps = await getAllJobSteps(jobs[0]);
      expect(steps).toEqual([]);
    });
  });

  describe("isStepGhidraSetup", () => {
    it("should identify setup-ghidra step in job", async () => {
      const doc = yaml.parseDocument(`
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: antoniovazquezblanco/setup-ghidra@v1
        with:
          version: "10.2.3"
`);
      const jobs = await getAllJobs(doc);
      const result = await getJobGhidraSetupSteps(jobs[0]);
      expect(result.length).toBe(1);
    });

    it("should not match other actions", async () => {
      const doc = yaml.parseDocument(`
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
`);
      const jobs = await getAllJobs(doc);
      const result = await getJobGhidraSetupSteps(jobs[0]);
      expect(result.length).toBe(0);
    });
  });

  describe("getJobStrategy", () => {
    it("should return strategy map from job", async () => {
      const doc = yaml.parseDocument(`
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        version: [10.2, 10.3]
`);
      const jobs = await getAllJobs(doc);
      const variable = await getJobStrategyMatrixVariable(jobs[0], "version");
      expect(variable).not.toBeNull();
    });

    it("should return null for job without matrix in strategy", async () => {
      const doc = yaml.parseDocument(`
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
`);
      const jobs = await getAllJobs(doc);
      const variable = await getJobStrategyMatrixVariable(jobs[0], "version");
      expect(variable).toBeNull();
    });
  });

  describe("getJobStrategyMatrixVariable", () => {
    it("should return null for non-existent variable", async () => {
      const doc = yaml.parseDocument(`
jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        version: [10.2, 10.3]
`);
      const jobs = await getAllJobs(doc);
      const variable = await getJobStrategyMatrixVariable(
        jobs[0],
        "nonExistent",
      );
      expect(variable).toBeNull();
    });
  });

  describe("getVersionsFromMatrixVariable", () => {
    it("should return versions from matrix variable", async () => {
      const seq = new yaml.YAMLSeq<yaml.Scalar<string>>();
      seq.add(new yaml.Scalar<string>("10.2"));
      seq.add(new yaml.Scalar<string>("10.3"));
      const variable = new yaml.Pair<
        yaml.Scalar<string>,
        yaml.YAMLSeq<yaml.Scalar<string>>
      >(new yaml.Scalar<string>("version"), seq);
      const versions = await getVersionsFromMatrixVariable(variable);
      expect(versions).toEqual(["10.2", "10.3"]);
    });

    it("should return null for null variable", async () => {
      const versions = await getVersionsFromMatrixVariable(null as any);
      expect(versions).toBeNull();
    });

    it("should return null for non-sequence value", async () => {
      const variable = new yaml.Pair(
        new yaml.Scalar("version"),
        new yaml.Scalar("not-a-sequence"),
      );
      const versions = await getVersionsFromMatrixVariable(variable as any);
      expect(versions).toBeNull();
    });
  });

  describe("writeWorkflowFile", () => {
    it("should write workflow document to file", async () => {
      const tmpDir = os.tmpdir();
      const tmpFile = path.join(tmpDir, "test-output-workflow.yml");
      const doc = yaml.parseDocument(`
name: Test
on: push
jobs:
  test:
    runs-on: ubuntu-latest
`);

      await writeWorkflowFile(tmpFile, doc);

      const content = await fsPromises.readFile(tmpFile, "utf8");
      expect(content).toContain("name: Test");
      expect(content).toContain("test:");

      await fsPromises.unlink(tmpFile);
    });
  });

  describe("getSetupGhidraVersionOption", () => {
    it("should return version option from step", async () => {
      const step = yaml.parseDocument(`
        uses: antoniovazquezblanco/setup-ghidra@v1
        with:
          version: "10.2.3"
      `).contents as yaml.YAMLMap;

      const result = await getSetupGhidraVersionOption(step);
      expect(result?.value).toBe("10.2.3");
    });

    it("should return null if no with section", async () => {
      const step = yaml.parseDocument(`
        uses: actions/checkout@v2
      `).contents as yaml.YAMLMap;

      const result = await getSetupGhidraVersionOption(step);
      expect(result).toBeNull();
    });

    it("should return null if no version option", async () => {
      const step = yaml.parseDocument(`
        uses: antoniovazquezblanco/setup-ghidra@v1
        with:
          other: value
      `).contents as yaml.YAMLMap;

      const result = await getSetupGhidraVersionOption(step);
      expect(result).toBeNull();
    });
  });

  describe("setVersionsInMatrixVariable", () => {
    it("should set versions in matrix variable", async () => {
      const variable = new yaml.Pair(
        new yaml.Scalar("versions"),
        new yaml.YAMLSeq(),
      );
      const versions = ["10.2.3", "10.3.0"];

      await setVersionsInMatrixVariable(variable, versions);

      const seq = variable.value as yaml.YAMLSeq<yaml.Scalar<string>>;
      expect(seq.items.length).toBe(2);
      expect(seq.items[0].value).toBe("10.2.3");
      expect(seq.items[1].value).toBe("10.3.0");
    });

    it("should handle empty versions array", async () => {
      // Setup
      const old_vers = new yaml.YAMLSeq();
      old_vers.add(new yaml.Scalar("old"));
      const variable = new yaml.Pair(new yaml.Scalar("versions"), old_vers);

      // Action
      await setVersionsInMatrixVariable(variable, []);

      // Check
      const seq = variable.value as yaml.YAMLSeq;
      expect(seq.items.length).toBe(0);
    });

    it("should use double quotes for versions in string representation", async () => {
      const variable = new yaml.Pair(
        new yaml.Scalar("versions"),
        new yaml.YAMLSeq(),
      );
      const versions = ["10.2.3", "10.3.0"];

      await setVersionsInMatrixVariable(variable, versions);

      const output = yaml.stringify(variable);
      expect(output).toContain('"10.2.3"');
      expect(output).toContain('"10.3.0"');
    });
  });
});
