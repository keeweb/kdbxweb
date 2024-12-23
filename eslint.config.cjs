/*
    Eslint 9 Flat Config

    old eslint < 8 .rc files are no longer supported! do not place .eslintrc files in subfolders.
    eslint developers are currently working on an experimental feature to allow for sub-folder
    override rules
    @ref        https://github.com/eslint/eslint/discussions/18574#discussioncomment-9729092
                https://eslint.org/docs/latest/use/configure/configuration-files#experimental-configuration-file-resolution

    eslint config migration docs
    @ref        https://eslint.org/docs/latest/use/configure/migration-guide
*/

const js = require('@eslint/js');
const globals = require('globals');

/*
    Parser
*/

const parserTS = require('@typescript-eslint/parser');

/*
    Plugins
*/

const pluginChaiFriendly = require('eslint-plugin-chai-friendly');
const pluginImport = require('eslint-plugin-import');
const pluginNode = require('eslint-plugin-n');
const pluginPrettier = require('eslint-plugin-prettier');
const pluginPromise = require('eslint-plugin-promise');

/*
    Globals
*/

const customGlobals = {
    guid: 'readable',
    uuid: 'readable'
};

/*
    Compatibility
*/

const { FlatCompat } = require('@eslint/eslintrc');

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

/*
    Eslint > Flat Config
*/

module.exports = [{
    ignores: [
        '**/argon2-asm.min.js',
        '**/test-support',
        'eslint.config.cjs'
    ],
}, ...compat.extends('eslint:recommended', 'plugin:prettier/recommended', 'plugin:chai-friendly/recommended'), {
        files: ['**/*.ts'],
        plugins: {
            'chai-friendly': pluginChaiFriendly,
            'import': pluginImport,
            'n': pluginNode,
            'prettier': pluginPrettier,
            'promise': pluginPromise
        },

        linterOptions: {
            reportUnusedDisableDirectives: false
        },

        languageOptions: {
            parser: parserTS,
            globals: {
                ...customGlobals,
                ...globals.browser,
                ...globals.node,
                ...globals.jest,
                ...globals.jquery,
                _: true,
                $: true
            },
            sourceType: 'module',
            ecmaVersion: 11,
            parserOptions: {
                project: [
                    'tsconfig.json',
                    'jsconfig.json',
                ]
            }
        },
        rules: {
            // eslint / js rules
            'array-callback-return': 'error',
            'curly': 'error',
            'eqeqeq': 'error',
            'no-alert': 'error',
            'no-array-constructor': 'error',
            'no-console': 'off',
            'no-debugger': 'error',
            'no-dupe-class-members': 'error',
            'no-duplicate-imports': 'error',
            'no-empty': 'off',
            'no-eval': 'error',
            'no-mixed-operators': 'off',
            'no-new-func': 'error',
            'no-new-object': 'error',
            'no-throw-literal': 'off',
            'no-unneeded-ternary': 'error',
            'no-unused-expressions': 'off',
            'no-unused-vars': 'error',
            'no-useless-constructor': 'error',
            'no-useless-escape': 'off',
            'no-var': 'error',
            'object-curly-spacing': 'off',
            'object-property-newline': 'off',
            'object-shorthand': 'error',
            'one-var': 'off',
            'prefer-arrow-callback': 'error',
            'prefer-const': 'error',
            'prefer-promise-reject-errors': 'off',
            'prefer-rest-params': 'error',
            'prefer-spread': 'error',
            'quote-props': 'off',
            'semi': ['error', 'always'],
            'space-before-function-paren': 'off',
            'strict': ['error', 'never'],
            'camelcase': [
                'error',
                {
                    'properties': 'always'
                }
            ],
            'no-restricted-syntax': [
                'error',
                {
                    'selector': 'ExportDefaultDeclaration',
                    'message': 'Prefer named exports'
                }
            ],

            /*
                @plugin         eslint-plugin-chai-friendly
            */

            'chai-friendly/no-unused-expressions': 2,

            /*
                @plugin         eslint-plugin-import
            */

            'import/no-webpack-loader-syntax': 'off',
            'import/no-relative-parent-imports': 'off',
            'import/first': 'error',
            'import/no-default-export': 'error',

            /*
                @plugin         eslint-plugin-n
                @url            https://github.com/eslint-community/eslint-plugin-n
            */

            'n/no-callback-literal': 0,
            'n/no-deprecated-api': 'error',
            'n/no-exports-assign': 'error',
            'n/no-extraneous-import': 'error',
            'n/no-extraneous-require': [
                'error',
                {
                    'allowModules': ['electron', 'electron-notarize'],
                    'resolvePaths': [],
                    'tryExtensions': []
                }
            ],
            'n/no-hide-core-modules': 'off',
            'n/no-missing-import': 'off',
            'n/no-missing-require': 'off',
            'n/no-mixed-requires': 'error',
            'n/no-new-require': 'error',
            'n/no-path-concat': 'error',
            'n/no-process-env': 'off',
            'n/no-process-exit': 'off',
            'n/no-restricted-import': 'error',
            'n/no-restricted-require': 'error',
            'n/no-sync': 'off',
            'n/no-unpublished-bin': 'error',
            'n/no-unpublished-import': 'error',
            'n/no-unpublished-require': 'error',
            'n/no-unsupported-features/es-builtins': 'error',
            'n/no-unsupported-features/es-syntax': 'error',
            'n/no-unsupported-features/node-builtins': 'off',
            'n/prefer-global/buffer': 'error',
            'n/prefer-global/console': 'error',
            'n/prefer-global/process': 'error',
            'n/prefer-global/text-decoder': 'error',
            'n/prefer-global/text-encoder': 'error',
            'n/prefer-global/url': 'error',
            'n/prefer-global/url-search-params': 'error',
            'n/prefer-node-protocol': 'off',
            'n/prefer-promises/dns': 'off',
            'n/prefer-promises/fs': 'off',
            'n/process-exit-as-throw': 'error',

            /*
                @plugin         eslint-plugin-prettier
            */

            'prettier/prettier': [
                'error',
                {
                    experimentalTernaries: false,
                    printWidth: 100,
                    tabWidth: 4,
                    useTabs: false,
                    semi: true,
                    singleQuote: true,
                    quoteProps: 'preserve',
                    jsxSingleQuote: true,
                    trailingComma: 'none',
                    bracketSpacing: true,
                    bracketSameLine: false,
                    arrowParens: 'always',
                    proseWrap: 'preserve',
                    htmlWhitespaceSensitivity: 'ignore',
                    endOfLine: 'auto',
                    parser: 'flow',
                    embeddedLanguageFormatting: 'auto',
                    singleAttributePerLine: true
                }
            ]
        }
    },
    {
        files: ['test/**/*.ts'],
        languageOptions: {
            ecmaVersion: 11,
            parserOptions: {
                project: [
                    'tsconfig.json'
                ]
            },
        },
        rules: {
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-member-access': 'off',
            '@typescript-eslint/ban-ts-comment': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/no-explicit-any': 'off'
        }
    }
];
