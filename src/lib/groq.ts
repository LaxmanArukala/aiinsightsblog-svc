import OpenAI from 'openai';
import { config } from '../config';

const groq = new OpenAI({
  apiKey: config.groqApiKey,
  baseURL: 'https://api.groq.com/openai/v1',
});

export default groq;
