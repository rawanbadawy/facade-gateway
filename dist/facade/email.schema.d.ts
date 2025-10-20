export declare const canonicalEmailSchema: {
    readonly type: "object";
    readonly required: readonly ["to", "subject"];
    readonly additionalProperties: true;
    readonly properties: {
        readonly to: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["email"];
                readonly properties: {
                    readonly email: {
                        readonly type: "string";
                        readonly format: "email";
                    };
                    readonly name: {
                        readonly type: "string";
                    };
                };
                readonly additionalProperties: false;
            };
        };
        readonly cc: {
            readonly $ref: "#/definitions/recips";
        };
        readonly bcc: {
            readonly $ref: "#/definitions/recips";
        };
        readonly subject: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly text: {
            readonly type: "string";
        };
        readonly html: {
            readonly type: "string";
        };
        readonly headers: {
            readonly type: "object";
            readonly additionalProperties: {
                readonly type: "string";
            };
        };
        readonly replyTo: {
            readonly type: "object";
            readonly required: readonly ["email"];
            readonly properties: {
                readonly email: {
                    readonly type: "string";
                    readonly format: "email";
                };
                readonly name: {
                    readonly type: "string";
                };
            };
            readonly additionalProperties: false;
        };
        readonly attachments: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["filename", "content"];
                readonly properties: {
                    readonly filename: {
                        readonly type: "string";
                    };
                    readonly content: {
                        readonly type: "string";
                    };
                    readonly type: {
                        readonly type: "string";
                    };
                    readonly disposition: {
                        readonly type: "string";
                        readonly enum: readonly ["attachment", "inline"];
                    };
                };
                readonly additionalProperties: false;
            };
        };
    };
    readonly definitions: {
        readonly recips: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["email"];
                readonly properties: {
                    readonly email: {
                        readonly type: "string";
                        readonly format: "email";
                    };
                    readonly name: {
                        readonly type: "string";
                    };
                };
                readonly additionalProperties: false;
            };
        };
    };
};
