module.exports = {
    root: true,
    "env": {
        "browser": true,
    },
    parser: "babel-eslint",
    parserOptions: {
        sourceType: 'module',
        allowImportExportEverywhere: true
    },
    ignorePatterns: ["node_modules/", "static/", "*.test.js", "*.config.js"],
    extends: [
        'airbnb-base'
    ],
    "rules": {
        //'airbnb-base' overrides
        "indent": ["error", 4],
        "no-underscore-dangle": ["error", {
            "allowAfterThis": true
        }],
        "prefer-destructuring": ["error", {
            "array": false,
            "object": true
        }],
        "max-len": ["error", 100, 4, {
            "ignoreUrls": true,
            "ignoreComments": true,
            "ignoreTrailingComments": true,
            "ignoreRegExpLiterals": true,
            "ignoreStrings": true,
            "ignoreTemplateLiterals": true,
        }],
        "no-new": 0,
        "no-plusplus": ["error", {
            "allowForLoopAfterthoughts": true
        }],
        'comma-dangle': ['error', {
            arrays: 'always-multiline',
            objects: 'always-multiline',
            imports: 'always-multiline',
            exports: 'always-multiline',
            functions: 'never',
        }],
        'no-console': ['error', {
            'allow': ['warn', 'error']
            }
        ],
        'no-plusplus': 0,
        'class-methods-use-this': 0,
    },
    'globals': {
        'EventBus': true,
        'FocusTrap': true,
        'StateMachine': true,
        'ComponentLoader': true
    }
}