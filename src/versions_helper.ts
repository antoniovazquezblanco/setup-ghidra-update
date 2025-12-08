import { compare, compareVersions } from "compare-versions";

export function sortVersionArray(versions: Array<string>): Array<string> {
  return versions.sort(compareVersions);
}

export function getLatestVersion(versions: Array<string>): string | null {
  if (versions.length == 0) return null;
  if (versions.includes("latest")) {
    return "latest";
  }
  const sorted = versions.sort(compareVersions);
  return sorted[sorted.length - 1];
}

export function getOldestVersion(versions: Array<string>): string {
  const sorted = versions.sort(compareVersions);
  return sorted[0];
}

export function shouldUpdate(from: string, to: string): boolean {
  return compare(to, from, ">");
}

export function getVersionsEqualOrNewerThan(
  versions: Array<string>,
  oldestVersion: string,
): Array<string> {
  return versions.filter((ver) => compare(ver, oldestVersion, ">="));
}

export function areVersionArraysTheSame(
  v1: Array<string>,
  v2: Array<string>,
): boolean {
  return v1.length == v2.length && v1.every((u, i) => u === v2[i]);
}
