// Simple Stripe test script
// Run with: node test-stripe.js

const Stripe = require('stripe');

// Load environment variables (you'll need to set these)
const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || 'sk_test_your_key_here',
);

async function testStripeConnection() {
  try {
    console.log('🧪 Testing Stripe connection...');

    // Test 1: List customers
    console.log('\n1. Testing customer listing...');
    const customers = await stripe.customers.list({ limit: 5 });
    console.log(`✅ Found ${customers.data.length} customers`);

    // Test 2: List products
    console.log('\n2. Testing product listing...');
    const products = await stripe.products.list({ limit: 5 });
    console.log(`✅ Found ${products.data.length} products`);

    // Test 3: List prices
    console.log('\n3. Testing price listing...');
    const prices = await stripe.prices.list({ limit: 5 });
    console.log(`✅ Found ${prices.data.length} prices`);

    // Test 4: Create a test customer
    console.log('\n4. Testing customer creation...');
    const testCustomer = await stripe.customers.create({
      email: 'test@example.com',
      name: 'Test User',
      metadata: {
        test: 'true',
      },
    });
    console.log(`✅ Created test customer: ${testCustomer.id}`);

    // Test 5: Delete test customer
    console.log('\n5. Cleaning up test customer...');
    await stripe.customers.del(testCustomer.id);
    console.log(`✅ Deleted test customer: ${testCustomer.id}`);

    console.log(
      '\n🎉 All Stripe tests passed! Your integration is working correctly.',
    );
  } catch (error) {
    console.error('\n❌ Stripe test failed:', error.message);

    if (error.type === 'StripeAuthenticationError') {
      console.error('🔑 Authentication failed. Check your STRIPE_SECRET_KEY.');
    } else if (error.type === 'StripeInvalidRequestError') {
      console.error('📝 Invalid request. Check your API parameters.');
    } else if (error.type === 'StripeAPIError') {
      console.error(
        '🌐 API error. Check your internet connection and Stripe status.',
      );
    }

    process.exit(1);
  }
}

// Run the test
testStripeConnection();
