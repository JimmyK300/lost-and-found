/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
      },
    ],
  },
  testMatch: ["**/tests/unit/**/*.test.(ts|tsx|js)"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};
