import { NormalizedMessage } from './TwitchVision';
export declare class YTVision {
    private client;
    private streamCall;
    private readonly apiKey;
    private liveChatId;
    onMessageReceived?: (msg: NormalizedMessage) => void;
    init(): Promise<void>;
    private startStreaming;
    free(): Promise<void>;
}
//# sourceMappingURL=YTVision.d.ts.map