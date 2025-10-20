export declare class WebhookController {
    private hmacHex;
    receive(provider: string, sig: string | undefined, req: any): {
        received: boolean;
        provider: string;
        event: any;
    };
}
