/**
 * Patches ESLint's internal ajv.js to work with ajv v8 + ajv-draft-04.
 *
 * ESLint 10 bundles ajv v6 internally. When we override ajv to v8 (to fix
 * GHSA-2g4f-4pwh-qvx6), ESLint breaks because:
 *   1. ajv v8 doesn't ship `ajv/lib/refs/json-schema-draft-04.json`
 *   2. ajv v8 removed options: missingRefs, verbose, schemaId
 *
 * This script rewrites eslint's ajv.js to use ajv-draft-04 (a v8-compatible
 * wrapper that adds draft-04 support) and removes the obsolete options.
 */
import { writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const target = join(__dirname, "..", "node_modules", "eslint", "lib", "shared", "ajv.js");

if (!existsSync(target)) {
  console.log("patch-eslint-ajv: eslint not installed, skipping.");
  process.exit(0);
}

const patched = `\
"use strict";

const Ajv = require("ajv-draft-04");

module.exports = (additionalOptions = {}) => {
\tconst ajv = new Ajv({
\t\tuseDefaults: true,
\t\tvalidateSchema: false,
\t\tstrict: false,
\t\t...additionalOptions,
\t});

\treturn ajv;
};
`;

writeFileSync(target, patched);
console.log("patch-eslint-ajv: patched eslint/lib/shared/ajv.js for ajv v8 compatibility.");
