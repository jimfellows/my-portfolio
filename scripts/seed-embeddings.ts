import { google } from '@ai-sdk/google';
import { embedMany } from 'ai';
import { Client } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import pdf from 'pdf-parse';
import { parse } from 'csv-parse/sync';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function getDocuments() {
  const documents: { content: string; metadata: any }[] = [];

  // 1. Blog Posts
  const blogDir = path.join(process.cwd(), 'data', 'blog');
  if (fs.existsSync(blogDir)) {
    const blogFiles = fs.readdirSync(blogDir).filter(f => f.endsWith('.mdx') || f.endsWith('.md'));
    for (const file of blogFiles) {
      const filePath = path.join(blogDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      documents.push({
        content: `Blog Post: ${file}\n\n${content}`,
        metadata: { source: file, type: 'blog' },
      });
      console.log(`Processed blog post: ${file}`);
    }
  }

  // 2. Author Profile
  // (Adding a simple placeholder if it's missing, but the user's script seemed to have a comment for it)

  // 3. Resume PDF
  const resumeFile = path.join(process.cwd(), 'public', 'static', 'resume.pdf');
  if (fs.existsSync(resumeFile)) {
    const dataBuffer = fs.readFileSync(resumeFile);
    const data = await pdf(dataBuffer);
    documents.push({
      content: `Resume: Jim Fellows\n\n${data.text}`,
      metadata: { source: 'resume.pdf', type: 'resume' },
    });
    console.log('Processed resume.pdf');
  }

  const dw_api_instructions = path.join(process.cwd(), 'public', 'static', 'dw_api_instructions.pdf');
  if (fs.existsSync(dw_api_instructions)) {
    const dataBuffer = fs.readFileSync(dw_api_instructions);
    const data = await pdf(dataBuffer);
    documents.push({
      content: `FRAM Datawarehouse DW api instructions\n\n${data.text}`,
      metadata: { source: 'dw_api_instructions.pdf', type: 'API instructions' },
    });
    console.log('Processed dw_api_instructions.pdf');
  }

  const dw_api_metadata = path.join(process.cwd(), 'public', 'static', 'dw_api_metadata.csv');
  if (fs.existsSync(dw_api_metadata)) {
    const fileContent = fs.readFileSync(dw_api_metadata, 'utf8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });
    
    // Convert JSON records to a readable string format
    const csvString = records.map((r: any) => JSON.stringify(r)).join('\n');
    
    documents.push({
      content: `FRAM Datawarehouse DW api/table/column metadata\n\n${csvString}`,
      metadata: { source: 'dw_api_metadata.csv', type: 'API metadata' },
    });
    console.log('Processed dw_api_metadata.csv');
  }

  return documents;
}

async function chunkText(text: string, maxChunkSize = 1000) {
    // Simple chunking by paragraphs/newlines
    const chunks: string[] = [];
    let currentChunk = '';
    
    const lines = text.split('\n');
    for (const line of lines) {
        if (currentChunk.length + line.length > maxChunkSize) {
            chunks.push(currentChunk.trim());
            currentChunk = '';
        }
        currentChunk += line + '\n';
    }
    if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
    }
    return chunks;
}

async function seed() {
  const client = new Client({
    connectionString: process.env.POSTGRES_URL,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL');
    
    // Debug
    if (!process.env.POSTGRES_URL) {
        console.error('POSTGRES_URL is undefined!');
    } else {
        console.log('POSTGRES_URL is defined (length: ' + process.env.POSTGRES_URL.length + ')');
    }

    const docs = await getDocuments();
    console.log(`Found ${docs.length} documents`);

    // Flatten into chunks
    const chunksToEmbed: { content: string; metadata: any }[] = [];
    for (const doc of docs) {
        const chunks = await chunkText(doc.content);
        for (const chunk of chunks) {
            chunksToEmbed.push({
                content: chunk,
                metadata: doc.metadata
            });
        }
    }
    console.log(`Prepared ${chunksToEmbed.length} chunks for embedding`);

    // Generate Embeddings
    const { embeddings } = await embedMany({
      model: google.textEmbeddingModel('gemini-embedding-001'),
      values: chunksToEmbed.map(c => c.content),
    });
    console.log(`Generated ${embeddings.length} embeddings`);

    // Insert into DB
    // We'll insert one by one for simplicity in this script, or batch if possible.
    // pgvector format is a string '[1,2,3...]'
    for (let i = 0; i < chunksToEmbed.length; i++) {
        const chunk = chunksToEmbed[i];
        const embedding = embeddings[i];
        
        // Format embedding as vector string
        const embeddingString = `[${embedding.join(',')}]`;

        await client.query(
            `INSERT INTO my_portfolio.portfolio_context (content, metadata, embedding) VALUES ($1, $2, $3)`,
            [chunk.content, chunk.metadata, embeddingString]
        );
    }
    console.log('Inserted all embeddings into database');

  } catch (error) {
    console.error('Error validation:', error);
  } finally {
    await client.end();
  }
}

seed();
