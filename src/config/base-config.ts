import { readFileSync, writeFileSync } from 'fs';
import logger from '../utils/logger';
import { now } from '../utils/date';

interface ZerotierConfig {
    token?: string;
    networkId?: string;
    memberId?: string;
}

interface BaseConfig {
    host?: string;
    zerotier: ZerotierConfig;
}

const config: BaseConfig = loadConfig();

function loadConfig(): BaseConfig {
    let config: BaseConfig = {
        host: undefined,
        zerotier: {
            token: undefined,
            networkId: undefined,
            memberId: undefined,
        },
    };
    try {
        const prefix = '[' + now() + ']: ';
        const message = prefix + 'load config...';
        console.log(message);
        writeFileSync(process.cwd() + '/sync-zerotier.log', Buffer.from(message + '\n', 'utf-8'));

        config = JSON.parse(readFileSync(process.cwd() + '/sync-zerotier.json', 'utf-8')) as BaseConfig;
    } catch (error) {
        logger.log(error);
    }
    return config;
}

function saveConfig() {
    try {
        logger.log('save config...');
        if (
            config == undefined ||
            config.host == undefined ||
            config.zerotier == undefined ||
            config.zerotier.token == undefined ||
            config.zerotier.networkId == undefined ||
            config.zerotier.memberId == undefined
        ) {
            return;
        }
        writeFileSync(
            process.cwd() + '/sync-zerotier.json',
            Buffer.from(JSON.stringify(config, undefined, 4), 'utf-8'),
        );
    } catch (error) {
        logger.log(error);
    }
}

export { config, saveConfig };
