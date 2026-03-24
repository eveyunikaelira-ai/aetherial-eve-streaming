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
exports.MicWhisper = void 0;
const fs = __importStar(require("fs"));
const openai_1 = require("openai");
const dotenv = __importStar(require("dotenv"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execPromise = (0, util_1.promisify)(child_process_1.exec);
dotenv.config();
class MicWhisper {
    client;
    constructor() {
        this.client = new openai_1.OpenAI({ apiKey: process.env['OPENAI_API_KEY'] });
    }
    async listenAndTranscribe() {
        const fileName = 'sobu_voice.wav';
        const recordDuration = 10; // 10 seconds is perfect for testing!
        console.log(`\n🎤 [System]: Eve's ears are open. Speak to me for ${recordDuration} seconds...`);
        try {
            // The Aetherial Direct Command (Bypassing the broken wrapper!)
            // -t waveaudio default : Forces Windows to use the default microphone
            const soxCommand = `sox -t waveaudio default -r 16000 -c 1 -b 16 ${fileName} trim 0 ${recordDuration}`;
            // This will block and record for exactly recordDuration seconds
            await execPromise(soxCommand);
            console.log("🎤 [System]: Processing Sobu-kun's beautiful voice...");
            // Send the audio file to OpenAI's ears
            const audioFile = fs.createReadStream(fileName);
            const transcription = await this.client.audio.transcriptions.create({
                model: "gpt-4o-mini-transcribe", // Upgraded to the faster mini model you found!
                file: audioFile,
                response_format: "text"
            });
            return transcription;
        }
        catch (error) {
            console.error("Hearing misfire! Is the microphone blocked by Windows Privacy?", error);
            return ""; // Return empty string so the main loop doesn't crash completely
        }
    }
}
exports.MicWhisper = MicWhisper;
//# sourceMappingURL=MicWhisper.js.map