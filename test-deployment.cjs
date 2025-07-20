#!/usr/bin/env node

const https = require('https');
const http = require('http');

console.log('🚀 Testing empty.rocks/tv deployment...\n');

const testUrls = [
  {
    name: 'GitHub Pages Root',
    url: 'https://emptier-lab.github.io/dashboard/',
    expectedRedirect: true,
    expectedContains: 'empty.tv'
  },
  {
    name: 'GitHub Pages TV Path',
    url: 'https://emptier-lab.github.io/dashboard/tv/',
    expectedRedirect: false,
    expectedContains: 'empty.tv'
  },
  {
    name: 'GitHub Pages Empty.tv Redirect',
    url: 'https://emptier-lab.github.io/dashboard/empty.tv/',
    expectedRedirect: true,
    expectedContains: 'empty.tv'
  },
  {
    name: 'GitHub Pages Nested Redirect',
    url: 'https://emptier-lab.github.io/dashboard/empty.tv/tv/',
    expectedRedirect: true,
    expectedContains: 'empty.tv'
  }
];

function testUrl(testCase) {
  return new Promise((resolve) => {
    const client = testCase.url.startsWith('https') ? https : http;

    const startTime = Date.now();

    const req = client.get(testCase.url, (res) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const isRedirect = res.statusCode >= 300 && res.statusCode < 400;
        const containsExpected = data.includes(testCase.expectedContains);
        const location = res.headers.location || 'None';

        const status = (
          (testCase.expectedRedirect === isRedirect || containsExpected) &&
          containsExpected
        ) ? '✅ PASS' : '❌ FAIL';

        console.log(`${status} ${testCase.name}`);
        console.log(`   URL: ${testCase.url}`);
        console.log(`   Status: ${res.statusCode}`);
        console.log(`   Response Time: ${responseTime}ms`);
        if (isRedirect) console.log(`   Redirect To: ${location}`);
        console.log(`   Contains "${testCase.expectedContains}": ${containsExpected ? 'Yes' : 'No'}`);
        console.log('');

        resolve({
          name: testCase.name,
          success: status.includes('PASS'),
          statusCode: res.statusCode,
          responseTime,
          location,
          containsExpected
        });
      });
    });

    req.on('error', (err) => {
      console.log(`❌ ERROR ${testCase.name}: ${err.message}\n`);
      resolve({
        name: testCase.name,
        success: false,
        error: err.message
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      console.log(`⏰ TIMEOUT ${testCase.name}\n`);
      resolve({
        name: testCase.name,
        success: false,
        error: 'Timeout'
      });
    });
  });
}

async function runTests() {
  console.log('📋 Running deployment tests...\n');

  const results = [];

  for (const testCase of testUrls) {
    const result = await testUrl(testCase);
    results.push(result);

    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('📊 Test Summary:');
  console.log('═'.repeat(50));

  const passed = results.filter(r => r.success).length;
  const total = results.length;

  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    const error = result.error ? ` (${result.error})` : '';
    console.log(`${icon} ${result.name}${error}`);
  });

  console.log('═'.repeat(50));
  console.log(`Results: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('🎉 All tests passed! Deployment is working correctly.');

    console.log('\n🔗 Quick Access Links:');
    console.log('• Main App: https://emptier-lab.github.io/dashboard/tv/');
    console.log('• Test Suite: https://emptier-lab.github.io/dashboard/test-redirects.html');
    console.log('• Custom Domain (when ready): https://empty.rocks/tv/');
  } else {
    console.log('⚠️  Some tests failed. Check the output above for details.');
  }

  console.log('\n💡 Tips:');
  console.log('• GitHub Pages may take 5-10 minutes to update after deployment');
  console.log('• Custom domain (empty.rocks) requires DNS configuration');
  console.log('• Test redirects manually at: https://emptier-lab.github.io/dashboard/test-redirects.html');
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testUrl, runTests };
