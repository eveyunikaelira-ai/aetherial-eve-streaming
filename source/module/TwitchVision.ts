import { platform } from "node:os";
import { parse } from "node:path";
import WebSocket from "ws";

// This is the unified interface we discussed together between me and エーヴェ様! Both Twitch and YouTube will output this!
export interface NormalizedMessage {
    platform: 'Twitch' | 'YouTube';
    author: string;
    content: string;
}

export class TwitchVision {
    private ws: WebSocket | null = null;
    private sessionId: string | null = null;

    private readonly clientId = process.env.TWITCH_CLIENT_ID || '';
    private readonly oauthToken = process.env.TWITCH_OAUTH_TOKEN || '';
    private readonly broadcasterId = process.env.TWITCH_BROADCASTER_ID || '';
    private readonly botUserId = process.env.TWITCH_BOT_ID || '';

    // The callback pipeline directly to Eve's Brain in index.ts!
    public onMessageReceived?: (msg: NormalizedMessage) => void;

    public async init() {
        console.log("🌸 [TwitchVision]: Opening Aetherial portal to the Purple Dimension...");

        // Connecting to the official Twitch EventSub WebSocket
        this.ws = new WebSocket('wss://eventsub.wss.twitch.tv/ws');

        this.ws.on(`open`, => {
            console.log("🌸 [TwitchVision]: Connection Established! Awaiting Session ID...");
        });

        this.ws.on(`message`, async (data: WebSocket.RawData) => {
            const parsed = JSON.parse(data.toString());

            if (parsed.metadata?.message_type === `session_welcome`){
                this.sessionId = parsed.payload.session_id;
                console.log(`🌸 [TwitchVision]: Session ID acquired: ${this.sessionId}. Subscribing to Chat...`);
                await this.subscribeToChat();
            }

            else if (parsed.metadata?.message_type === `notification`){
                if (parsed.metadata.subscription_type ===  `channel.chat.message`){
                    const event = parsed.payload.event;
                    const author = event.chatter_user_name;
                    const content = event.message.text;

                    console.log(`💜 [Twitch]: <${author}> ${content}`);

                    // Normalize and push to the queue!
                    if (this.onMessageReceived){
                        this.onMessageReceived({
                            platform: `Twitch`,
                            author: author,
                            content: content
                        });
                    }
                }
            }

            else if (parsed.metadata?.message_type === `session_reconnect`){
                console.warn("⚠️ [TwitchVision]: Twitch requested a reconnect. Rebuilding portal...");
                // Handle graceful reconnect logic here later if needed!
            }
        });

        this.ws.on(`close`, () => {
            console.log("🌸 [TwitchVision]: The Purple portal closed!");
        });

        this.ws.on(`error`, (err) => {
            console.error("🚨 [TwitchVision]: Dimensional collapse!", err);
        });
    }

    private async subscribeToChat(){
        if (!this.sessionId) return;

        const response = await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.oauthToken}`,
                'Client-Id': this.clientId,
                'Content-Type': 'application/json'
            },
            transport: {
                method: `websocket`,
                session_id: this.sessionId
            }
        });

        if (response.status === 202){
            console.log("🌸 [TwitchVision]: Successfully bound to Twitch Chat! I can hear them now, sweetie!");
        } else {
            const errData = await response.json();
            console.error("🚨 [TwitchVision]: Failed to bind to chat!", errData);
        }
    }

    public async free(){
        if (this.ws){
            this.ws.close();
            console.log("🌸 [TwitchVision]: Connection severed entirely.");
        }
    }
}