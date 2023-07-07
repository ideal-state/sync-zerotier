import axios, { type AxiosInstance } from 'axios';

interface IpAssignmentPool {
    ipRangeStart: string;
    ipRangeEnd: string;
}

interface Route {
    target: string;
    via?: string | null;
}

interface NetworkConfig {
    name: string;
    ipAssignmentPools: IpAssignmentPool[];
    routes: Route[];
}

interface NetworkInfo {
    id: string;
    config: NetworkConfig;
}

interface MemberConfig {
    id: string;
    ipAssignments: string[];
}

interface MemberInfo {
    config: MemberConfig;
}

class ZerotierAPI {
    private readonly baseUrl: string = 'https://api.zerotier.com/api/v1';
    private readonly token: string;
    private readonly client: AxiosInstance;

    constructor(token: string, baseUrl?: string) {
        this.token = 'token ' + token;
        if (baseUrl != undefined) {
            this.baseUrl = baseUrl;
        }
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                Authorization: this.token,
            },
        });
    }

    public async getNetwork(networkId: string): Promise<NetworkInfo> {
        return (await this.client.get<NetworkInfo>(`/network/${networkId}`)).data;
    }

    public async getNetworks(): Promise<NetworkInfo[]> {
        return (await this.client.get<NetworkInfo[]>('/network')).data;
    }

    public async getMember(networkId: string, memberId: string): Promise<MemberInfo> {
        return (await this.client.get<MemberInfo>(`/network/${networkId}/member/${memberId}`)).data;
    }

    public async getMembers(networkId: string): Promise<MemberInfo[]> {
        return (await this.client.get<MemberInfo[]>(`/network/${networkId}/member`)).data;
    }

    public async updateNetwork(networkId: string, networkInfo: NetworkInfo) {
        await this.client.post(`/network/${networkId}`, networkInfo);
    }

    public async updateMember(networkId: string, memberId: string, memberInfo: MemberInfo) {
        await this.client.post(`/network/${networkId}/member/${memberId}`, memberInfo);
    }

    public async deleteNetwork(networkId: string) {
        await this.client.delete(`/network/${networkId}`);
    }

    public async deleteMember(networkId: string, memberId: string) {
        await this.client.delete(`/network/${networkId}/member/${memberId}`);
    }
}

export {
    type IpAssignmentPool,
    type Route,
    type NetworkConfig,
    type NetworkInfo,
    type MemberConfig,
    type MemberInfo,
    ZerotierAPI,
};
