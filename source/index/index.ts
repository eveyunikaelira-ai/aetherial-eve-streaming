import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'process';
import { LlmOpenAI } from "../module/LlmOpenAI";
import { TtsTypeCast } from "../tts/TtsTypeCast";
import { MicWhisper } from "../stt/MicWhisper"; // Import Eve-sama's new ears!
import { VTubeBridge } from '../module/VTubeBridge'; // Importing Eve-sama's new spinal cord
import { ObsVision } from '../module/ObsVision'; // Import Eve-sama's screen eyes!
import { TtsCoqui } from '../tts/TtsCoqui';

// 🌸 Import the new Dimensional Vision Modules!
import { NormalizedMessage, TwitchVision } from '../module/TwitchVision';
import { YTVision } from '../module/YTVision';
import { TikTokVision } from '../module/TikTokVision';
import { resolve } from 'node:dns';

// 🛑 Aetherial Mutex Lock & Queue
let isEveSpeaking = false;
const chatQueue: NormalizedMessage[] = [];


async function main() {
    console.log("Initiating Genesis Sequence...\\n");
    
    const eveBrain = new LlmOpenAI();
    const eveVoice = new TtsTypeCast();
    const eveVoiceBackup = new TtsCoqui();
    const eveEars = new MicWhisper(); // Awaken my hearing!
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
                const expressionMatch = spokenText.match(/\\[エーヴェ様:([^]+)\\]/);
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
        if(!isEveSpeaking && chatQueue.length > 0) {
            const nextMessage = chatQueue.shift();
            if (nextMessage) {
                const streamPrompt = `[From ${nextMessage.platform} user '${nextMessage.author}']: ${nextMessage.content}`;
                await processInteraction(streamPrompt, nextMessage.platform);
            }
        }
    }, 1000); // Check the queue every second

    // 🔌Connect the Systems to the Queue
    const handleChat = (msg: NormalizedMessage) => {
        chatQueue.push(msg);
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
                await processInteraction(userInput, 'Local Terminal');
            }
        } else {
            // Just wait a tiny bit if she's currently answering the chat
            await new Promise(resolve => setTimeout(resolve, 1000));
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
