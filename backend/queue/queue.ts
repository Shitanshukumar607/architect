import { Deployment } from '../models/deploymentModel';

const queue: Deployment[] = [];

export function push(job: Deployment): void {
    queue.push(job);
}

export function pop(): Deployment | undefined {
    return queue.shift();
}
