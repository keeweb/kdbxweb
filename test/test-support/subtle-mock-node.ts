let SubtleMockNode;

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

if (global.process && global.process.versions && global.process.versions.node) {
    const nodeCrypto = require('crypto');

    SubtleMockNode = {
        subtle: {
            importKey(format: any, keyData: any) {
                const key = new ArrayBuffer(keyData.byteLength);
                new Uint8Array(key).set(new Uint8Array(keyData));
                return Promise.resolve(key);
            },
            encrypt(algo: any, key: any, cleartext: any) {
                return new Promise((resolve) => {
                    const cipher = nodeCrypto.createCipheriv(
                        'aes-256-cbc',
                        Buffer.from(new Uint8Array(key)),
                        Buffer.from(new Uint8Array(algo.iv))
                    );
                    let data = cipher.update(Buffer.from(new Uint8Array(cleartext)));
                    data = new Uint8Array(Buffer.concat([data, cipher.final()])).buffer;
                    resolve(data);
                });
            },
            decrypt(algo: any, key: any, cleartext: any) {
                return new Promise((resolve) => {
                    const cipher = nodeCrypto.createDecipheriv(
                        'aes-256-cbc',
                        Buffer.from(new Uint8Array(key)),
                        Buffer.from(new Uint8Array(algo.iv))
                    );
                    let data = cipher.update(Buffer.from(new Uint8Array(cleartext)));
                    data = new Uint8Array(Buffer.concat([data, cipher.final()])).buffer;
                    resolve(data);
                });
            },
            digest(format: any, data: any) {
                return new Promise((resolve) => {
                    resolve(
                        nodeCrypto
                            .createHash(format.name.replace('-', '').toLowerCase())
                            .update(Buffer.from(data))
                            .digest().buffer
                    );
                });
            },
            sign(algo: any, key: any, data: any) {
                return new Promise((resolve) => {
                    resolve(
                        nodeCrypto
                            .createHmac('sha256', Buffer.from(key))
                            .update(Buffer.from(data))
                            .digest().buffer
                    );
                });
            }
        },
        getRandomValues(arr: any) {
            for (let i = 0; i < arr.length; i++) {
                arr[i] = Math.random() * 255;
            }
        }
    };
}

export { SubtleMockNode };
