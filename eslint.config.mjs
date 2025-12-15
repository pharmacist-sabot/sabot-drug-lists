// eslint.config.mjs
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
    'ts/consistent-type-definitions': ['error', 'type'],
    'no-console': ['warn'],
    'antfu/no-top-level-await': ['off'],
    'node/prefer-global/process': ['off'],
    'node/no-process-env': ['error'],

    // Auto-sort imports: ช่วยลด Cognitive Load เวลาอ่านโค้ด
    'perfectionist/sort-imports': ['error', {
      tsconfigRootDir: '.',
    }],

    // File Naming Convention
    'unicorn/filename-case': ['error', {
      cases: {
        kebabCase: true,
        pascalCase: true,
      },
      ignore: ['README.md'],
    }],
  },
});
