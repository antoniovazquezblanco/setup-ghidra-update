import * as yaml from "yaml";
import {
  getSetupGhidraVersionOption,
  setVersionsInMatrixVariable,
} from "./workflow_helper.js";

describe("workflow_helper", () => {
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
  });
});
