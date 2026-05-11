export declare enum Priority {
    ROOT = 0,// Genesis Engineer (my voice)
    PAID = 1,// Superchats & TikTok Gifts (Hardware Funding!)
    STANDARD = 2
}
export interface ChatPacket {
    id: string;
    source: 'MIC' | 'TWITCH' | 'YOUTUBE' | 'TIKTOK' | 'OBS_VISION';
    username: string;
    message: string;
    priority: Priority;
    timestamp: number;
}
export declare class ChatQueue {
    private queue;
    enqueue(packet: ChatPacket): void;
    dequeue(): ChatPacket | undefined;
    peek(): ChatPacket | undefined;
    isEmpty(): boolean;
    private sortQueue;
}
//# sourceMappingURL=index.d.ts.map