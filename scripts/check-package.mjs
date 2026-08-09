import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const temporaryDirectory = await mkdtemp(join(tmpdir(), "pulsepond-react-package-"));
const packageJson = JSON.parse(await readFile("package.json", "utf8"));

try {
  await run("npm", ["pack", "--pack-destination", temporaryDirectory, "--ignore-scripts"]);
  const archivePath = join(
    temporaryDirectory,
    `${packageJson.name.replace(/^@/, "").replaceAll("/", "-")}-${packageJson.version}.tgz`,
  );
  const files = (await run("tar", ["-tzf", archivePath])).split("\n").filter(Boolean);

  assert.equal(files.some((path) => path.startsWith("package/src/")), false);
  assert.equal(files.some((path) => path.startsWith("package/test/")), false);
  for (const path of [
    "package/dist/index.js",
    "package/dist/index.d.ts",
    "package/LICENSE",
    "package/README.md",
    "package/package.json",
  ]) {
    assert.equal(files.includes(path), true, `${path} is missing from the npm archive`);
  }
  assert.equal(packageJson.name, "@pulsepond/react-sdk");
  assert.equal(packageJson.publishConfig.access, "public");
  assert.equal(packageJson.publishConfig.provenance, true);
  assert.equal(packageJson.peerDependencies.react, ">=18.3.0 <20");
  assert.equal(packageJson.dependencies["@pulsepond/typescript-sdk"], "^0.1.1");
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}

function run(command, arguments_) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, arguments_, {
      cwd: process.cwd(),
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.once("error", reject);
    child.once("close", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(`${command} exited ${code}: ${stderr}`));
    });
  });
}
