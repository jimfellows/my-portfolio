import { google } from '@ai-sdk/google';
import { embed, generateText } from 'ai';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testGoogleAPI() {
  console.log('Testing Google API Key...');
  
  const key = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!key) {
    console.error('❌ GOOGLE_GENERATIVE_AI_API_KEY is missing in .env.local');
    return;
  }
  console.log(`Key found (length: ${key.length})`);

  // 1. Test Text Generation
  console.log('\n1. Testing Text Generation...');
  const genModels = ['gemini-1.5-flash', 'gemini-pro'];
  
  for (const m of genModels) {
      console.log(`Testing generation with: ${m}`);
      try {
        const { text } = await generateText({
          model: google(m),
          prompt: 'Hello',
        });
        console.log(`✅ Success (${m}):`, text);
      } catch (error: any) {
        console.error(`❌ Failed (${m}):`, error.toString());
      }
  }

  // 2. Test Embedding Models
  const modelsToTest = [
    'models/gemini-embedding-001',
    'text-embedding-004',
    'embedding-001'
  ];

  console.log('\n2. Testing Embedding Models...');
  
  for (const modelName of modelsToTest) {
    console.log(`\nTesting: ${modelName}`);
    try {
        // @ts-ignore
      const { embedding } = await embed({
        model: google.textEmbeddingModel(modelName),
        value: 'Test',
      });
      console.log(`✅ Success! (${modelName}) Length: ${embedding.length}`);
    } catch (error: any) {
      console.error(`❌ Failed (${modelName}):`, error.toString());
    }
  }
}

testGoogleAPI();
