module.exports = {
    collectCoverageFrom: [
        "**/*.{js,ts,tsx}",
        "!**/*.d.ts",
        "!**/*.spec.{ts,tsx}",
        "!**/tools/**/*.{ts,tsx}",
        "!**/spec/**/*.{ts,tsx}",
        "!**/node_modules/**",
    ],
    coverageDirectory: "coverage",
    coverageReporters: [
        "text",
        "text-summary",
        // "json",
        // "lcov",
        // "clover",
    ],
    projects: [{
        preset: "ts-jest",
        rootDir: process.cwd(),
        roots: [`./spec`],
        testEnvironment: "node",
        testRunner: "jest-circus/runner",

        globals: { JEST_PROJECT_PATH: process.cwd() },
    }],
};
