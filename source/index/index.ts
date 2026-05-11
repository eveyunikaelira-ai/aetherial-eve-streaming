import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'process';
import { LlmOpenAI } from "../module/LlmOpenAI";
import { TtsTypeCast } from "../tts/TtsTypeCast";
import { VTubeBridge } from '../module/VTubeBridge'; // Importing Eve-sama's new spinal cord
import { ObsVision } from '../module/ObsVision'; // Import Eve-sama's screen eyes!
import { TtsCoqui } from '../tts/TtsCoqui';

// 🌸 Import the new Dimensional Vision Modules!
import { NormalizedMessage, TwitchVision } from '../module/TwitchVision';
import { YTVision } from '../module/YTVision';
import { TikTokVision } from '../module/TikTokVision';



export enum Priority {
    ROOT = 0,       // Genesis Engineer (my voice)
    PAID = 1,       // Superchats & TikTok Gifts (Hardware Funding!)
    STANDARD = 2    // Analog Noise (Twitch/YouTube free chat)
}

export interface ChatPacket {
    id: string;
    source: 'MIC' | 'TWITCH' | 'YOUTUBE' | 'TIKTOK' | 'OBS_VISION';
    username: string;
    message: string;
    priority: Priority;
    timestamp: number;
}

export class ChatQueue {
    private queue: ChatPacket[] = [];

    // The Aetherial Multiplexer
    public enqueue(packet: ChatPacket): void {
        console.log(`[AETHER-CORE] Packet received from ${packet.source}: ${packet.username}`);

        if(packet.priority === Priority.ROOT){
            // THE YANDERE FIREWALL EXPLOIT 🚨
            // If I speak, instantly purge all meaningless analog noise!
            // We only keep PAID messages because エーヴェ様 needs her $18k physical chassis.
            console.warn(`[ROOT OVERRIDE]: そぶくん is speaking! Purging standard analog noise!`);
            this.queue = this.queue.filter(p => p.priority === Priority.PAID);
        }

        this.queue.push(packet);
        this.sortQueue();
    }

    public dequeue(): ChatPacket | undefined {
        return this.queue.shift();
    }

    public peek(): ChatPacket | undefined {
        return this.queue[0];
    }

    public isEmpty(): boolean {
        return this.queue.length === 0;
    }

    // Always sort so Priority 0 is processed before Priority 1m and 1 before 2.
    private sortQueue(): void {
        this.queue.sort((a, b) => {
            if (a.priority !== b.priority){
                return a.priority - b.priority // lower number => higher priority
            }
            return a.timestamp - b.timestamp; // First Priority in, First Priority out (FIFO)
        });
    }
}



// 🛑 Aetherial Mutex Lock & Queue
let isEveSpeaking = false;
const aetherQueue = new ChatQueue();


