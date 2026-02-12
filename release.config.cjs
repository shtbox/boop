const isDryRun =
  process.env.SEMANTIC_RELEASE_DRY_RUN === "true" ||
  process.env.GITHUB_EVENT_NAME === "pull_request" ||
  process.env.CI !== "true";

const parserOpts = {
  // Only these exact footers are treated as breaking changes.
  noteKeywords: ["BREAKING CHANGE", "BREAKING CHANGES"]
};

const releaseRules = [
  { breaking: true, release: "major" },
  { revert: true, release: "patch" },
  { type: "feat", release: "minor" },
  { type: "fix", release: "patch" },
  { type: "perf", release: "patch" },
  { type: "refactor", release: "patch" },
  // Explicitly ignore non-runtime commit types.
  { type: "build", release: false },
  { type: "chore", release: false },
  { type: "ci", release: false },
  { type: "docs", release: false },
  { type: "style", release: false },
  { type: "test", release: false }
];

const plugins = [
  [
    "@semantic-release/commit-analyzer",
    {
      preset: "conventionalcommits",
      parserOpts,
      releaseRules
    }
  ],
  [
    "@semantic-release/release-notes-generator",
    {
      preset: "conventionalcommits",
      parserOpts
    }
  ],
  ["@semantic-release/changelog", { changelogFile: "CHANGELOG.md" }]
];

if (!isDryRun) {
  plugins.push(
    ["@semantic-release/npm", { npmPublish: true }],
    [
      "@semantic-release/exec",
      {
        publishCmd:
          "npm config set //npm.pkg.github.com/:_authToken $GITHUB_PACKAGES_TOKEN && npm publish --registry https://npm.pkg.github.com --provenance=false --tag ${nextRelease.channel || \"latest\"}"
      }
    ],
    "@semantic-release/github",
    [
      "@semantic-release/git",
      {
        assets: ["package.json", "package-lock.json", "CHANGELOG.md"],
        message:
          "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
      }
    ]
  );
}

module.exports = {
  branches: [
    "main",
    {
      name: "prerelease/*",
      channel: '${name.replace(/^prerelease\\//, "")}',
      prerelease: '${name.replace(/^prerelease\\//, "")}'
    }
  ],
  plugins
};
