abstract class DDNSClient {
    protected v4Api: string;
    protected v6Api: string;
    protected zone: string;
    protected username: string;
    protected password: string;

    protected constructor(v4Api: string, v6Api: string, zone: string, username: string, password: string) {
        this.v4Api = v4Api;
        this.v6Api = v6Api;
        this.zone = zone;
        this.username = username;
        this.password = password;
    }

    protected buildUrl(url: string, address: string): string {
        return url.replace('{zone}', this.zone).replace('{address}', address).replace('{token}', this.password);
    }

    public update(address?: string): { v4: any; v6: any } {
        return {
            v4: this.update4(address),
            v6: this.update6(address),
        };
    }

    public abstract update4(address?: string): any;

    public abstract update6(address?: string): any;
}

export { DDNSClient };
