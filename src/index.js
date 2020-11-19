const Log = require('@justia/releaser/dist/log');
const release = require('@justia/releaser/dist/release');
const config = require('@justia/releaser');

const input = require('./input');
const { mergeDeep } = require('./utilities');

try {
    mergeDeep(config, {
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
            '@justia/releaser/dist/plugins/conventional-changelog.js': {
                preset: input.preset,
                infile: input['output-file']
            },
            '@justia/releaser/dist/plugins/github.js': {
                usePr: input['use-pr'],
                automergePr: input['automerge-pr']
            },
            '@justia/releaser/dist/plugins/git-config.js': {
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
        mergeDeep(config.plugins, {
            '@justia/releaser/dist/plugins/calver.js': {
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
