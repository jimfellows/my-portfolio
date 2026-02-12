
import dotenv from 'dotenv';
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

async function main() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  console.log('API Key present:', !!apiKey);

  const modelName = 'gemini-2.5-flash-lite';
  console.log(`Testing model: ${modelName}`);


  try {
    const result = await streamText({
      model: google(modelName),
      system: "You are a helpful assistant.",
      messages: [
        { role: 'user', content: 'Hello, are you working?' }
      ],
    });
    console.log('Stream created.');
    
    // Dump keys to file to avoid truncation
    const fs = require('fs');
    const keys = {
        ownKeys: Object.keys(result),
        protoKeys: Object.getOwnPropertyNames(Object.getPrototypeOf(result)),
        protoProtoKeys: Object.getOwnPropertyNames(Object.getPrototypeOf(Object.getPrototypeOf(result) || {}))
    };
    fs.writeFileSync('debug_keys.json', JSON.stringify(keys, null, 2));
    console.log('Keys dumped to debug_keys.json');

    // Just exit
    process.exit(0);

  } catch (error: any) {
    console.error('Error streaming text:', error);
    if (error.responseBody) {
        console.error('Response body:', error.responseBody);
    }
  }
}

main().catch(console.error);
