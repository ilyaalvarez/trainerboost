const { default: coreWebVitals } = await import('eslint-config-next/core-web-vitals')
const { default: typescript }    = await import('eslint-config-next/typescript')

export default [
  ...coreWebVitals,
  ...typescript,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern:        '^_',
        varsIgnorePattern:        '^_',
        caughtErrorsIgnorePattern: '^_',
      }],
      // React Compiler rules — disabled: codebase predates React Compiler.
      // These are valid React 18 patterns that the Compiler plugin flags.
      'react-compiler/react-compiler':      'off',
      'react-hooks/set-state-in-effect':    'off',
      'react-hooks/purity':                 'off',
      'react-hooks/immutability':           'off',
      'react-hooks/static-components':      'off',
      'react-hooks/prefer-use-memo':               'off',
      'react-hooks/preserve-manual-memoization':   'off',
    },
  },
]
