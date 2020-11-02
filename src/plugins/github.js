const Plugin = require('release-it/lib/plugin/Plugin');
const { getOctokit } = require('@actions/github');

const input = require('../github/input');

const { GITHUB_REPOSITORY, GITHUB_TOKEN } = process.env;
const [owner, repo] = GITHUB_REPOSITORY.split('/');

class GitHubPlugin extends Plugin {
    // eslint-disable-next-line class-methods-use-this
    isEnabled() {
        const isSameBranch = input['head-branch'] === input['base-branch'];
        const useVersionBranch = input['use-version-branch'];
        const usePr = input['use-pr'];
        return usePr && (!isSameBranch || useVersionBranch);
    }

    init() {
        this.octokit = getOctokit(GITHUB_TOKEN);
    }

    async afterRelease() {
        const { version, changelog } = this.config.getContext();
        return this.step({
            enabled: true,
            task: () => this.createPullRequest(version, changelog),
            label: 'Git create pull request',
            prompt: 'create_pull_request'
        })
            .then(({ data }) => {
                if (!input['automerge-pr']) {
                    return null;
                }

                return this.step({
                    enabled: true,
                    task: () => this.mergePullRequest(data.number),
                    label: 'Git merge pull request',
                    prompt: 'merge_pull_request'
                });
            })
            .catch((err) => {
                this.log.error(`An error occurred while creating the pull request`);
                this.debug(err);
            });
    }

    async createPullRequest(version, body) {
        const release = `v${version}`;
        const branch = input['use-version-branch'] ? release : input['head-branch'];
        const base = input['base-branch'];

        const pr = {
            title: `Release ${release}`,
            body,
            owner,
            repo,
            head: branch,
            base,
            maintainer_can_modify: true,
            draft: false
        };
        return this.octokit.pulls.create(pr);
    }

    async mergePullRequest(number) {
        return this.octokit.pulls.merge({
            owner,
            repo,
            pull_number: number
        });
    }
}

module.exports = GitHubPlugin;
