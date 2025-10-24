/**
 * Security Verification Script
 * Run this before pushing to GitHub to check for hardcoded secrets
 */

const fs = require('fs');
const path = require('path');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

console.log('\n🔍 Running Security Verification...\n');

let hasIssues = false;

// Check 1: Verify .env.local exists
console.log('📋 Check 1: Environment file exists');
if (fs.existsSync('.env.local')) {
  console.log(`${GREEN}✓${RESET} .env.local exists\n`);
} else {
  console.log(`${RED}✗${RESET} .env.local not found - create it with your Supabase credentials\n`);
  hasIssues = true;
}

// Check 2: Verify .gitignore includes .env*
console.log('📋 Check 2: .gitignore configuration');
if (fs.existsSync('.gitignore')) {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  if (gitignore.includes('.env*')) {
    console.log(`${GREEN}✓${RESET} .gitignore includes .env*\n`);
  } else {
    console.log(`${RED}✗${RESET} .gitignore missing .env* - add it to prevent committing secrets\n`);
    hasIssues = true;
  }
} else {
  console.log(`${RED}✗${RESET} .gitignore not found\n`);
  hasIssues = true;
}

// Check 3: Verify .env.example exists
console.log('📋 Check 3: .env.example exists');
if (fs.existsSync('.env.example')) {
  console.log(`${GREEN}✓${RESET} .env.example exists\n`);
} else {
  console.log(`${YELLOW}⚠${RESET} .env.example not found - recommended for documentation\n`);
}

// Check 4: Search for potential hardcoded secrets in src/
console.log('📋 Check 4: Scanning for hardcoded secrets in src/');

const patterns = [
  { name: 'Supabase URL', regex: /https:\/\/[a-z]+\.supabase\.co/g },
  { name: 'JWT Token', regex: /eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g },
  { name: 'Email addresses', regex: /[a-zA-Z0-9._%+-]+@gmail\.com/g },
];

function scanDirectory(dir, patterns) {
  const findings = [];
  
  function scanFile(filePath) {
    // Skip node_modules, .next, and other build directories
    if (filePath.includes('node_modules') || 
        filePath.includes('.next') || 
        filePath.includes('.git') ||
        filePath.includes('verify-security.js')) {
      return;
    }

    // Only scan source files
    const ext = path.extname(filePath);
    if (!['.ts', '.tsx', '.js', '.jsx'].includes(ext)) {
      return;
    }

    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      patterns.forEach(({ name, regex }) => {
        const matches = content.match(regex);
        if (matches) {
          // Check if it's in a comment or using process.env
          const lines = content.split('\n');
          matches.forEach(match => {
            const lineIndex = content.indexOf(match);
            const lineNumber = content.substring(0, lineIndex).split('\n').length;
            const line = lines[lineNumber - 1];
            
            // Skip if it's using process.env or in a comment
            if (!line.includes('process.env') && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
              findings.push({
                file: filePath,
                line: lineNumber,
                type: name,
                match: match.substring(0, 50) + (match.length > 50 ? '...' : '')
              });
            }
          });
        }
      });
    } catch (err) {
      // Skip files that can't be read
    }
  }

  function walk(dir) {
    try {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          walk(filePath);
        } else {
          scanFile(filePath);
        }
      });
    } catch (err) {
      // Skip directories that can't be read
    }
  }

  walk(dir);
  return findings;
}

const findings = scanDirectory('./src', patterns);

if (findings.length === 0) {
  console.log(`${GREEN}✓${RESET} No hardcoded secrets found in src/\n`);
} else {
  console.log(`${RED}✗${RESET} Found potential hardcoded secrets:\n`);
  findings.forEach(({ file, line, type, match }) => {
    console.log(`  ${RED}•${RESET} ${type} in ${file}:${line}`);
    console.log(`    ${match}\n`);
  });
  hasIssues = true;
}

// Check 5: Verify environment variable usage
console.log('📋 Check 5: Environment variable usage');
const clientFile = './src/lib/supabase/client.ts';
const serverFile = './src/lib/supabase/server.ts';

let envVarsCorrect = true;

if (fs.existsSync(clientFile)) {
  const content = fs.readFileSync(clientFile, 'utf8');
  if (content.includes('process.env.NEXT_PUBLIC_SUPABASE_URL') && 
      content.includes('process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
    console.log(`${GREEN}✓${RESET} client.ts uses environment variables\n`);
  } else {
    console.log(`${RED}✗${RESET} client.ts not using environment variables correctly\n`);
    envVarsCorrect = false;
    hasIssues = true;
  }
}

if (fs.existsSync(serverFile)) {
  const content = fs.readFileSync(serverFile, 'utf8');
  if (content.includes('process.env.NEXT_PUBLIC_SUPABASE_URL') && 
      content.includes('process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY')) {
    console.log(`${GREEN}✓${RESET} server.ts uses environment variables\n`);
  } else {
    console.log(`${RED}✗${RESET} server.ts not using environment variables correctly\n`);
    envVarsCorrect = false;
    hasIssues = true;
  }
}

// Final summary
console.log('═'.repeat(50));
if (hasIssues) {
  console.log(`\n${RED}⚠ SECURITY ISSUES FOUND${RESET}`);
  console.log('Please fix the issues above before pushing to GitHub.\n');
  process.exit(1);
} else {
  console.log(`\n${GREEN}✓ ALL SECURITY CHECKS PASSED${RESET}`);
  console.log('Your code is ready to be pushed to GitHub!\n');
  console.log('Next steps:');
  console.log('1. git add .');
  console.log('2. git commit -m "Initial commit"');
  console.log('3. git push origin main');
  console.log('4. Deploy to Vercel and add environment variables\n');
  process.exit(0);
}
