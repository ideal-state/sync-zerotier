import { exit } from 'process';
import ipw from './utils/ipw';
import netTools from './utils/net-tools';
import { ZerotierAPI } from './zerotier/zerotier-api';

interface ZerotierConfig {
    token: string;
    networkId: string;
    memberId: string;
}

interface BaseConfig {
    host: string;
    zerotier: ZerotierConfig;
}

const config: BaseConfig = {
    host: 'xxxrull.dynv6.net',
    zerotier: {
        token: '56nbinRiOtidlQOckXbRrIUgVosGDFT3',
        networkId: 'b6079f73c6924c6c',
        memberId: 'cc18bd4114',
    },
};

function genIpv4(prefix: string, exclude?: string): string {
    let result = prefix + '.' + Math.ceil(Math.random() * 255);
    if (exclude != undefined && exclude == result) {
        result = genIpv4(prefix, exclude);
    }
    return result;
}

(async function main() {
    console.log('run sync-zerotier...');
    console.log('flushdns...');
    netTools.flushdns();

    const zerotier = new ZerotierAPI(config.zerotier.token);
    const ipv4 = await ipw.ipv4(config.host);
    const ipv4Prefix = ipv4.substring(0, ipv4.lastIndexOf('.'));
    const member = await zerotier.getMember(config.zerotier.networkId, config.zerotier.memberId);
    if (!member.config.ipAssignments.includes(ipv4)) {
        console.log('update network...');
        const network = await zerotier.getNetwork(config.zerotier.networkId);
        if (
            !network.config.ipAssignmentPools.includes({
                ipRangeStart: ipv4Prefix + '.1',
                ipRangeEnd: ipv4Prefix + '.255',
            })
        ) {
            network.config.ipAssignmentPools = [
                {
                    ipRangeStart: ipv4Prefix + '.1',
                    ipRangeEnd: ipv4Prefix + '.255',
                },
            ];
        }
        if (
            !network.config.routes.includes({
                target: ipv4Prefix + '.0/24',
            })
        ) {
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

        console.log('update members...');
        const members = await zerotier.getMembers(config.zerotier.networkId);
        members.forEach((value) => {
            let newIpv4: string;
            if (value.config.id == member.config.id) {
                newIpv4 = ipv4;
            } else {
                newIpv4 = genIpv4(ipv4Prefix, ipv4);
            }
            value.config.ipAssignments = [newIpv4];

            console.log(`change the virtual ipv4 of ${value.config.id} to ${newIpv4}`);
            zerotier.updateMember(config.zerotier.networkId, value.config.id, value);
        });
    } else {
        console.log('noting to do');
    }
    console.log('run successfully!');
})();

exit();
