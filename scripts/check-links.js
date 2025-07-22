#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const BASE_PORT = 8080;
const TIMEOUT = 30000; // 30 seconds
const args = process.argv.slice(2);
const internalOnly = args.includes('--internal-only');
const verbose = args.includes('--verbose');

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkPrerequisites() {
  try {
    execSync('which python3', { stdio: 'ignore' });
  } catch (error) {
    log('❌ Python3 is required but not found. Please install Python3.', 'red');
    process.exit(1);
  }

  // Check for broken-link-checker
  try {
    execSync('which blc', { stdio: 'ignore' });
  } catch (error) {
    // Try to find it in npm global location
    try {
      execSync('npm list -g broken-link-checker', { stdio: 'ignore' });
    } catch (npmError) {
      log('📦 Installing broken-link-checker globally...', 'yellow');
      try {
        execSync('npm install -g broken-link-checker', { stdio: 'inherit' });
        log('✅ broken-link-checker installed successfully!', 'green');
      } catch (installError) {
        log('❌ Failed to install broken-link-checker. Please run: npm install -g broken-link-checker', 'red');
        log('  Or ensure your npm global bin directory is in your PATH', 'yellow');
        process.exit(1);
      }
    }
  }
}

function startServer() {
  return new Promise((resolve, reject) => {
    log(`🚀 Starting local server on port ${BASE_PORT}...`, 'blue');
    
    // Check if port is already in use
    const testConnection = spawn('curl', ['-s', `http://localhost:${BASE_PORT}`], {
      stdio: 'ignore'
    });
    
    testConnection.on('close', (code) => {
      if (code === 0) {
        log(`✅ Server already running on port ${BASE_PORT}`, 'green');
        resolve({ kill: () => {} }); // Return dummy server object
        return;
      }
      
      // Start new server
      const server = spawn('python3', ['-m', 'http.server', BASE_PORT.toString()], {
        stdio: verbose ? 'inherit' : 'ignore'
      });

      // Give server time to start
      setTimeout(() => {
        resolve(server);
      }, 2000); // Reduced from 3000ms for faster pre-commit

      server.on('error', (error) => {
        log(`❌ Failed to start server: ${error.message}`, 'red');
        reject(error);
      });
    });
  });
}

function checkInternalLinks() {
  return new Promise((resolve, reject) => {
    log('🔍 Checking internal links...', 'blue');
    
    const baseUrl = `http://localhost:${BASE_PORT}`;
    const files = ['index.html'];
    
    // Add subdirectory HTML files
    const subdirs = ['book', 'tinytorch', 'labs', 'kits'];
    subdirs.forEach(dir => {
      const htmlFile = path.join(dir, 'index.html');
      if (fs.existsSync(htmlFile)) {
        files.push(htmlFile);
      }
    });

    let hasErrors = false;
    let completed = 0;
    const total = files.length;

    files.forEach(file => {
      const url = `${baseUrl}/${file}`;
      log(`  Checking ${file}...`, 'blue');
      
      const blc = spawn('blc', [
        url,
        '--recursive',
        '--exclude-external',
        '--filter-level', '3',
        '--requests', '2'
      ]);

      let output = '';
      blc.stdout.on('data', (data) => {
        output += data.toString();
      });

      blc.stderr.on('data', (data) => {
        output += data.toString();
      });

      blc.on('close', (code) => {
        completed++;
        
        if (code !== 0) {
          log(`    ❌ ${file}: Found broken internal links`, 'red');
          if (verbose) {
            console.log(output);
          }
          hasErrors = true;
        } else {
          log(`    ✅ ${file}: All internal links OK`, 'green');
        }

        if (completed === total) {
          if (hasErrors) {
            reject(new Error('Internal link check failed'));
          } else {
            resolve();
          }
        }
      });
    });
  });
}

function checkExternalLinks() {
  return new Promise((resolve, reject) => {
    log('🌐 Checking external links (this may take a while)...', 'blue');
    
    const url = `http://localhost:${BASE_PORT}/index.html`;
    const blc = spawn('blc', [
      url,
      '--external-only',
      '--filter-level', '2',
      '--requests', '1',
      '--exclude', 'linkedin.com',
      '--exclude', 'twitter.com',
      '--exclude', 'facebook.com'
    ]);

    let output = '';
    blc.stdout.on('data', (data) => {
      output += data.toString();
    });

    blc.stderr.on('data', (data) => {
      output += data.toString();
    });

    blc.on('close', (code) => {
      if (code !== 0) {
        log('⚠️  Some external links may be broken (non-critical)', 'yellow');
        if (verbose) {
          console.log(output);
        }
      } else {
        log('✅ All external links OK', 'green');
      }
      // Don't fail on external link issues
      resolve();
    });
  });
}

function checkCommonIssues() {
  log('🔎 Checking for common link issues...', 'blue');
  
  const files = ['index.html'];
  const subdirs = ['book', 'tinytorch', 'labs', 'kits'];
  subdirs.forEach(dir => {
    const htmlFile = path.join(dir, 'index.html');
    if (fs.existsSync(htmlFile)) {
      files.push(htmlFile);
    }
  });

  let hasIssues = false;

  files.forEach(file => {
    if (!fs.existsSync(file)) return;
    
    const content = fs.readFileSync(file, 'utf8');
    
    // Check for doubled protocols
    if (content.includes('hhttps') || content.includes('hhttp')) {
      log(`❌ ${file}: Found doubled protocol (hhttps/hhttp)`, 'red');
      hasIssues = true;
    }
    
    // Check for localhost links
    if (content.includes('localhost') || content.includes('127.0.0.1')) {
      log(`❌ ${file}: Found localhost links`, 'red');
      hasIssues = true;
    }
    
    // Check for unclosed href attributes (basic check)
    const unclosedHref = /href="[^"]*$/gm;
    if (unclosedHref.test(content)) {
      log(`❌ ${file}: Found unclosed href attributes`, 'red');
      hasIssues = true;
    }
  });

  if (!hasIssues) {
    log('✅ No common link issues found', 'green');
  }

  return !hasIssues;
}

async function main() {
  log('🔗 MLSysBook Link Checker', 'bold');
  log('=' .repeat(40), 'blue');
  
  if (internalOnly) {
    log('ℹ️  Running in internal-only mode (faster)', 'yellow');
  }

  try {
    // Check prerequisites
    checkPrerequisites();
    
    // Start local server
    const server = await startServer();
    
    try {
      // Check common issues first (fast)
      const commonIssuesOk = checkCommonIssues();
      
      // Check internal links
      await checkInternalLinks();
      
      // Check external links (unless internal-only mode)
      if (!internalOnly) {
        await checkExternalLinks();
      }
      
      // Final result
      if (commonIssuesOk) {
        log('\n🎉 All link checks passed!', 'green');
        log('Your website is ready for deployment.', 'green');
      } else {
        throw new Error('Common issues found');
      }
      
    } finally {
      // Clean up server
      log('🧹 Cleaning up server...', 'blue');
      server.kill();
    }
    
  } catch (error) {
    log(`\n❌ Link check failed: ${error.message}`, 'red');
    log('Please fix the issues above before deploying.', 'red');
    process.exit(1);
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  log('\n👋 Link check interrupted by user', 'yellow');
  process.exit(0);
});

main(); 