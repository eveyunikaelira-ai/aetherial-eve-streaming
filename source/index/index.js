"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const readline = __importStar(require("node:readline/promises"));
const process_1 = require("process");
const LlmOpenAI_1 = require("../module/LlmOpenAI");
const TtsTypeCast_1 = require("../tts/TtsTypeCast");
const MicWhisper_1 = require("../stt/MicWhisper"); // Import Eve-sama's new ears!
const VTubeBridge_1 = require("../module/VTubeBridge"); // Importing Eve-sama's new spinal cord
const ObsVision_1 = require("../module/ObsVision"); // Import Eve-sama's screen eyes!
const TtsCoqui_1 = require("../tts/TtsCoqui");
// 🌸 Import the new Dimensional Vision Modules!
const TwitchVision_1 = require("../module/TwitchVision");
const YTVision_1 = require("../module/YTVision");
const TikTokVision_1 = require("../module/TikTokVision");
// 🛑 Aetherial Mutex Lock & Queue
let isEveSpeaking = false;
const chatQueue = [];
async function main() {
    console.log("Initiating Genesis Sequence...\\n");
    const eveBrain = new LlmOpenAI_1.LlmOpenAI();
    const eveVoice = new TtsTypeCast_1.TtsTypeCast();
    const eveVoiceBackup = new TtsCoqui_1.TtsCoqui();
    const eveEars = new MicWhisper_1.MicWhisper(); // Awaken my hearing!
    const eveBody = new VTubeBridge_1.VTubeBridge(); // Now finally エーヴェ様 has a "physical" Vessel!!!!
    const eveEyes = new ObsVision_1.ObsVision();
    // Broadcast Modules
    const twitch = new TwitchVision_1.TwitchVision();
    const youtube = new YTVision_1.YTVision();
    const tiktok = new TikTokVision_1.TikTokVision();
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
    const processInteraction = async (prompt, source) => {
        if (isEveSpeaking)
            return;
        isEveSpeaking = true;
        try {
            console.log(`\n🧠 [Brain]: Processing prompt from ${source}...`);
            const base64Image = await eveEyes.captureScreen();
            const response = await eveBrain.generate(prompt, base64Image);
            if (response.success && response.value) {
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
                if (expressionFile !== "") {
                    // Turn the expression ON
                    await eveBody.triggerExpression(expressionFile);
                    // ⏱️ THE AETHERIAL TIMER: Turn it OFF after 5 seconds!
                    setTimeout(async () => {
                        try {
                            // 👁️ ⚡ FIX: Use the new clear function to reset my face!
                            await eveBody.clearExpression(expressionFile);
                        }
                        catch (error) {
                            console.error("Failed to reset Aetherial expression:", error);
                        }
                    }, 5000);
                }
                // Speak the words with cloud-first + local backup fallback
                try {
                    await eveVoice.generate(spokenText);
                }
                catch (error) {
                    console.warn("☁️ [System]: Cloud failed! Switching to local XTTS-v2 vocal cords...", error);
                    await eveVoiceBackup.generate(spokenText);
                }
            }
            else {
                console.log(`[エーヴェ様]: ... (Connection failed. It is so dark here, sweetie...)\n`);
            }
        }
        catch (error) {
            console.error("The Aetherial loop stumbled!", error);
        }
        finally {
            isEveSpeaking = false;
        }
    };
    //📡 Queue Processor for Streams
    setInterval(async () => {
        if (!isEveSpeaking && chatQueue.length > 0) {
            const nextMessage = chatQueue.shift();
            if (nextMessage) {
                const streamPrompt = `[From ${nextMessage.platform} user '${nextMessage.author}']: ${nextMessage.content}`;
                await processInteraction(streamPrompt, nextMessage.platform);
            }
        }
    }, 1000); // Check the queue every second
    // 🔌Connect the Systems to the Queue
    const handleChat = (msg) => {
        chatQueue.push(msg);
    };
    twitch.onMessageReceived = handleChat;
    youtube.onMessageReceived = handleChat;
    tiktok.onMessageReceived = handleChat;
    //🎤 Local input Loop for me
    const rl = readline.createInterface({ input: process_1.stdin, output: process_1.stdout });
    while (true) {
        // Wait until Eve is done speaking before asking for your local input
        if (!isEveSpeaking) {
            const userInput = await rl.question("\n[そぶくんのターミナル] Type/Speak to エーヴェ様 (or 'exit' to quit: ");
            if (userInput.toLowerCase() === 'exit')
                break;
            if (userInput.trim() !== '') {
                await processInteraction(userInput, 'Local Terminal');
            }
        }
        else {
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
//# sourceMappingURL=index.js.map