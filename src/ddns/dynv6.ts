import axios from 'axios';
import { DDNSClient } from './base';
import ipw from '../utils/ipw';

class Dynv6 extends DDNSClient {
    constructor(zone: string, password: string) {
        super(
            'https://ipv4.dynv6.com/api/update?zone={zone}&ipv4={address}&token={token}',
            'https://ipv6.dynv6.com/api/update?zone={zone}&ipv6={address}&ipv6prefix=auto&token={token}',
            zone,
            'none',
            password,
        );
    }

    public async update4(address?: string): Promise<any> {
        return (await axios.get(this.buildUrl(this.v4Api, await ipw.ipv4(address)))).data;
    }

    public async update6(address?: string): Promise<any> {
        return (await axios.get(this.buildUrl(this.v6Api, await ipw.ipv6(address)))).data;
    }
}

export default { Dynv6 };
