const path = require('path');
const { Log } = require('@justia/releaser/src/log');
const release = require('@justia/releaser/src/release');
const config = require('@justia/releaser/src/index');

const dirname = path.resolve(__dirname);
const input = require('./input');

try {
    Object.assign(config, {
        git: {
            commitMessage: input['git-message'],
            requireCommits: input['require-commits'],
            requireUpstream: input['require-upstream']
        },
        github: {
            release: input['github-release']
        },
        npm: {
            publish: input['npm-publish']
        },
        plugins: {
            '@justia/releaser/src/plugins/conventional-changelog.js': {
                preset: input.preset,
                infile: input['output-file']
            },
            '@justia/releaser/src/plugins/github.js': {
                usePr: input['use-pr'],
                automergePr: input['automerge-pr']
            },
            '@justia/releaser/src/plugins/git.js': {
                removeVersionBranch: input['remove-version-branch'],
                name: input['git-user-name'],
                email: input['git-user-email']
            }
        },
        ci: true,
        requireBranch: input['head-branch'],
        justia: {
            fallbackVersion: input['fallback-version'],
            baseBranch: input['base-branch'],
            headBranch: input['head-branch'],
            useVersionBranch: input['use-version-branch'],
            calverFormat: input['calver-format']
        }
    });
    if (input['versioning-specification'] === 'calver') {
        Object.assign(config.plugins, {
            '@justia/releaser/src/plugins/calver.js': {
                format: input['calver-format']
            }
        });
    }

    Log.group('Release IT config', async () => Log.info(JSON.stringify(config)));

    Log.group('release-it', () =>
        release(config)
            // eslint-disable-next-line promise/always-return
            .then((output) => {
                Log.setOutput('json-result', output);
                Log.setOutput('version', output.version);
                Log.setOutput('latest-version', output.latestVersion);
                Log.setOutput('changelog', output.changelog);
            })
            .catch((error) => {
                Log.setFailed(error.message);
            })
    );
} catch (error) {
    Log.setFailed(error.message);
}
