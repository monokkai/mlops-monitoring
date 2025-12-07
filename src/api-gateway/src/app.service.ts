import { Injectable, Logger } from '@nestjs/common';
import { IProxyResponse, IServiceConfig } from './interfaces/IServiceConfig';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import axios, { AxiosRequestConfig } from 'axios';

@Injectable()
export class AppService {
  private readonly serviceConfig: IServiceConfig = {};
  private readonly logger = new Logger(AppService.name);

  private readonly services: IServiceConfig = {
    auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3000',
    ml: process.env.ML_SERVICE_URL || 'http://localhost:3001',
    app: process.env.APP_SERVICE_URL || 'http://localhost:3002',
    monitoring: process.env.MONITORING_SERVICE_URL || 'http://localhost:3003',
  };

  constructor(private readonly HttpService: HttpService) { }

  getServices(): IServiceConfig {
    return this.services;
  }

  async proxyRequest(
    service: string,
    path: string,
    method: string,
    body?: any,
    headers?: Record<string, string>
  ): Promise<any> {
    const serviceUrl = this.services[service];

    if (!serviceUrl) {
      throw this.logger.error(`Service ${service} not found`);
    }

    const url = `${serviceUrl}${path}`;
    this.logger.log(`Proxying request to ${url} with method ${method}`);

    const config: AxiosRequestConfig = {
      method: method as any,
      url,
      data: body,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      timeout: 5000,
    };

    try {
      const response = await axios(config);
      return response.data;
    } catch (error: any) {
      this.logger.error(`Error proxying request to ${url}: ${error.message}`);

      if (error.response) {
        throw {
          status: error.response.status,
          message: error.response.data?.message || error.message,
          data: error.response.data,
        };
      }

      throw {
        status: 500,
        message: error.message || 'Internal Server Error',
      };
    }
  }


  async healthCheck(): Promise<Record<string, boolean>> {
    const healthStatus: Record<string, boolean> = {};

    for (const [service, url] of Object.entries(this.services)) {
      try {
        const response = await axios.get(`${url}/health`, { timeout: 3000 });
        healthStatus[service] = response.status === 200;
      } catch (error) {
        this.logger.error(`Health check failed for ${service} at ${url}: ${error.message}`);
        healthStatus[service] = false;
      }
    }

    return healthStatus;
  }
}
