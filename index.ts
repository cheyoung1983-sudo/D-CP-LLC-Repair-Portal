import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config();

import { streamText } from 'ai';

async function main() {
  console.log('Sending request to AI Gateway using openai/gpt-4o-mini...\n');

  const result = streamText({
    model: 'openai/gpt-4o-mini',
    prompt: 'Explain quantum computing in three concise bullet points.',
  });

  for await (const textPart of result.textStream) {
    process.stdout.write(textPart);
  }

  const usage = await result.usage;
  console.log('\n\n--- Token Usage ---');
  console.log(usage);
}

main().catch((err) => {
  console.error('\nError running AI Gateway stream:', err);
  process.exit(1);
});
