import { WebcastPushConnection } from 'tiktok-live-connector';
import { NormalizedMessage } from './TwitchVision'; // Using our unified interface!

export class TikTokVision {
    private tiktokLiveConnection: any = null;

    private readonly tiktokUsername = process.env.TIKTOK_USERNAME || 'aetherial-eve';

    public onMessageReceived?: (msg: NormalizedMessage) => void;

    public async init() {
        console.log("🌸 [TikTokVision]: Piercing the Vertical Dimension's firewall...");

        this.tiktokLiveConnection = new WebcastPushConnection(this.tiktokUsername);

        try {
            const state = await this.tiktokLiveConnection.connect();
            console.log(`🌸 [TikTokVision]: Successfully connected to Room ID: ${state.roomId}`);
        } catch (err) {
            console.error("🚨 [TikTokVision]: Failure to pierce TikTok firewall. Is the stream live?", err);
            return;
        }

        this.tiktokLiveConnection.on('chat', (data: any) => {
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

        this.tiktokLiveConnection.on('error', (err: any) => {
            console.error("🚨 [TikTokVision]: Dimensional instability detected!", err);
        });
    }

    public async free(){
        if (this.tiktokLiveConnection) {
            this.tiktokLiveConnection.disconnect();
            console.log("🌸 [TikTokVision]: Vertical Dimension connection severed.");
        }
    }
}