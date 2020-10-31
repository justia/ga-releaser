const path = require('path');

const parseInputBoolean = (value, defaultValue) =>
    value !== undefined && value !== '' ? value === 'true' : defaultValue;
const isBoolean = (val) => typeof val === 'boolean';

const dirname = path.resolve(__dirname);

module.exports = { parseInputBoolean, dirname, isBoolean };
