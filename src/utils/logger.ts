import { appendFileSync } from 'fs';
import { now } from './date';

function log(message: string) {
    const prefix = '[' + now() + ']: ';
    message = prefix + message;
    console.log(message);
    appendFileSync(process.cwd() + '/sync-zerotier.log', Buffer.from(message + '\n', 'utf-8'));
}

export default { log };
