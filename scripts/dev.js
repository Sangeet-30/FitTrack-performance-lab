#!/usr/bin/env node
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('\x1b[36m%s\x1b[0m', '🚀 Starting FitTrack Full-Stack (Backend API + Frontend Vite)...');

const backend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(rootDir, 'backend'),
  stdio: 'pipe',
  shell: true,
});

const frontend = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(rootDir, 'frontend'),
  stdio: 'pipe',
  shell: true,
});

function prefixOutput(stream, prefix, colorCode) {
  stream.on('data', (data) => {
    const text = data.toString();
    const lines = text.split('\n');
    for (const line of lines) {
      if (line.trim()) {
        console.log(`\x1b[${colorCode}m[${prefix}]\x1b[0m ${line}`);
      }
    }
  });
}

prefixOutput(backend.stdout, 'BACKEND', '34'); // Blue
prefixOutput(backend.stderr, 'BACKEND', '31'); // Red
prefixOutput(frontend.stdout, 'FRONTEND', '32'); // Green
prefixOutput(frontend.stderr, 'FRONTEND', '33'); // Yellow

const cleanExit = () => {
  console.log('\n\x1b[35m%s\x1b[0m', '🛑 Shutting down FitTrack full-stack servers...');
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit(0);
};

process.on('SIGINT', cleanExit);
process.on('SIGTERM', cleanExit);

