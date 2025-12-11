import { parentPort } from 'worker_threads';
import * as argon from 'argon2';

interface HashMessage {
    type: 'hash';
    id: string;
    password: string;
}

interface VerifyMessage {
    type: 'verify';
    id: string;
    hash: string;
    password: string;
}

type WorkerMessage = HashMessage | VerifyMessage;

parentPort?.on('message', async (message: WorkerMessage) => {
    try {
        if (message.type === 'hash') {
            const hash = await argon.hash(message.password);
            parentPort?.postMessage({ id: message.id, success: true, result: hash });
        } else if (message.type === 'verify') {
            const isValid = await argon.verify(message.hash, message.password);
            parentPort?.postMessage({ id: message.id, success: true, result: isValid });
        }
    } catch (error) {
        parentPort?.postMessage({
            id: message.id,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
