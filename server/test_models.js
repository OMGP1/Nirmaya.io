/**
 * Gemini Model Tester
 * Tests different model names to find which one works with your API key
 */
require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const API_KEY = process.env.GEMINI_API_KEY;

// List of possible model names to test
const MODELS_TO_TEST = [
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-2.0-flash',
    'gemini-2.0-flash-exp',
    'gemini-pro',
    'gemini-1.0-pro',
];

async function testModel(modelName) {
    try {
        console.log(`\n🔄 Testing model: ${modelName}...`);

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent('Say hello in one word');
        const response = result.response.text();

        console.log(`✅ SUCCESS! Model "${modelName}" works!`);
        console.log(`   Response: ${response.substring(0, 50)}...`);
        return { modelName, success: true, response };

    } catch (error) {
        console.log(`❌ FAILED: ${modelName}`);
        console.log(`   Error: ${error.message.substring(0, 100)}`);
        return { modelName, success: false, error: error.message };
    }
}

async function main() {
    console.log('='.repeat(60));
    console.log('🤖 GEMINI MODEL TESTER');
    console.log('='.repeat(60));

    if (!API_KEY) {
        console.error('\n❌ ERROR: GEMINI_API_KEY not found in .env file!');
        console.log('Make sure your .env file contains:');
        console.log('GEMINI_API_KEY=your_api_key_here');
        process.exit(1);
    }

    console.log(`\n📝 API Key found: ${API_KEY.substring(0, 10)}...`);
    console.log(`\n🔍 Testing ${MODELS_TO_TEST.length} models...\n`);

    const results = [];

    for (const modelName of MODELS_TO_TEST) {
        const result = await testModel(modelName);
        results.push(result);

        // Small delay between tests
        await new Promise(r => setTimeout(r, 500));
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESULTS SUMMARY');
    console.log('='.repeat(60));

    const working = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`\n✅ Working models (${working.length}):`);
    working.forEach(r => console.log(`   - ${r.modelName}`));

    console.log(`\n❌ Failed models (${failed.length}):`);
    failed.forEach(r => console.log(`   - ${r.modelName}`));

    if (working.length > 0) {
        console.log(`\n🎉 RECOMMENDATION: Use "${working[0].modelName}" in your chatbot!`);
        console.log(`\nUpdate your chatbotController.js with:`);
        console.log(`   model: '${working[0].modelName}'`);
    } else {
        console.log('\n⚠️ No working models found. Check your API key or billing status.');
    }
}

main();
