import antfu from '@antfu/eslint-config';

export default antfu({
  type: 'app',
  vue: true,
  typescript: true,
  formatters: true,
  stylistic: {
    indent: 2,
    semi: true,
    quotes: 'single',
  },
}, {
  rules: {
    'ts/no-redeclare': 'off',
    'vue/custom-event-name-casing': 'off',
    'no-alert': 'off',
    'ts/consistent-type-definitions': ['error', 'type'],
    'no-console': ['warn'],
    'antfu/no-top-level-await': ['off'],
    'node/prefer-global/process': ['off'],
    'node/no-process-env': ['error'],
    'perfectionist/sort-imports': ['error'],
    'unicorn/filename-case': ['error', {
      cases: {
        kebabCase: true,
        pascalCase: true,
      },
      ignore: [
        'README.md',
        /\.config$/,
        /\.d$/,
      ],
    }],
  },
}, {
  files: ['**/*.md'],
  rules: {
    'perfectionist/sort-imports': 'off',
  },
});
