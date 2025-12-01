import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import eslintConfigPrettier from 'eslint-config-prettier';

/**
 * Universal Vue + TypeScript ESLint Configuration
 * Optimized for ESLint v9+ (Flat Config)
 */
export default [
  // --- Global Ignores ---
  // ระบุไฟล์ที่ไม่ต้องการให้ Linter เข้าไปยุ่ง
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.nuxt/**',
      '**/.output/**',
      'public/**',
      '*.min.js',
    ],
  },

  // --- Base Configurations ---
  // เริ่มต้นด้วยกฎพื้นฐานของ JS และ TS
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,

  // --- Vue Configuration ---
  // ใช้กฎชุด "Recommended" เพื่อบังคับ Best Practices (เช่น Order ของ attributes, etc.)
  ...pluginVue.configs['flat/recommended'],

  // --- Overrides & Customization ---
  // ส่วนสำคัญที่สุด: การจูน Parser ให้ Vue เข้าใจ TypeScript
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,vue}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      // กำหนด Globals ให้รองรับทั้ง Browser API และ Node.js (เผื่อใช้ SSR/Nuxt)
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      // การตั้งค่า Parser Options ตามเอกสารเพื่อรองรับ Vue + TS
      parserOptions: {
        // ให้ Vue Parser เป็นตัวหลัก
        parser: tseslint.parser,
        // เสริม config สำหรับ TS
        ecmaFeatures: {
          jsx: true,
        },
        extraFileExtensions: ['.vue'],
      },
    },

    // กฎพิเศษที่อาจจะอยากปรับแต่ง (Expert Tweaks)
    rules: {
      // อนุญาตให้ใช้ any ได้บ้าง (ตั้งเป็น warn แทน error เพื่อความยืดหยุ่นในการ dev)
      '@typescript-eslint/no-explicit-any': 'warn',

      // Vue Rules Overrides
      // บางครั้งชื่อ Component คำเดียวก็มีเหตุผล (เช่น Layout, Home) - ปิดกฎนี้ถ้าคุณเข้าใจความเสี่ยง
      'vue/multi-word-component-names': 'off',

      // บังคับ Self-closing เพื่อความสะอาดของโค้ด (<div /> แทน <div></div>)
      'vue/html-self-closing': [
        'error',
        {
          html: {
            void: 'always',
            normal: 'always',
            component: 'always',
          },
          svg: 'always',
          math: 'always',
        },
      ],
    },
  },

  // ---  Prettier Integration ---
  // ใส่ไว้ท้ายสุดเสมอ เพื่อปิดกฎ Formatting ของ ESLint ที่จะตีกับ Prettier
  eslintConfigPrettier,
];
