const { Log } = require('@justia/releaser/src/log');
const { isBoolean, parseInputBoolean } = require('@justia/releaser/src/utilities');
const { context } = require('@actions/github');
const yaml = require('yaml');
const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, '../');
const fileContent = fs.readFileSync(path.join(directoryPath, 'action.yml'), 'utf8');
const yamlContent = yaml.parse(fileContent) || {};
const input = yamlContent.inputs || {};
const {
    pusher: { user, email }
} = context.payload;
const inputValues = {
    // eslint-disable-next-line no-template-curly-in-string
    'git-message': 'chore(release): ${version}',
    'github-release': true,
    'npm-publish': false,
    preset: 'angular',
    'versioning-specification': 'semver',
    'calver-format': 'YYYY.MM.MICRO',
    'output-file': 'CHANGELOG.md',
    'require-commits': true,
    'require-upstream': false,
    'git-user-name': user || 'aazbeltran',
    'git-user-email': email || 'alonso.zuniga@justia.com',
    'fallback-version': '0.0.0',
    'base-branch': 'master',
    'head-branch': 'develop',
    'use-pr': true,
    'automerge-pr': true,
    'use-version-branch': true,
    'remove-version-branch': true
};

Log.group(`Loading input values...`, async () =>
    Object.entries(input).forEach(([key, config]) => {
        const defaultValue = config.default !== undefined ? config.default : inputValues[key];
        const boolean = isBoolean(defaultValue);
        const inputValue = Log.getInput(key, config);
        // eslint-disable-next-line no-nested-ternary
        inputValues[key] = inputValue === '' ? defaultValue : boolean ? parseInputBoolean(inputValue) : inputValue;
        Log.info(`${key}: ${inputValues[key]}`);
    })
);

module.exports = inputValues;
