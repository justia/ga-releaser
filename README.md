# GA-Releaser

## Who is GA-Releaser?
GA-Releaser is an implementation of the project [release-it](https://github.com/release-it/release-it) with Github Actions to the Justia projects.

## How can I configure any repository?
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
And you can set the format of calver with the input `calver-format`, the default value is `YYYY.MM.MICRO`.