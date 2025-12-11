import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Worker } from 'worker_threads';
import { join } from 'path';
import { randomUUID } from 'crypto';

interface PendingTask {
    resolve: (value: any) => void;
    reject: (reason: any) => void;
}

@Injectable()
export class WorkersService implements OnModuleDestroy {
    private worker: Worker;
    private pendingTasks: Map<string, PendingTask> = new Map();

    constructor() {
        // En desarrollo, el worker está en src/, en producción en dist/
        const workerPath = join(__dirname, 'hash.worker.js');
        this.worker = new Worker(workerPath);

        this.worker.on('message', (response: { id: string; success: boolean; result?: any; error?: string }) => {
            const task = this.pendingTasks.get(response.id);
            if (task) {
                this.pendingTasks.delete(response.id);
                if (response.success) {
                    task.resolve(response.result);
                } else {
                    task.reject(new Error(response.error || 'Worker error'));
                }
            }
        });

        this.worker.on('error', (error) => {
            console.error('Worker error:', error);
        });
    }

    async hashPassword(password: string): Promise<string> {
        return this.sendMessage({ type: 'hash', password });
    }

    async verifyPassword(hash: string, password: string): Promise<boolean> {
        return this.sendMessage({ type: 'verify', hash, password });
    }

    private sendMessage<T>(message: { type: string;[key: string]: any }): Promise<T> {
        return new Promise((resolve, reject) => {
            const id = randomUUID();
            this.pendingTasks.set(id, { resolve, reject });
            this.worker.postMessage({ ...message, id });
        });
    }

    onModuleDestroy() {
        this.worker.terminate();
    }
}
