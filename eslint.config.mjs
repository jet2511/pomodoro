export default [
    {
        ignores: ['dist/**', 'node_modules/**'],
    },
    {
        files: ['tests/**/*.js', '*.mjs'],
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
            'prefer-const': 'error',
        },
    },
];
