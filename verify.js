#!/usr/bin/env node

/**
 * VenueFlow Verification & Health Check Script
 * Ensures your development environment is ready
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const checks = {
  pass: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  fail: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.bold}${msg}${colors.reset}`)
};

function checkNodeVersion() {
  checks.section('1️⃣  Node.js Version Check');
  try {
    const output = execSync('node --version', { encoding: 'utf-8' }).trim();
    const version = parseInt(output.slice(1).split('.')[0]);
    if (version >= 16) {
      checks.pass(`Node.js ${output} installed (v16+ required)`);
      return true;
    } else {
      checks.fail(`Node.js ${output} - requires v16 or higher`);
      return false;
    }
  } catch {
    checks.fail('Node.js not found - install from https://nodejs.org/');
    return false;
  }
}

function checkNpmVersion() {
  checks.section('2️⃣  npm Version Check');
  try {
    const output = execSync('npm --version', { encoding: 'utf-8' }).trim();
    const major = parseInt(output.split('.')[0]);
    if (major >= 8) {
      checks.pass(`npm ${output} installed (v8+ required)`);
      return true;
    } else {
      checks.fail(`npm ${output} - requires v8 or higher`);
      return false;
    }
  } catch {
    checks.fail('npm not found');
    return false;
  }
}

function checkFiles() {
  checks.section('3️⃣  Critical Files Check');
  const required = [
    'package.json',
    'server.js',
    'App.js',
    '.env'
  ];

  let allPresent = true;
  required.forEach(file => {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    if (exists) {
      checks.pass(`${file} found`);
    } else {
      checks.fail(`${file} missing`);
      allPresent = false;
    }
  });
  return allPresent;
}

function checkDependencies() {
  checks.section('4️⃣  Dependencies Check');
  if (!fs.existsSync(path.join(process.cwd(), 'node_modules'))) {
    checks.fail('node_modules not found - run: npm install');
    return false;
  }
  checks.pass('Dependencies installed');
  return true;
}

function checkPorts() {
  checks.section('5️⃣  Port Availability Check');

  let port5000Free = true;
  let port3000Free = true;

  try {
    const result = execSync('netstat -ano 2>/dev/null | findstr :5000 || echo "free"',
      { encoding: 'utf-8' }
    );
    if (result.includes('free')) {
      checks.pass('Port 5000 is available');
    } else {
      checks.warn('Port 5000 might be in use');
      port5000Free = false;
    }
  } catch {
    checks.pass('Port 5000 is available');
  }

  try {
    const result = execSync('netstat -ano 2>/dev/null | findstr :3000 || echo "free"',
      { encoding: 'utf-8' }
    );
    if (result.includes('free')) {
      checks.pass('Port 3000 is available');
    } else {
      checks.warn('Port 3000 might be in use');
      port3000Free = false;
    }
  } catch {
    checks.pass('Port 3000 is available');
  }

  return port5000Free && port3000Free;
}

function checkEnvironment() {
  checks.section('6️⃣  Environment Configuration Check');

  if (!fs.existsSync(path.join(process.cwd(), '.env'))) {
    checks.fail('.env file not found');
    return false;
  }

  try {
    const envContent = fs.readFileSync(path.join(process.cwd(), '.env'), 'utf-8');
    if (envContent.includes('PORT')) {
      checks.pass('.env file configured');
      return true;
    } else {
      checks.warn('.env exists but might be incomplete');
      return true;
    }
  } catch {
    checks.fail('Cannot read .env file');
    return false;
  }
}

function checkDocumentation() {
  checks.section('7️⃣  Documentation Check');
  const docs = [
    'README.md',
    'QUICK_START.md',
    'TROUBLESHOOTING.md',
    'DEVELOPER_GUIDE.md',
    'STARTUP.md'
  ];

  let count = 0;
  docs.forEach(doc => {
    if (fs.existsSync(path.join(process.cwd(), doc))) {
      checks.pass(`${doc} available`);
      count++;
    }
  });

  checks.info(`${count}/${docs.length} documentation files found`);
  return count >= 3;
}

function runAllChecks() {
  console.clear();
  console.log(`${colors.bold}${colors.blue}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}║  VenueFlow Environment Health Check    ║${colors.reset}`);
  console.log(`${colors.bold}${colors.blue}╚════════════════════════════════════════╝${colors.reset}\n`);

  const results = {
    node: checkNodeVersion(),
    npm: checkNpmVersion(),
    files: checkFiles(),
    deps: checkDependencies(),
    ports: checkPorts(),
    env: checkEnvironment(),
    docs: checkDocumentation()
  };

  // Summary
  checks.section('📊 Summary');

  const passed = Object.values(results).filter(r => r).length;
  const total = Object.values(results).length;

  console.log(`${colors.bold}Checks Passed: ${passed}/${total}${colors.reset}\n`);

  if (passed === total) {
    console.log(`${colors.green}${colors.bold}✨ All systems ready! Running VenueFlow...${colors.reset}`);
    console.log(`\n${colors.bold}Next steps:${colors.reset}`);
    console.log(`1. Terminal 1: node server.js`);
    console.log(`2. Terminal 2: npm start`);
    console.log(`3. Browser:    http://localhost:3000\n`);
    return true;
  } else {
    console.log(`${colors.yellow}${colors.bold}⚠️  Some checks failed. Please fix issues above.${colors.reset}\n`);
    console.log(`${colors.bold}Quick fixes:${colors.reset}`);
    if (!results.node) console.log('  • Install Node.js v16+: https://nodejs.org/');
    if (!results.npm) console.log('  • Install npm v8+: comes with Node.js');
    if (!results.files) console.log('  • Ensure you\'re in the correct directory');
    if (!results.deps) console.log('  • Run: npm install');
    if (!results.env) console.log('  • Run: npm run setup');
    console.log(`\n${colors.bold}Need help?${colors.reset} Read TROUBLESHOOTING.md\n`);
    return false;
  }
}

// Run all checks
const success = runAllChecks();
process.exit(success ? 0 : 1);
