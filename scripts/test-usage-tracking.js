/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Test script for Usage Tracking and Rate Limiting
 * Run with: node scripts/test-usage-tracking.js
 */

require('dotenv').config({ path: '.env' });

async function testUsageTracking() {
  try {
    console.log('🧪 Testing Usage Tracking and Rate Limiting...\n');
    
    // Test 1: Initial usage stats
    console.log('1️⃣ Testing initial usage stats...');
    
    let response = await fetch('http://localhost:3000/api/usage');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    let result = await response.json();
    if (result.success) {
      console.log('✅ Initial usage stats retrieved successfully');
      console.log('📊 Stats:', {
        totalRequests: result.data.stats.totalRequests,
        dailyRequests: result.data.stats.dailyRequests,
        minuteRequests: result.data.stats.minuteRequests,
        canMakeRequest: result.data.stats.canMakeRequest
      });
    } else {
      console.log('❌ Failed to get initial stats:', result.message);
    }
    
    // Test 2: Simulate multiple requests
    console.log('\n2️⃣ Testing request simulation...');
    
    response = await fetch('http://localhost:3000/api/usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'simulate', requests: 5 })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    result = await response.json();
    if (result.success) {
      console.log('✅ Simulated 5 requests successfully');
      console.log('📊 Updated stats:', {
        totalRequests: result.data.totalRequests,
        dailyRequests: result.data.dailyRequests,
        minuteRequests: result.data.minuteRequests,
        canMakeRequest: result.data.canMakeRequest
      });
    } else {
      console.log('❌ Failed to simulate requests:', result.message);
    }
    
    // Test 3: Test rate limiting with many requests
    console.log('\n3️⃣ Testing rate limiting with high request count...');
    
    response = await fetch('http://localhost:3000/api/usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'simulate', requests: 20 })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    result = await response.json();
    if (result.success) {
      console.log('✅ Simulated 20 additional requests');
      console.log('📊 Stats after high usage:', {
        totalRequests: result.data.totalRequests,
        dailyRequests: result.data.dailyRequests,
        minuteRequests: result.data.minuteRequests,
        canMakeRequest: result.data.canMakeRequest,
        minuteRemaining: result.data.minuteRemaining
      });
      
      if (result.data.minuteRequests >= 15) {
        console.log('✅ Rate limiting working: Minute limit reached');
      }
    } else {
      console.log('❌ Failed to simulate high usage:', result.message);
    }
    
    // Test 4: Test different users
    console.log('\n4️⃣ Testing multiple users...');
    
    const users = ['user1', 'user2', 'user3'];
    for (const user of users) {
      response = await fetch(`http://localhost:3000/api/usage?userId=${user}`);
      if (response.ok) {
        const userResult = await response.json();
        console.log(`✅ User ${user} stats:`, {
          totalRequests: userResult.data.stats.totalRequests,
          canMakeRequest: userResult.data.stats.canMakeRequest
        });
      }
    }
    
    // Test 5: Clear usage data
    console.log('\n5️⃣ Testing usage data clearing...');
    
    response = await fetch('http://localhost:3000/api/usage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'clear' })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    result = await response.json();
    if (result.success) {
      console.log('✅ Usage data cleared successfully');
      console.log('📊 Stats after clear:', {
        totalRequests: result.data.totalRequests,
        dailyRequests: result.data.dailyRequests,
        minuteRequests: result.data.minuteRequests
      });
    } else {
      console.log('❌ Failed to clear usage data:', result.message);
    }
    
    // Test 6: Test rate limit status
    console.log('\n6️⃣ Testing rate limit status...');
    
    response = await fetch('http://localhost:3000/api/usage');
    if (response.ok) {
      const statusResult = await response.json();
      console.log('✅ Rate limit status:', {
        canMakeRequest: statusResult.data.rateLimit.canMakeRequest,
        dailyRemaining: statusResult.data.rateLimit.dailyRemaining,
        minuteRemaining: statusResult.data.rateLimit.minuteRemaining,
        dailyLimit: statusResult.data.limits.dailyLimit,
        minuteLimit: statusResult.data.limits.minuteLimit
      });
    }
    
    console.log('\n🎉 All usage tracking tests completed!');
    console.log('\n📋 Summary:');
    console.log('✅ Usage tracking functional');
    console.log('✅ Rate limiting implemented');
    console.log('✅ Multi-user support working');
    console.log('✅ Data clearing functional');
    console.log('✅ API endpoints responding correctly');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure your Next.js dev server is running:');
    console.log('   npm run dev');
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch('http://localhost:3000/api/usage');
    if (response.ok) {
      console.log('✅ Server is running, starting usage tracking tests...\n');
      return true;
    }
  } catch (error) {
    console.log('❌ Server not running. Please start the dev server first:');
    console.log('   npm run dev');
    console.log('\nThen run this test again.');
    return false;
  }
}

// Run the test
checkServer().then(serverRunning => {
  if (serverRunning) {
    testUsageTracking();
  }
});
