const Plugin = require('release-it/lib/plugin/Plugin');
const Calver = require('calver');
const { getInput } = require('@actions/core');

const DEFAULT_FORMAT = 'YY.MM.MICRO';

class CalverPlugin extends Plugin {
    getFormat() {
        return this.getContext().format || DEFAULT_FORMAT;
    }

    getLatestTag() {
        return this.getContext('latestTag') || this.config.getContext('latestTag');
    }

    getLatestVersion() {
        const latestTagName = this.getLatestTag();
        return latestTagName ? latestTagName.replace(/^v/, '') : getInput('fallback-version');
    }

    getIncrementedVersion({ latestVersion }) {
        let calver = new Calver(this.getFormat(), latestVersion).inc();
        if (calver.get() === latestVersion) {
            calver = calver.inc('micro');
        }
        return calver.get();
    }

    getIncrementedVersionCI() {
        // eslint-disable-next-line prefer-rest-params
        return this.getIncrementedVersion(...arguments);
    }
}

module.exports = CalverPlugin;
