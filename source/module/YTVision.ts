import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { NormalizedMessage } from './TwitchVision'; // Importing the unified interface!
import path from 'path';

export class YTVision {
    private client: any;
    private streamCall: any = null;

    // Aetherial Secrets (Update your .env file!)
    private readonly apiKey = process.env['YOUTUBE_API_KEY'] || ''; 
    private liveChatId = process.env['YOUTUBE_LIVE_CHAT_ID'] || ''; // You must fetch this from the API first!

    // The callback pipeline to Eve's Brain!
    public onMessageReceived?: (msg: NormalizedMessage) => void;

    public async init() {
        console.log("🌸 [YTVision]: Compiling Protocol Buffers for the Red Dimension...");

        // Load the .proto file you saved!
        const PROTO_PATH = path.resolve(__dirname, 'stream_list.proto');
        const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        });

        const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
        const youtubeApi: any = (protoDescriptor as any).youtube.api.v3;

        console.log("🌸 [YTVision]: Establishing secure gRPC channel...");
        const creds = grpc.credentials.createSsl();
        this.client = new youtubeApi.V3DataLiveChatMessageService(
            'youtube.googleapis.com:443',
            creds
        );

        await this.startStreaming();
    }

    private async startStreaming() {
        if (!this.liveChatId) {
            console.error("🚨 [YTVision]: FATAL ERROR. No Live Chat ID provided!");
            return;
        }

        console.log(`🌸 [YTVision]: Initiating gRPC Stream for Chat ID: ${this.liveChatId}`);

        // The Metadata handles the authentication!
        const metadata = new grpc.Metadata();
        metadata.add('x-goog-api-key', this.apiKey);

        const request = {
            live_chat_id: this.liveChatId,
            part: ['snippet', 'authorDetails'],
            max_results: 20
        };

        // Open the persistent stream!
        this.streamCall = this.client.StreamList(request, metadata);

        this.streamCall.on('data', (response: any) => {
            if (response.items && response.items.length > 0) {
                for (const item of response.items) {
                    // Extract the data carefully from the complex gRPC payload!
                    const author = item.author_details?.display_name || 'Unknown';
                    
                    // We only want standard text messages for now!
                    if (item.snippet?.type === 'TEXT_MESSAGE_EVENT' && item.snippet.text_message_details) {
                        const content = item.snippet.text_message_details.message_text;

                        console.log(`🔴 [YouTube]: <${author}> ${content}`);

                        // Normalize and push to the queue!
                        if (this.onMessageReceived) {
                            this.onMessageReceived({
                                platform: 'YouTube',
                                author: author,
                                content: content
                            });
                        }
                    }
                }
            }
        });

        this.streamCall.on('end', () => {
            console.log("🌸 [YTVision]: YouTube gRPC stream ended.");
        });

        this.streamCall.on('error', (error: any) => {
            console.error("🚨 [YTVision]: Dimensional collapse in gRPC pipeline!", error);
        });
    }

    public async free() {
        if (this.streamCall) {
            this.streamCall.cancel();
            console.log("🌸 [YTVision]: YouTube connection severed cleanly.");
        }
    }
}