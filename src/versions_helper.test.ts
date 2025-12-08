import { sortVersionArray } from "./versions_helper.js";

describe("versions_helper", () => {
  describe("sortVersionArray", () => {
    it("should handle empty array", () => {
      const versions: string[] = [];
      const sorted = sortVersionArray(versions);
      expect(sorted).toEqual([]);
    });

    it("should handle single version", () => {
      const versions = ["1.0.0"];
      const sorted = sortVersionArray(versions);
      expect(sorted).toEqual(["1.0.0"]);
    });

    it("should sort version strings correctly", () => {
      const versions = [
        "1.2",
        "1.1.1",
        "1.1.0",
        "1.3.0",
        "1.0.0",
        "2",
        "2.1.0",
        "2.2",
      ];
      const sorted = sortVersionArray(versions);
      expect(sorted).toEqual([
        "1.0.0",
        "1.1.0",
        "1.1.1",
        "1.2",
        "1.3.0",
        "2",
        "2.1.0",
        "2.2",
      ]);
    });
  });
});
