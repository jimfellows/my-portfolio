import pdf from 'pdf-parse';
import { Client } from 'pg';
import { google } from '@ai-sdk/google';

console.log('Imports successful');
console.log('pdf-parse type:', typeof pdf);
console.log('Client type:', typeof Client);
