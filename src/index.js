const release = require('release-it');
const { setOutput, setFailed, info, group } = require('@actions/core');

const { dirname } = require('./utilities');

process.env['INPUT_GITHUB-TOKEN'] = process.env.GITHUB_TOKEN;
const input = require('./github/input');

try {
    const jsonOpts = {
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
            '@release-it/conventional-changelog': {
                preset: input.preset,
                infile: input['output-file']
            }
        },
        ci: true,
        requireBranch: input['base-branch']
    };
    jsonOpts.plugins[`${dirname}/plugins/github.js`] = {};
    jsonOpts.plugins[`${dirname}/plugins/git.js`] = {};
    if (input['versioning-specification'] === 'calver') {
        jsonOpts.plugins[`${dirname}/plugins/calver.js`] = {
            format: input['calver-format']
        };
    }

    group('Release IT config', async () => info(JSON.stringify(jsonOpts)));

    group('release-it', async () => {
        await release(jsonOpts)
            // eslint-disable-next-line promise/always-return
            .then((output) => {
                setOutput('json-result', output);
                setOutput('version', output.version);
                setOutput('latest-version', output.latestVersion);
                setOutput('changelog', output.changelog);
            })
            .catch((error) => {
                setFailed(error.message);
            });
    });
} catch (error) {
    setFailed(error.message);
}
