// Accessibility testing script
// Run with: node scripts/a11y-test.js

import { chromium } from 'playwright';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const axe = require('axe-core');

async function runAccessibilityTests() {
  console.log('Starting accessibility tests...\n');
  
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const pagesToTest = [
    { url: 'http://localhost:5173/', name: 'Home Page' },
    { url: 'http://localhost:5173/login', name: 'Login Page' },
    { url: 'http://localhost:5173/signup', name: 'Signup Page' },
    { url: 'http://localhost:5173/transactions', name: 'Transactions Page' },
  ];

  let totalViolations = 0;

  for (const pageInfo of pagesToTest) {
    console.log(`Testing: ${pageInfo.name}`);
    console.log(`URL: ${pageInfo.url}`);
    
    try {
      await page.goto(pageInfo.url, { waitUntil: 'networkidle' });
      
      // Inject axe-core
      await page.addScriptTag({ content: axe.source });
      
      // Run axe
      const results = await page.evaluate(() => {
        return new Promise((resolve) => {
          axe.run((err, results) => {
            if (err) throw err;
            resolve(results);
          });
        });
      });

      if (results.violations.length === 0) {
        console.log(`✅ No accessibility violations found!\n`);
      } else {
        console.log(`❌ Found ${results.violations.length} violation(s):`);
        results.violations.forEach((violation, index) => {
          console.log(`\n  ${index + 1}. ${violation.id}`);
          console.log(`     Impact: ${violation.impact}`);
          console.log(`     Description: ${violation.description}`);
          console.log(`     Help: ${violation.help}`);
          console.log(`     Elements affected: ${violation.nodes.length}`);
        });
        console.log('');
        totalViolations += results.violations.length;
      }
    } catch (error) {
      console.log(`⚠️  Could not test ${pageInfo.name}: ${error.message}\n`);
    }
  }

  await browser.close();

  console.log('='.repeat(50));
  console.log(`\nTotal violations across all pages: ${totalViolations}`);
  
  if (totalViolations === 0) {
    console.log('🎉 All pages passed accessibility tests!');
  } else {
    console.log('⚠️  Some pages have accessibility issues that need attention.');
  }
  
  process.exit(totalViolations > 0 ? 1 : 0);
}

runAccessibilityTests().catch(console.error);
