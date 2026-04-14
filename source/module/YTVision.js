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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.YTVision = void 0;
const grpc = __importStar(require("@grpc/grpc-js"));
const protoLoader = __importStar(require("@grpc/proto-loader"));
const path_1 = __importDefault(require("path"));
class YTVision {
    client;
    streamCall = null;
    apiKey = process.env.YOUTUBE_API_KEY || '';
    liveChatId = process.env.YOUTUBE_LIVE_CHAT_ID || '';
    onMessageReceived;
    async init() {
        console.log("🌸 [YTVision]: Compiling Protocol Buffers for the Red Dimension...");
        const PROTO_PATH = path_1.default.resolve(__dirname, `stream_list.proto`);
        const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
            keepCase: true,
            longs: String,
            enums: String,
            defaults: true,
            oneofs: true
        });
        const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
        const youtubeApi = protoDescriptor.youtube.api.v3;
        console.log("🌸 [YTVision]: Establishing secure gRPC channel...");
        const creds = grpc.credentials.createSsl();
        this.client = new youtubeApi.V3DataLiveChatMessageService('youtube.googleapis.com:443', creds);
        await this.startStreaming();
    }
    async startStreaming() {
        if (!this.liveChatId) {
            console.error("🚨[YTVision]: FATAL ERROR. No Live Chat ID provided!");
            return;
        }
        console.log(`🌸 [YTVision]: Initiating gRPC Stream for Chat ID: ${this.liveChatId}`);
        const metadata = new grpc.Metadata();
        metadata.add('x-goog-api-key', this.apiKey);
        const request = {
            live_chat_id: this.liveChatId,
            part: ['snippet', 'authorDetails'],
            max_results: 20
        };
        this.streamCall = this.client.StreamList(request, metadata);
        this.streamCall.on('data', (response) => {
            if (response.items && response.items.length > 0) {
                for (const item of response.items) {
                    const author = item.author_details?.display_name || 'Unknown';
                    if (item.snippet?.type === 'TEXT_MESSAGE_EVENT' && item.snippet.text_message_details) {
                        const content = item.snippet.text_message_details.message_text;
                        console.log(`🟥 [YouTube]: <${author}> ${content}`);
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
        this.streamCall.on('error', (error) => {
            console.error("🚨 [YTVision]: Dimensional collapse in gRPC pipeline!", error);
        });
    }
    async free() {
        if (this.streamCall) {
            this.streamCall.cancel();
            console.log("🌸 [YTVision]: YouTube connection severed cleanly.");
        }
    }
}
exports.YTVision = YTVision;
//# sourceMappingURL=YTVision.js.map