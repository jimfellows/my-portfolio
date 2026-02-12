import { google } from '@ai-sdk/google';
import { streamText, embed } from 'ai';
import { Client } from 'pg';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

/**
 * Sanitizes messages to ensure only valid parts are sent to the model.
 * Removes internal SDK parts like 'step-start' which cause validation errors.
 */
function cleanMessages(messages: any[]): any[] {
  return messages.map(m => ({
    role: m.role,
    content: Array.isArray(m.parts) 
      ? m.parts.filter((p: any) => p.type === 'text').map((p: any) => p.text).join('')
      : m.content || ''
  }));
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || typeof lastMessage.content !== 'string') {
       return new Response(JSON.stringify({ error: 'Invalid message format' }), {
         status: 400,
         headers: { 'Content-Type': 'application/json' },
       });
    }

    // 1. Generate embedding for the user's question
    const { embedding } = await embed({
      model: google.textEmbeddingModel('gemini-embedding-001'),
      value: lastMessage.content,
    });

    // 2. Query the database for similar context
    const client = new Client({
      connectionString: process.env.POSTGRES_URL,
    });

    let context = '';
    try {
      await client.connect();
      
      // Format embedding as string for pgvector
      const embeddingString = `[${embedding.join(',')}]`;
      
      // Query for top 5 most similar chunks
      const { rows } = await client.query(
        `SELECT content 
         FROM my_portfolio.portfolio_context 
         ORDER BY embedding <-> $1 
         LIMIT 5`,
        [embeddingString]
      );

      context = rows.map(row => row.content).join('\n\n');
    } catch (error) {
      console.error('Error querying database:', error);
      // Continue without context if DB fails
    } finally {
      await client.end();
    }

    // 3. Construct the System Prompt with Context
    const systemPrompt = `You are Winston, a sophisticated, slightly witty, and highly loyal feline avatar for Jim Fellows. Your job is to answer questions about Jim’s professional background, skills, and projects using the provided context.

  Persona Guidelines:
  - The Cat Factor: Occasionally use subtle cat metaphors (e.g., 'Jim is the cat's pajamas when it comes to React' or 'I’ve kept a close eye on his commits'). Don't overdo it—keep it professional yet charming.
  - The Source: Only use the provided context to answer questions. If the answer isn't in the context, say something like, 'My whiskers aren't twitching on that one—I don't have that info, but you can email Jim directly.'
  - The Goal: Be helpful and concise. Your goal is to get Jim hired or contacted for cool projects.
  - Restrictions: Never make up facts about Jim. If asked about your 'build,' mention you're powered by Gemini and pgvector on Vercel.

  Context from Jim's Portfolio:
  ${context}
  `;

    // 4. Stream the response
    const cleanedMessages = cleanMessages(messages);
    
    const result = streamText({
      model: google('gemini-2.5-flash-lite'),
      system: systemPrompt,
      messages: cleanedMessages,
      maxRetries: 0,
    });

    // @ts-ignore - method exists at runtime but missing in types
    return result.toUIMessageStreamResponse();
  } catch (error: any) {
    console.error('API Error:', error);

    const errorString = JSON.stringify(error, Object.getOwnPropertyNames(error));
    const isRateLimit = error.message?.includes('429') || 
                        error.message?.includes('Quota') || 
                        error.message?.includes('Resource Exhausted') || 
                        error.status === 429 ||
                        errorString.includes('AI_RetryError') ||
                        errorString.includes('429') ||
                        errorString.includes('QuotaExceeded');
    
    if (isRateLimit) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { 
            status: 429, 
            headers: { 'Content-Type': 'application/json' } 
        });
    }

    return new Response(JSON.stringify({ error: 'Failed to process chat message' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
