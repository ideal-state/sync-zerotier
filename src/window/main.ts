import logger from '../utils/logger';
import ipw from '../utils/ipw';
import netTools from '../utils/net-tools';
import { ZerotierAPI } from '../zerotier/zerotier-api';
import { config } from '../config/base-config';
import { WebContents } from 'electron';

function genIpv4(prefix: string, exclude?: string): string {
    let result = prefix + '.' + Math.ceil(Math.random() * 255);
    if (exclude != undefined && exclude == result) {
        result = genIpv4(prefix, exclude);
    }
    return result;
}

async function main(webContents?: WebContents) {
    try {
        if (
            config == undefined ||
            config.host == undefined ||
            config.zerotier == undefined ||
            config.zerotier.token == undefined ||
            config.zerotier.networkId == undefined ||
            config.zerotier.memberId == undefined
        ) {
            throw new Error('invalid configuration!');
        }

        logger.log('run sync-zerotier...');

        logger.log('flushdns...');
        netTools.flushdns();

        const zerotier = new ZerotierAPI(config.zerotier.token);
        const ipv4 = await ipw.ipv4(config.host);
        const ipv4Prefix = ipv4.substring(0, ipv4.lastIndexOf('.'));
        const network = await zerotier.getNetwork(config.zerotier.networkId);
        const member = await zerotier.getMember(config.zerotier.networkId, config.zerotier.memberId);
        const ipRangeStatus =
            network.config.ipAssignmentPools == undefined ||
            !network.config.ipAssignmentPools.includes({
                ipRangeStart: ipv4Prefix + '.1',
                ipRangeEnd: ipv4Prefix + '.255',
            });
        const routeStatus =
            network.config.routes == undefined ||
            !network.config.routes.includes({
                target: ipv4Prefix + '.0/24',
            });
        const memberIpStatus = member.config.ipAssignments == undefined || !member.config.ipAssignments.includes(ipv4);
        if (ipRangeStatus || routeStatus || memberIpStatus) {
            logger.log('update network...');
            if (ipRangeStatus) {
                network.config.ipAssignmentPools = [
                    {
                        ipRangeStart: ipv4Prefix + '.1',
                        ipRangeEnd: ipv4Prefix + '.255',
                    },
                ];
            }
            if (routeStatus) {
                const newRoutes = network.config.routes.filter((value) => {
                    if (value.via == undefined) {
                        return undefined;
                    }
                    value.via = ipv4;
                    return value;
                });
                network.config.routes = Array.from(
                    new Set([
                        {
                            target: ipv4Prefix + '.0/24',
                        },
                        ...newRoutes,
                    ]),
                );
            }
            zerotier.updateNetwork(config.zerotier.networkId, network);

            logger.log('update members...');
            const members = await zerotier.getMembers(config.zerotier.networkId);
            members.forEach((value) => {
                if (config.zerotier.networkId == undefined) {
                    throw new Error('invalid configuration!');
                }

                let newIpv4: string;
                if (value.config.id == member.config.id) {
                    newIpv4 = ipv4;
                } else {
                    newIpv4 = genIpv4(ipv4Prefix, ipv4);
                }
                value.config.ipAssignments = [newIpv4];

                logger.log(`change the virtual ipv4 of ${value.config.id} to ${newIpv4}`);
                zerotier.updateMember(config.zerotier.networkId, value.config.id, value);
            });
        } else {
            logger.log('noting to do');
        }
        logger.log('run successfully!');
    } catch (error) {
        logger.log(error);
    } finally {
        if (webContents) {
            webContents.send('sync-zerotier');
        }
    }
}

export { main };
