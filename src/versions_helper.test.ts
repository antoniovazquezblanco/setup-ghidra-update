import {
  sortVersionArray,
  getLatestVersion,
  getOldestVersion,
  shouldUpdate,
  getVersionsEqualOrNewerThan,
  areVersionArraysTheSame,
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

  describe("getLatestVersion", () => {
    it("should return the latest version", () => {
      const versions = ["1.0.0", "1.1.0", "1.2.0"];
      const latest = getLatestVersion(versions);
      expect(latest).toBe("1.2.0");
    });

    it("should return 'latest' if present", () => {
      const versions = ["1.0.0", "latest", "1.2.0"];
      const latest = getLatestVersion(versions);
      expect(latest).toBe("latest");
    });

    it("should return null for empty array", () => {
      const versions: string[] = [];
      const latest = getLatestVersion(versions);
      expect(latest).toBeNull();
    });
  });

  describe("getOldestVersion", () => {
    it("should return the oldest version", () => {
      const versions = ["1.2.0", "1.0.0", "1.1.0"];
      const oldest = getOldestVersion(versions);
      expect(oldest).toBe("1.0.0");
    });

    it("should handle single version", () => {
      const versions = ["1.0.0"];
      const oldest = getOldestVersion(versions);
      expect(oldest).toBe("1.0.0");
    });
  });

  describe("shouldUpdate", () => {
    it("should return true if to version is newer", () => {
      expect(shouldUpdate("1.0.0", "1.1.0")).toBe(true);
    });

    it("should return false if versions are equal", () => {
      expect(shouldUpdate("1.0.0", "1.0.0")).toBe(false);
    });

    it("should return false if to version is older", () => {
      expect(shouldUpdate("1.1.0", "1.0.0")).toBe(false);
    });
  });

  describe("getVersionsEqualOrNewerThan", () => {
    it("should filter versions equal or newer than given version", () => {
      const versions = ["1.0.0", "1.1.0", "1.2.0", "0.9.0"];
      const filtered = getVersionsEqualOrNewerThan(versions, "1.0.0");
      expect(filtered).toEqual(["1.0.0", "1.1.0", "1.2.0"]);
    });

    it("should return empty array if no versions match", () => {
      const versions = ["0.9.0", "0.8.0"];
      const filtered = getVersionsEqualOrNewerThan(versions, "1.0.0");
      expect(filtered).toEqual([]);
    });
  });

  describe("areVersionArraysTheSame", () => {
    it("should return true for identical arrays", () => {
      const v1 = ["1.0.0", "1.1.0"];
      const v2 = ["1.0.0", "1.1.0"];
      expect(areVersionArraysTheSame(v1, v2)).toBe(true);
    });

    it("should return false for different arrays", () => {
      const v1 = ["1.0.0", "1.1.0"];
      const v2 = ["1.0.0", "1.2.0"];
      expect(areVersionArraysTheSame(v1, v2)).toBe(false);
    });

    it("should return false for different lengths", () => {
      const v1 = ["1.0.0"];
      const v2 = ["1.0.0", "1.1.0"];
      expect(areVersionArraysTheSame(v1, v2)).toBe(false);
    });
  });
});
