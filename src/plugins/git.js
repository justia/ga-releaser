const Plugin = require('release-it/lib/plugin/Plugin');
const { context } = require('@actions/github');
const { getInput, info } = require('@actions/core');

const input = require('../github/input');

class GitPlugin extends Plugin {
    async init() {
        const name = input['git-user-name'];
        const email = input['git-user-email'];
        return this.step({
            enabled: true,
            task: () => Promise.all([this.fetchAll(), this.configName(name), this.configEmail(email)]),
            label: 'Git pre-config (fetch, set name and email)',
            prompt: 'pre_config'
        });
    }

    getLatestTag() {
        return this.getContext('latestTag') || this.config.getContext('latestTag');
    }

    getLatestVersion() {
        const latestTagName = this.getLatestTag();
        return latestTagName ? latestTagName.replace(/^v/, '') : getInput('fallback-version');
    }

    async beforeBump() {
        const version = this.config.getContext('version');
        this.branch = `v${version}`;
        info(`Handling version ${this.branch}`);

        return this.step({
            enabled: true,
            task: () => this.checkoutBranch(this.branch),
            label: 'Git checkout',
            prompt: 'checkout'
        });
    }

    async beforeRelease() {
        return this.step({
            enabled: true,
            task: () => this.pushNewBranch(this.branch),
            label: 'Git push new branch',
            prompt: 'push'
        });
    }

    async afterRelease() {
        return this.step({
            enabled: true,
            task: () => this.removeBranch(this.branch),
            label: 'Git remove versioned branch',
            prompt: 'remove'
        });
    }

    async fetchAll() {
        return this.exec(['git', 'fetch', '--prune', '--unshallow', '--tags']).catch((err) => {
            this.log.error(`Could not fetch the repository`);
            this.debug(err);
        });
    }

    async configName(name) {
        return this.exec(['git', 'config', 'user.name', name]).catch((err) => {
            this.log.error(`Could not config the git name ${name}`);
            this.debug(err);
        });
    }

    async configEmail(email) {
        return this.exec(['git', 'config', 'user.email', email]).catch((err) => {
            this.log.error(`Could not config the git email ${email}`);
            this.debug(err);
        });
    }

    async checkoutBranch(branch) {
        return this.exec(['git', 'checkout', '-b', branch]).catch((err) => {
            this.log.error(`Could not checkout to branch ${branch}`);
            this.debug(err);
        });
    }

    async pushNewBranch(branch) {
        return this.exec(['git', 'push', '-u', 'origin', branch]).catch((err) => {
            this.log.error(`Could not push branch ${branch} to origin`);
            this.debug(err);
        });
    }

    async removeBranch(branch) {
        return this.exec(['git', 'push', 'origin', '--delete', branch]).catch((err) => {
            this.log.error(`Could not remove the branch ${branch} from origin`);
            this.debug(err);
        });
    }
}

module.exports = GitPlugin;
