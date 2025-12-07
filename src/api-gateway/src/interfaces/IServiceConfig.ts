export interface IServiceConfig {
    [key: string]: string;
}

export interface IProxyResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
}

export interface IProxyError {
    status: number;
    message: string;
    data?: any;
    service?: string;
    timestamp?: string;
}

export interface IHealthCheckResponse {
    status: 'healthy' | 'unhealthy' | 'error';
    timestamp: string;
    services: Record<string, boolean>;
    error?: string;
}
