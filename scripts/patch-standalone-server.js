/* eslint-disable no-console */
const { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs');
const { join, resolve } = require('path');

const rootDir = resolve(__dirname, '..');
const standaloneDir = join(rootDir, '.next', 'standalone');
const serverFile = join(standaloneDir, 'server.js');

if (!existsSync(standaloneDir)) {
  console.error('Standalone directory not found — skipping postbuild patch.');
  process.exit(0);
}

const staticSrc = join(rootDir, '.next', 'static');
const staticDst = join(standaloneDir, '.next', 'static');
if (existsSync(staticSrc) && !existsSync(staticDst)) {
  cpSync(staticSrc, staticDst, { recursive: true });
  console.log('Copied .next/static into standalone bundle.');
}

const publicDir = join(rootDir, 'public');
const publicDst = join(standaloneDir, 'public');
if (existsSync(publicDir) && !existsSync(publicDst)) {
  cpSync(publicDir, publicDst, { recursive: true });
  console.log('Copied public/ into standalone bundle.');
}

if (existsSync(serverFile)) {
  let content = readFileSync(serverFile, 'utf8');
  if (!content.includes('process.env.__NEXT_PRIVATE_STANDALONE')) {
    content = content.replace(
      /process\.env\.NODE_ENV/,
      'process.env.NODE_ENV || "production"',
    );
    writeFileSync(serverFile, content, 'utf8');
    console.log('Patched standalone server.js for Hostinger compatibility.');
  }
}

console.log('Postbuild patch complete.');
