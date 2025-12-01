// Karma configuration for React + TypeScript + Jasmine using esbuild
const { istanbul } = require('esbuild-plugin-istanbul');

const defaultBrowser = process.env.CHROME_BIN ? 'ChromeHeadless' : 'Chrome';

module.exports = (config) => {
  config.set({
    basePath: '',
    frameworks: ['jasmine'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-spec-reporter'),
      require('karma-esbuild'),
      require('karma-coverage'),
    ],
    files: [
      { pattern: 'node_modules/karma-jasmine/lib/adapter.js', included: true, served: true, watched: false },
      { pattern: 'node_modules/karma-jasmine/lib/boot.js', included: true, served: true, watched: false },
      { pattern: 'tests/setup.ts', watched: false },
      { pattern: 'tests/**/*.spec.tsx', watched: false },
    ],
    preprocessors: {
      'tests/**/*.ts': ['esbuild'],
      'tests/**/*.tsx': ['esbuild'],
      'src/**/*.ts': ['esbuild'],
      'src/**/*.tsx': ['esbuild'],
    },
    esbuild: {
      target: 'es2019',
      jsx: 'automatic',
      sourcemap: 'inline',
      loader: {
        '.png': 'dataurl',
        '.jpg': 'dataurl',
        '.jpeg': 'dataurl',
        '.svg': 'dataurl',
      },
    },
    reporters: ['spec'],
    browsers: [defaultBrowser],
    singleRun: true,
    client: {
      clearContext: false,
    },
  });
};
