const { getInput, info, startGroup, endGroup } = require('@actions/core');
const { context } = require('@actions/github');
const yaml = require('yaml');
const fs = require('fs');
const path = require('path');

const { isBoolean, parseInputBoolean } = require('../utilities');

const directoryPath = path.join(__dirname, '../../');
const fileContent = fs.readFileSync(path.join(directoryPath, 'action.yml'), 'utf8');
const yamlContent = yaml.parse(fileContent) || {};
const input = yamlContent.inputs || {};
const { pusher } = context.payload;
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
    'git-user-name': pusher ? pusher.user : 'aazbeltran',
    'git-user-email': pusher ? pusher.email : 'alonso.zuniga@justia.com',
    'fallback-version': '0.0.0',
    'base-branch': 'master',
    'head-branch': 'develop',
    'use-pr': true,
    'automerge-pr': true,
    'use-version-branch': true,
    'remove-version-branch': true
};

startGroup(`Loading input values...`);
Object.entries(input).forEach(([key, config]) => {
    const defaultValue = config.default !== undefined ? config.default : inputValues[key];
    const boolean = isBoolean(defaultValue);
    const inputValue = getInput(key, config);
    // eslint-disable-next-line no-nested-ternary
    inputValues[key] = inputValue === '' ? defaultValue : boolean ? parseInputBoolean(inputValue) : inputValue;
    info(`${key}: ${inputValues[key]}`);
});
endGroup();

module.exports = inputValues;
