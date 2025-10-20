"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canonicalEmailSchema = void 0;
exports.canonicalEmailSchema = {
    type: 'object',
    required: ['to', 'subject'],
    additionalProperties: true,
    properties: {
        to: {
            type: 'array',
            minItems: 1,
            items: {
                type: 'object',
                required: ['email'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    name: { type: 'string' },
                },
                additionalProperties: false,
            },
        },
        cc: { $ref: '#/definitions/recips' },
        bcc: { $ref: '#/definitions/recips' },
        subject: { type: 'string', minLength: 1 },
        text: { type: 'string' },
        html: { type: 'string' },
        headers: {
            type: 'object',
            additionalProperties: { type: 'string' },
        },
        replyTo: {
            type: 'object',
            required: ['email'],
            properties: {
                email: { type: 'string', format: 'email' },
                name: { type: 'string' },
            },
            additionalProperties: false,
        },
        attachments: {
            type: 'array',
            items: {
                type: 'object',
                required: ['filename', 'content'],
                properties: {
                    filename: { type: 'string' },
                    content: { type: 'string' },
                    type: { type: 'string' },
                    disposition: { type: 'string', enum: ['attachment', 'inline'] },
                },
                additionalProperties: false,
            },
        },
    },
    definitions: {
        recips: {
            type: 'array',
            items: {
                type: 'object',
                required: ['email'],
                properties: {
                    email: { type: 'string', format: 'email' },
                    name: { type: 'string' },
                },
                additionalProperties: false,
            },
        },
    },
};
//# sourceMappingURL=email.schema.js.map