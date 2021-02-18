# GA-Releaser

## Who is GA-Releaser?
GA-Releaser is an implementation of the project [release-it](https://github.com/release-it/release-it) with Github Actions to the Justia projects.

## How can I configure any repository?
It's important to call `release.yml` the GitHub Action to make compatible with the command jReleaser on the computers.

An example can be:
```yaml
name: Release
on:
  push:
    branches:
      - master
jobs:
  release:
    name: Conventional Release
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2-beta
      - uses: justia/ga-releaser@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          RELEASER_BYPASS_PR_TOKEN: ${{ secrets.RELEASER_BYPASS_PR_TOKEN }}
```

You can check the file `action.yml` to know what input values has the github action.
So, if you need to use a calver release, your yaml file should be something like:
```yaml
name: Release
on:
  push:
    branches:
      - master
jobs:
  release:
    name: Conventional Release
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2-beta
      - uses: justia/ga-releaser@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          RELEASER_BYPASS_PR_TOKEN: ${{ secrets.RELEASER_BYPASS_PR_TOKEN }}
        with:
          versioning-specification: 'calver'
```
And you can set the format of calver with the input `calver-format`, the default value is `YYYY.MINOR.MICRO`.


# Available options

|          Property          |                                                                      Description                                                                      |           Default          | Is required? |
|:--------------------------:|:-----------------------------------------------------------------------------------------------------------------------------------------------------:|:--------------------------:|:------------:|
|        `git-message`       |                                                                 Commit message to use                                                                 | chore(release): ${version} |       ❌      |
|      `github-release`      |                                                      Don't publish a github release if set false                                                      |            true            |       ❌      |
|       `release-name`       |                                                                  GitHub Release title                                                                 |     Release ${version}     |       ❌      |
|        `npm-publish`       |                                                                      NPM Publish                                                                      |            false           |       ❌      |
|          `preset`          |                                                     The preset from Conventional Changelog to use                                                     |           angular          |       ❌      |
| `versioning-specification` |                                                Versioning specification to use. Options: semver, calver                                               |           semver           |       ❌      |
|       `calver-format`      | Format of calver. More info: [https://www.npmjs.com/package/calver#available-format-tags](https://www.npmjs.com/package/calver#available-format-tags) |      YYYY.MINOR.MICRO      |       ❌      |
|        `output-file`       |                                                            File to output the changelog to                                                            |        CHANGELOG.md        |       ❌      |
|      `require-commits`     |                                             Do nothing when the changelog from the latest release is empty                                            |            true            |       ❌      |
|     `require-upstream`     |                                                        Requires upstream to push the changelog                                                        |            false           |       ❌      |
|       `git-user-name`      |                                                        The git user.name to use for the commit                                                        |                            |       ❌      |
|      `git-user-email`      |                                                        The git user.email to use for the commit                                                       |                            |       ❌      |
|     `fallback-version`     |                                               The fallback version if a previous version doesn't exists                                               |            0.0.0           |       ❌      |
|        `base-branch`       |                                                             The base branch of repository                                                             |           master           |       ❌      |
|        `head-branch`       |                                                             The head branch of repository                                                             |           develop          |       ❌      |
|          `use-pr`          |                                                          Create a pull request for the change                                                         |            true            |       ❌      |
|       `automerge-pr`       |                                                           Automerge the pull request created                                                          |            true            |       ❌      |
|    `use-version-branch`    |                                                                 Use a versioned branch                                                                |            true            |       ❌      |
|   `remove-version-branch`  |                                                 Remove version branch when the pull request is merged                                                 |            true            |       ❌      |

# Branch protected bypass
To enable this feature is required to generate a personal token of an organization admin here: https://github.com/settings/tokens/new?description=GA-Releaser%20merger%20token&scopes=repo

This token needs to have the repo scope to allow pull request merging.

To configure on organization, is required to create a new organization secret on the following link with the name `RELEASER_BYPASS_PR_TOKEN` and the token as a value:
https://github.com/organizations/SILIDMX/settings/secrets/actions/new

> Disclaimer: This personal token is used only to merge the blocked pull requests.


Once you already have configured the secret, you can use the token adding a new environment variable on the workflow yaml file with the same name of the secret, `RELEASER_BYPASS_PR_TOKEN`:

```yaml
name: Release
on:
  push:
    branches:
      - master
jobs:
  release:
    name: Conventional Release
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2-beta
      - uses: justia/ga-releaser@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          RELEASER_BYPASS_PR_TOKEN: ${{ secrets.RELEASER_BYPASS_PR_TOKEN }}
```

Once you already have this token defined as env variable, the script will use it when a branch merge is protected.
