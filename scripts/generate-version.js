// Runs automatically as part of `npm run build` (see package.json).
// Writes public/version.json so the app can show which exact version is
// live, without any manual version-bumping.
const fs = require("fs");
const path = require("path");

const commit = process.env.VERCEL_GIT_COMMIT_SHA
  ? process.env.VERCEL_GIT_COMMIT_SHA.slice(0, 7)
  : "dev";

const info = {
  commit,
  builtAt: new Date().toISOString(),
};

fs.writeFileSync(
  path.join(__dirname, "..", "public", "version.json"),
  JSON.stringify(info, null, 2)
);

console.log("Generated public/version.json:", info);
