#!/usr/bin/env node -r ../../../scripts/node_modules/esbuild-register

/* eslint-disable no-console */
import fs from 'fs-extra';
import path from 'path';
import { dedent } from 'ts-dedent';
import { exec } from '../../../../scripts/utils/exec';

import { values } from '../src/globals/runtime';

const removeDefault = (input: string) => input !== 'default';

const location = path.join(__dirname, '..', 'src', 'globals', 'exports.ts');

const run = async () => {
  const data = Object.entries(values).reduce<Record<string, string[]>>((acc, [key, value]) => {
    acc[key] = Object.keys(value).filter(removeDefault);
    return acc;
  }, {});

  console.log('Generating...');
  await fs.ensureFile(location);
  await fs.writeFile(
    location,
    dedent`
      // this file is generated by generate-exports-file.ts
      // this is done to prevent runtime dependencies from making it's way into the build/start script of the manager
      // the manager builder needs to know which dependencies are 'globalized' in the ui

      export default ${JSON.stringify(data, null, 2)} as const;`
  );

  console.log('Linting...');
  await exec(`yarn lint:js:cmd --fix ${location}`, {
    cwd: path.join(__dirname, '..', '..', '..'),
  });
  console.log('Done!');
};

run().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
