export interface NormalizedMessage {
    platform: 'Twitch' | 'YouTube';
    author: string;
    content: string;
}
export declare class TwitchVision {
    private ws;
    private sessionId;
    private readonly clientId;
    private readonly oauthToken;
    private readonly broadcasterUserId;
    private readonly botUserId;
    onMessageReceived?: (msg: NormalizedMessage) => void;
    init(): Promise<void>;
    private subscribeToChat;
    free(): Promise<void>;
}
//# sourceMappingURL=TwitchVision.d.ts.map