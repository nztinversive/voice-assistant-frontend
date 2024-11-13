import { Worker } from '@livekit/agents';
import { OpenAIAgent } from '@livekit/agents-plugin-openai';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
const envPath = path.resolve(__dirname, '..', '.env.local');
config({ path: envPath });

// Create a basic agent factory
const createAgent = async (job) => {
    try {
        console.log('Starting OpenAI agent');
        
        // Wait for participant
        console.log('Waiting for participant...');
        await job.waitForParticipant();
        
        // Create the agent
        return new OpenAIAgent({
            apiKey: process.env.OPENAI_API_KEY,
            model: 'gpt-4-vision-preview',
            debug: true,
            maxTokens: 1000,
            temperature: 0.7,
            multimodal: true
        });
    } catch (error) {
        console.error('Error creating agent:', error);
        throw error;
    }
};

// Create and start the worker
const worker = new Worker({
    agent: createAgent,
    apiKey: process.env.LIVEKIT_API_KEY,
    apiSecret: process.env.LIVEKIT_API_SECRET,
    wsUrl: process.env.LIVEKIT_URL,
    debug: true
});

// Start the worker with error handling
try {
    await worker.start();
    console.log('Worker started successfully');
} catch (error) {
    console.error('Failed to start worker:', error);
    process.exit(1);
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('Shutting down...');
    process.exit(0);
});

process.on('unhandledRejection', (error) => {
    console.error('Unhandled rejection:', error);
    process.exit(1);
});