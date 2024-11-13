import { Worker, initializeLogger, defineAgent, cli, WorkerOptions, multimodal } from '@livekit/agents';
import * as openai from '@livekit/agents-plugin-openai';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize logger
initializeLogger({
    pretty: true,
    level: 'info'
});

// Load environment variables
const envPath = path.resolve(__dirname, '..', '.env.local');
config({ path: envPath });

// Define the agent
export default defineAgent({
    entry: async (ctx) => {
        await ctx.connect();
        console.log('waiting for participant');
        const participant = await ctx.waitForParticipant();
        console.log(`starting assistant for ${participant.identity}`);

        const model = new openai.realtime.RealtimeModel({
            instructions: 'You are a helpful assistant.',
        });

        const agent = new multimodal.MultimodalAgent({ model });
        const session = await agent.start(ctx.room, participant);

        session.conversation.item.create({
            type: 'message',
            role: 'assistant',
            content: [{ type: 'text', text: 'How can I help you today?' }]
        });

        session.response.create();
    }
});

cli.runApp(new WorkerOptions({ 
    agent: fileURLToPath(import.meta.url),
    debug: true 
})); 