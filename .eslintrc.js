module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        'react',
        '@typescript-eslint',
    ],
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        tsconfigRootDir: __dirname,
        project: ['tsconfig.json'],
    },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
    ],
    rules: {
        '@typescript-eslint/no-unused-vars': ['warn', { varsIgnorePattern: 'React' }],

        // React boilerplace has inferred styles from dict, default (mostly) unused args, and (usually) empty Props interface.
        '@typescript-eslint/explicit-function-return-type': 0,
        '@typescript-eslint/no-empty-interface': 0,
        '@typescript-eslint/no-unused-vars': ['warn', { 'args': 'none' }],

        // I just like it this way.
        '@typescript-eslint/interface-name-prefix': 0,
        '@typescript-eslint/member-delimiter-style': 0,
    },
    settings: {
        react: {
            version: 'detect',
        },
        linkComponents: [  // Components used as alternatives to <a> for linking, eg. <Link to={ url } />
            'Hyperlink',
            {name: 'Link', linkAttribute: 'to'}
        ],
    },
};
