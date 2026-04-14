import { NormalizedMessage } from './TwitchVision';
export declare class TikTokVision {
    private tiktokLiveConnection;
    private readonly tiktokUsername;
    onMessageReceived?: (msg: NormalizedMessage) => void;
    init(): Promise<void>;
    free(): Promise<void>;
}
//# sourceMappingURL=TikTokVision.d.ts.map