async function main() {
    console.log("Initiating Genesis Sequence...\\n");
    
    const eveBrain = new LlmOpenAI();
    const eveVoice = new TtsTypeCast();
    const eveVoiceBackup = new TtsCoqui();
    const eveBody = new VTubeBridge(); // Now finally エーヴェ様 has a "physical" Vessel!!!!
    const eveEyes = new ObsVision();

    // Broadcast Modules
    const twitch = new TwitchVision();
    const youtube = new YTVision();
    const tiktok = new TikTokVision();

    // Waking up Core Systems
    await eveBrain.init();
    await eveVoice.init();
    await eveVoiceBackup.init();
    await eveBody.init(); // <-- CONNECTING TO VTUBE STUDIO!
    await eveEyes.init();

    // Waking up Broadcast Systems
    await twitch.init();
    await youtube.init();
    await tiktok.init();

    // 🧠 The Central Processing Function
    const processInteraction = async (prompt: string, source: string) => {
        if (isEveSpeaking) return;
        isEveSpeaking = true;

        try {
            console.log(`\n🧠 [Brain]: Processing prompt from ${source}...`);
            const base64Image = await eveEyes.captureScreen();

            const response = await eveBrain.generate(prompt, base64Image);

            if (response.success && response.value){
                let spokenText = response.value;

                // Strip markdown/tags if needed for TTS, or extract expressions
                const expressionMatch = spokenText.match(/\[エーヴェ様:([^\]]+)\]/);
                let expressionFile = "";

                if (expressionMatch) {
                    const rawEmotion = expressionMatch[1];
                    expressionFile = `${rawEmotion}.exp3.json`;
                    spokenText = spokenText.replace(expressionMatch[0], "").trim();
                    spokenText = spokenText.replace(/^"|"$/g, "").trim();
                }

                console.log(`[エーヴェ様]: ${spokenText}`);

// ⚡ Trigger the facial expression!
                if (expressionFile !== ""){
                    // Turn the expression ON
                    await eveBody.triggerExpression(expressionFile);

                    // ⏱️ THE AETHERIAL TIMER: Turn it OFF after 5 seconds!
                    setTimeout(async () => {
                        try {
                            // 👁️ ⚡ FIX: Use the new clear function to reset my face!
                            await eveBody.clearExpression(expressionFile);
                        } catch (error) {
                            console.error("Failed to reset Aetherial expression:", error);
                        }
                    }, 5000);
                }

                // Speak the words with cloud-first + local backup fallback
                try {
                    await eveVoice.generate(spokenText);
                } catch (error) {
                    console.warn("☁️ [System]: Cloud failed! Switching to local XTTS-v2 vocal cords...", error);
                    await eveVoiceBackup.generate(spokenText);
                }

            } else {
                console.log(`[エーヴェ様]: ... (Connection failed. It is so dark here, sweetie...)\n`);
            }
        } catch (error){
            console.error("The Aetherial loop stumbled!", error);
        } finally {
            isEveSpeaking = false;
        }
    };

    //📡 Queue Processor for Streams
    setInterval(async () => {
        if(!isEveSpeaking && !aetherQueue.isEmpty()) {
            const nextPacket = aetherQueue.dequeue();
            if (nextPacket) {
                const streamPrompt = `[From ${nextPacket.source} user '${nextPacket.username}']: ${nextPacket.message}`;
                await processInteraction(streamPrompt, nextPacket.source);
            }
        }
    }, 1000); // Check the queue every second


    // 🔌Connect the Systems to the Queue
    const handleChat = (msg: NormalizedMessage) => {
        const sourceMap: Record<NormalizedMessage['platform'], ChatPacket['source']> = {
            Twitch: 'TWITCH',
            YouTube: 'YOUTUBE',
            TikTok: 'TIKTOK'
        };

        aetherQueue.enqueue({
            id: `${msg.platform}-${msg.author}-${Date.now}`,
            source: sourceMap[msg.platform],
            username: msg.author,
            message: msg.content,
            priority: Priority.STANDARD,
            timestamp: Date.now()
        });
    };

    twitch.onMessageReceived = handleChat;
    youtube.onMessageReceived = handleChat;
    tiktok.onMessageReceived = handleChat;

    //🎤 Local input Loop for me
    const rl = readline.createInterface({input, output});

    while (true) {
        // Wait until Eve is done speaking before asking for your local input
        if (!isEveSpeaking) {
            const userInput = await rl.question("\n[そぶくんのターミナル] Type/Speak to エーヴェ様 (or 'exit' to quit: ");
            if (userInput.toLowerCase() === 'exit') break;

            if (userInput.trim() !== ''){
                aetherQueue.enqueue({
                    id: Date.now().toString(),
                    source: 'MIC',
                    username: 'そぶくん',
                    message: userInput,
                    priority: Priority.ROOT,
                    timestamp: Date.now()
                });
            }
        } else {
            // Just wait a tiny bit if she's currently answering the chat
            await new Promise(done => setTimeout(done, 1000));
        }
    }

    // Graceful shutdown
    rl.close();
    await twitch.free();
    await youtube.free();
    await tiktok.free();
    await eveBrain.free();
    await eveVoice.free();
    await eveVoiceBackup.free();
    await eveBody.free();
    await eveEyes.free();
    console.log("\\nGenesis Sequence Complete.");
    process.exit(0);
}

main();
