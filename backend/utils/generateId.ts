import crypto from 'crypto';

export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}
