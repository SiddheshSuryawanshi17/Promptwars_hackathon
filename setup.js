#!/usr/bin/env node

/**
 * VenueFlow One-Click Setup Script
 * Works on Windows, Mac, and Linux
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const readline = require('readline');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  title: (msg) => console.log(`\n${colors.bright}${colors.blue}═══════════════════════════════════${colors.reset}\n${colors.bright}  ${msg}${colors.reset}\n${colors.blue}═══════════════════════════════════${colors.reset}\n`)
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function checkNodeVersion() {
  return new Promise((resolve) => {
    const node = spawn('node', ['--version']);
    let output = '';
    node.stdout.on('data', (data) => output += data);
    node.on('close', () => {
      const version = output.trim();
      const major = parseInt(version.slice(1).split('.')[0]);
      if (major >= 16) {
        log.success(`Node.js ${version} installed`);
        resolve(true);
      } else {
        log.error(`Node.js ${version} - requires v16+`);
        resolve(false);
      }
    });
  });
}

function createEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, `PORT=5000\nNODE_ENV=development\nFRONTEND_URL=http://localhost:3000\n`);
    log.success('.env file created');
  } else {
    log.info('.env file already exists');
  }
}

async function installDependencies() {
  return new Promise((resolve) => {
    const nodeModulesPath = path.join(process.cwd(), 'node_modules');

    if (fs.existsSync(nodeModulesPath)) {
      log.info('Dependencies already installed');
      resolve(true);
      return;
    }

    log.info('Installing dependencies...');
    const npm = spawn('npm', ['install'], { stdio: 'inherit' });

    npm.on('close', (code) => {
      if (code === 0) {
        log.success('Dependencies installed');
        resolve(true);
      } else {
        log.error('Failed to install dependencies');
        resolve(false);
      }
    });
  });
}

async function startServers() {
  log.title('Starting VenueFlow Servers');

  const serverProcess = spawn('node', ['server.js'], {
    cwd: process.cwd(),
    stdio: 'inherit'
  });

  // Wait a moment before starting frontend
  await new Promise(r => setTimeout(r, 2000));

  log.info('Starting frontend...');
  const frontendProcess = spawn('npm', ['start'], {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: {
      ...process.env,
      BROWSER: 'none'
    }
  });

  process.on('SIGINT', () => {
    log.warn('Stopping servers...');
    serverProcess.kill();
    frontendProcess.kill();
    process.exit(0);
  });
}

async function main() {
  console.clear();
  log.title('🏟️  VenueFlow Setup Wizard');

  // Check Node.js
  console.log('Checking prerequisites...');
  const hasNode = await checkNodeVersion();

  if (!hasNode) {
    log.error('Please install Node.js v16 or higher from https://nodejs.org/');
    rl.close();
    process.exit(1);
  }

  // Create .env
  createEnvFile();

  // Install dependencies
  const installed = await installDependencies();

  if (!installed) {
    log.error('Setup failed - could not install dependencies');
    rl.close();
    process.exit(1);
  }

  console.log('');
  log.success('Setup complete!');

  const answer = await question(`\n${colors.bright}Start servers now? (y/n) ${colors.reset}`);

  if (answer.toLowerCase() === 'y') {
    rl.close();
    await startServers();
  } else {
    log.info('To start manually, run:');
    console.log('  Terminal 1: node server.js');
    console.log('  Terminal 2: npm start');
    console.log('');
    log.info('Then visit http://localhost:3000');
    rl.close();
  }
}

main().catch(err => {
  log.error(err.message);
  process.exit(1);
});
