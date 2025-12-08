import * as yaml from "yaml";
import { getSetupGhidraVersionOption } from "./workflow_helper.js";

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
});
