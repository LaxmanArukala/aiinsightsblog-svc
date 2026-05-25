import OpenAI from 'openai';
import { config } from '../config';

let _groq: OpenAI | null = null;

function getGroq(): OpenAI {
  if (!_groq) {
    if (!config.groqApiKey) throw new Error('GROQ_API_KEY is not configured');
    _groq = new OpenAI({ apiKey: config.groqApiKey, baseURL: 'https://api.groq.com/openai/v1' });
  }
  return _groq;
}

export default getGroq;
