import { execSync, spawnSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const config = JSON.parse(readFileSync(resolve(root, "quality/config.json"), "utf8"));
const now = new Date();
const date = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai" }).format(now);
const sha = execSync("git rev-parse HEAD", { cwd: root, encoding: "utf8" }).trim();
const branch = execSync("git branch --show-current", { cwd: root, encoding: "utf8" }).trim() || config.defaultBranch;

const results = config.checks.map((check) => {
  const started = Date.now();
  const run = spawnSync(check.command, { cwd: root, encoding: "utf8", shell: true, env: process.env });
  return { name: check.name, exitCode: run.status ?? 1, durationSeconds: Math.round((Date.now() - started) / 10) / 100, outputTail: `${run.stdout || ""}${run.stderr || ""}`.trim().slice(-2000) };
});
const failed = results.filter((item) => item.exitCode !== 0);
const status = failed.length ? "fail" : "pass";
const reason = failed.length ? `真实检查未通过：${failed.map((item) => item.name).join("、")}。` : `全部 ${results.length} 项真实检查通过。`;
const latest = {
  schemaVersion: 1, project: config.project, projectName: config.projectName, date, timezone: "Asia/Shanghai", generatedAt: now.toISOString(),
  source: { branch, testedSha: sha, runUrl: process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}` : null },
  verdict: { status, reason, recommendedLevel: failed.length ? "L1" : "L0" },
  checks: { total: results.length, passed: results.length - failed.length, failed: failed.length, results },
  risk: { highRiskFiles: [], failedChecks: failed.map((item) => item.name) },
  nextAction: failed.length ? config.failureNextAction : null,
};
const data = resolve(root, "quality/data");
mkdirSync(resolve(data, "runs"), { recursive: true });
writeFileSync(resolve(data, "latest.json"), `${JSON.stringify(latest, null, 2)}\n`);
writeFileSync(resolve(data, "runs", `${date}.json`), `${JSON.stringify(latest, null, 2)}\n`);
const runSummary = { date, status, reason, testedSha: sha.slice(0, 12), checkTotal: results.length, checkPassed: results.length - failed.length, checkFailed: failed.length, path: `quality/data/runs/${date}.json` };
let previous = [];
try { previous = JSON.parse(readFileSync(resolve(data, "index.json"), "utf8")).runs || []; } catch {}
const runs = [runSummary, ...previous.filter((item) => item.date !== date)].slice(0, 90);
const index = { schemaVersion: 1, project: config.project, generatedAt: now.toISOString(), latestDate: date, totals: { runs: runs.length, pass: runs.filter((item) => item.status === "pass").length, conditional: 0, fail: runs.filter((item) => item.status === "fail").length }, runs };
writeFileSync(resolve(data, "index.json"), `${JSON.stringify(index, null, 2)}\n`);
console.log(`${config.project}: ${status} (${results.length - failed.length}/${results.length})`);
