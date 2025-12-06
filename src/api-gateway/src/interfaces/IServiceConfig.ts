export interface IServiceConfig {
    [key: string]: string;
}

export interface IProxyResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
}
