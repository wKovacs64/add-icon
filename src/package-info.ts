import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";

type PackageInfo = {
  name: string;
  version: string;
  description: string;
};

type PackageJson = Partial<PackageInfo>;

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === "string";
}

/**
 * Checks that parsed package.json is an object whose info fields are strings or absent
 */
function isPackageJson(value: unknown): value is PackageJson {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    (!("name" in value) || isOptionalString(value.name)) &&
    (!("version" in value) || isOptionalString(value.version)) &&
    (!("description" in value) || isOptionalString(value.description))
  );
}

/**
 * Loads package info from package.json
 * @returns Package info with name, version, and description
 */
export async function getPackageInfo(): Promise<PackageInfo> {
  // Get the directory of the current module
  const currentFileUrl = import.meta.url;
  const currentFilePath = fileURLToPath(currentFileUrl);
  const currentDir = path.dirname(currentFilePath);

  // Go up one level from src/ to the package root
  const packageJsonPath = path.resolve(currentDir, "..", "package.json");

  try {
    // Read and parse package.json
    const packageJsonContent = await fs.readFile(packageJsonPath, "utf-8");
    const packageJson: unknown = JSON.parse(packageJsonContent);

    if (!isPackageJson(packageJson)) {
      throw new Error("package.json name, version, or description is not a string");
    }

    return {
      name: packageJson.name || "unknown",
      version: packageJson.version || "0.0.0",
      description: packageJson.description || "unknown",
    };
  } catch (error) {
    console.warn("Failed to read package.json:", error);

    // Fallback values
    return {
      name: "unknown",
      version: "0.0.0",
      description: "unknown",
    };
  }
}
