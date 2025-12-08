import {
  sortVersionArray
} from "./versions_helper.js";

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
  });
});
