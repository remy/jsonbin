#!/usr/bin/env node
const clite = require('clite');
clite({
  help: './README',
  booleans: ['delete', 'append'],
  options: ['token'],
  alias: {
    a: 'append',
    api: 'token',
    add: 'append',
    merge: 'append',
    key: 'token',
    apikey: 'token',
  },
  commands: {
    _: 'cli-handle',
  },
});
