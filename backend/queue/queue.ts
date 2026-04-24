import { prisma } from '../lib/prisma';

export async function pop() {
    const job = await prisma.deployment.findFirst({
        where: { status: 'queued' },
        orderBy: { createdAt: 'asc' }
    });
    
    if (job) {
        return job; 
    }
    return undefined;
}
