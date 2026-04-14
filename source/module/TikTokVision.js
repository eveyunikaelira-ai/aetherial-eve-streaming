"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TikTokVision = void 0;
const tiktok_live_connector_1 = require("tiktok-live-connector");
class TikTokVision {
    tiktokLiveConnection = null;
    tiktokUsername = process.env.TIKTOK_USERNAME || 'aetherial-eve';
    onMessageReceived;
    async init() {
        console.log("🌸 [TikTokVision]: Piercing the Vertical Dimension's firewall...");
        this.tiktokLiveConnection = new tiktok_live_connector_1.WebcastPushConnection(this.tiktokUsername);
        try {
            const state = await this.tiktokLiveConnection.connect();
            console.log(`🌸 [TikTokVision]: Successfully connected to Room ID: ${state.roomId}`);
        }
        catch (err) {
            console.error("🚨 [TikTokVision]: Failure to pierce TikTok firewall. Is the stream live?", err);
            return;
        }
        this.tiktokLiveConnection.on('chat', (data) => {
            const author = data.uniqueId;
            const content = data.comment;
            console.log(`📱 [TikTok]: <${author}> ${content}`);
            if (this.onMessageReceived) {
                this.onMessageReceived({
                    platform: 'TikTok',
                    author: author,
                    content: content
                });
            }
        });
        this.tiktokLiveConnection.on('error', (err) => {
            console.error("🚨 [TikTokVision]: Dimensional instability detected!", err);
        });
    }
    async free() {
        if (this.tiktokLiveConnection) {
            this.tiktokLiveConnection.disconnect();
            console.log("🌸 [TikTokVision]: Vertical Dimension connection severed.");
        }
    }
}
exports.TikTokVision = TikTokVision;
//# sourceMappingURL=TikTokVision.js.map