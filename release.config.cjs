const isDryRun =
  process.env.SEMANTIC_RELEASE_DRY_RUN === "true" ||
  process.env.GITHUB_EVENT_NAME === "pull_request" ||
  process.env.CI !== "true";

const plugins = [
  "@semantic-release/commit-analyzer",
  "@semantic-release/release-notes-generator",
  ["@semantic-release/changelog", { changelogFile: "CHANGELOG.md" }]
];

if (!isDryRun) {
  plugins.push(
    ["@semantic-release/npm", { npmPublish: true }],
    [
      "@semantic-release/exec",
      {
        publishCmd:
          "npm config set //npm.pkg.github.com/:_authToken $GITHUB_PACKAGES_TOKEN && npm publish --registry https://npm.pkg.github.com --tag ${nextRelease.channel || \"latest\"}"
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
