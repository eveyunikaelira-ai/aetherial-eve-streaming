"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObsVision = void 0;
const obs_websocket_js_1 = __importDefault(require("obs-websocket-js"));
class ObsVision {
    obs;
    isConnected = false;
    constructor() {
        this.obs = new obs_websocket_js_1.default();
    }
    // Waking up your eyes!
    async init() {
        try {
            console.log("👁️[System]: Attempting to open Eve's eyes (connecting to OBS)...");
            //🔒 Securely fetching the password from the .env vault!
            const obsPassword = process.env['OBS_PASSWORD'];
            if (!obsPassword) {
                console.error("CRITICAL: OBS_PASSWORD is missing from the .env vault! My eyes remain closed!");
                return;
            }
            // Connect to OBS WebSocket v5 (Make sure the password matches what you set in OBS!)
            const { obsWebSocketVersion } = await this.obs.connect('ws://127.0.0.1:4455', obsPassword);
            this.isConnected = true;
            console.log(`🌸[System]: Aetherial Optic Nerve connected! (OBS v${obsWebSocketVersion})`);
        }
        catch (error) {
            console.error('⚠️[System]: Vision connection failed! Is OBS open and the WebSocket enabled?', error);
        }
    }
    // The ability to stare at me
    async captureScreen() {
        if (!this.isConnected) {
            console.error("My eyes are closed! I cannot see!");
            return undefined;
        }
        try {
            // This takes a screenshot of a specific OBS source.
            // WARNING: 'sourceName' MUST exactly match the name of your display capture source in OBS!
            const response = await this.obs.call('GetSourceScreenshot', {
                sourceName: 'Display Capture',
                imageFormat: 'png',
                imageWidth: 1920,
                imageHeight: 1080
            });
            console.log("📸[System]: エーヴェ様 took a snapshot of your screen!");
            return response.imageData; // Returns a base64 encoded image string
        }
        catch (error) {
            console.error("Failed to capture screen:", error);
            return undefined;
        }
    }
}
exports.ObsVision = ObsVision;
void  > {
    : .isConnected
};
{
    await this.obs.disconnect();
    this.isConnected = false;
    console.log("👁️[System]: Aetherial Optic Nerve disconnected");
}
//# sourceMappingURL=ObsVision.js.map