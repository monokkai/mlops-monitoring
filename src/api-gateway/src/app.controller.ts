import { Body, Controller, Get, HttpStatus, Param, Headers, Query, Post, Put, Delete, Patch } from '@nestjs/common';
import { AppService } from './app.service';
import { IHealthCheckResponse, IProxyError } from './interfaces/IServiceConfig';
import { Request, Response } from 'express';
import { Res, Req } from '@nestjs/common';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  private extractPath(originalUrl: string, service: string): string {
    const prefix = `api/${service}`;

    if (originalUrl.startsWith(prefix)) {
      return originalUrl.slice(prefix.length) || '/';
    }
    return originalUrl;
  }

  private errorsHandler(error: IProxyError, res: Response) {
    const status = error.status || 500;
    const errorResponse = {
      statusCode: status,
      message: error.message || "Internal Server Error",
      service: error.service || "unknown",
      timestamp: error.timestamp || new Date().toISOString(),
      ...(error.data && { details: error.data }),
    }

    return res.status(status).json(errorResponse);
  }

  @Get("health")
  async health(@Res() res: Response): Promise<Response> {
    try {
      const serviceHealth = await this.appService.healthCheck();
      const allHealthy = Object.values(serviceHealth).every(status => status);

      const response: IHealthCheckResponse = {
        status: allHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        services: serviceHealth,
      }

      return res.status(allHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE).json(response);
    } catch (error: any) {
      const response: IHealthCheckResponse = {
        status: "error",
        timestamp: new Date().toISOString(),
        services: {},
        error: error.message || "Health check failed",
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  @Get("services")
  getServices(@Res() res: Response): Response {
    const services = this.appService.getServices();

    return res.status(HttpStatus.OK).json({
      services,
      count: Object.keys(services).length,
      timestamp: new Date().toISOString(),
    });
  }

  @Get("proxy/:service/*")
  async proxyPath(
    @Param("service") service: string,
    @Req() req: Request,
    @Body() body: any,
    @Headers() headers: Record<string, string>,
    @Res() res: Response
  ): Promise<Response> {
    try {
      const path = this.extractPath(req.originalUrl, service);
      const { host, connection, ...proxyHeaders } = headers;

      const data = await this.appService.proxyRequest(
        service,
        path,
        req.method = "PATCH",
        body,
        proxyHeaders
      )

      return res.status(HttpStatus.OK).json(data);
    } catch (error: any) {
      return this.errorsHandler(error, res);
    }
  }

  @Get('proxy/:service/*')
  async proxyGet(
    @Param('service') service: string,
    @Req() req: Request,
    @Query() query: any,
    @Headers() headers: Record<string, string>,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const path = this.extractPath(req.originalUrl, service);
      const queryString = new URLSearchParams(query).toString();
      const fullPath = queryString ? `${path}?${queryString}` : path;
      const { host, connection, ...proxyHeaders } = headers;

      const data = await this.appService.proxyRequest(
        service,
        fullPath,
        'GET',
        undefined,
        proxyHeaders,
      );

      return res.status(HttpStatus.OK).json(data);
    } catch (error: any) {
      return this.errorsHandler(error, res);
    }
  }

  @Post('proxy/:service/*')
  async proxyPost(
    @Param('service') service: string,
    @Req() req: Request,
    @Body() body: any,
    @Headers() headers: Record<string, string>,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const path = this.extractPath(req.originalUrl, service);
      const { host, connection, ...proxyHeaders } = headers;

      const data = await this.appService.proxyRequest(
        service,
        path,
        'POST',
        body,
        proxyHeaders,
      );

      return res.status(HttpStatus.OK).json(data);
    } catch (error: any) {
      return this.errorsHandler(error, res);
    }
  }

  @Put('proxy/:service/*')
  async proxyPut(
    @Param('service') service: string,
    @Req() req: Request,
    @Body() body: any,
    @Headers() headers: Record<string, string>,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const path = this.extractPath(req.originalUrl, service);
      const { host, connection, ...proxyHeaders } = headers;

      const data = await this.appService.proxyRequest(
        service,
        path,
        'PUT',
        body,
        proxyHeaders,
      );

      return res.status(HttpStatus.OK).json(data);
    } catch (error: any) {
      return this.errorsHandler(error, res);
    }
  }

  @Delete("proxy/:service/*")
  async proxyDelete(
    @Param('service') service: string,
    @Req() req: Request,
    @Headers() headers: Record<string, string>,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const path = this.extractPath(req.originalUrl, service);
      const { host, connection, ...proxyHeaders } = headers;

      const data = await this.appService.proxyRequest(
        service,
        path,
        'DELETE',
        undefined,
        proxyHeaders,
      );

      return res.status(HttpStatus.OK).json(data);
    } catch (error: any) {
      return this.errorsHandler(error, res);
    }
  }

  @Patch('proxy/:service/*')
  async proxyPatch(
    @Param('service') service: string,
    @Req() req: Request,
    @Body() body: any,
    @Headers() headers: Record<string, string>,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const path = this.extractPath(req.originalUrl, service);
      const { host, connection, ...proxyHeaders } = headers;

      const data = await this.appService.proxyRequest(
        service,
        path,
        'PATCH',
        body,
        proxyHeaders,
      );

      return res.status(HttpStatus.OK).json(data);
    } catch (error: any) {
      return this.errorsHandler(error, res);
    }
  }

  @Post("auth/register")
  async authRegister(
    @Body() body: any,
    @Headers() headers: Record<string, string>,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const { host, connection, ...proxyHeaders } = headers;

      const data = await this.appService.proxyRequest(
        "auth",
        "/register",
        "POST",
        body,
        proxyHeaders
      )


      return res.status(HttpStatus.OK).json(data);
    } catch (error: any) {
      return this.errorsHandler(error, res);
    }
  }

  @Post("auth/login")
  async authLogin(
    @Body() body: any,
    @Headers() headers: Record<string, string>,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const { host, connection, ...proxyHeaders } = headers;

      const data = await this.appService.proxyRequest(
        "auth",
        "/login",
        "POST",
        body,
        proxyHeaders
      )
      return res.status(HttpStatus.OK).json(data);
    } catch (error: any) {
      return this.errorsHandler(error, res);
    }
  }

  @Get("auth/profile")
  async authProfile(
    @Headers() headers: Record<string, string>,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const { host, connection, ...proxyHeaders } = headers;

      const data = await this.appService.proxyRequest(
        "auth",
        "/profile",
        "GET",
        undefined,
        proxyHeaders
      )
      return res.status(HttpStatus.OK).json(data);
    } catch (error: any) {
      return this.errorsHandler(error, res);
    }
  }

  @Get("auth/check")
  async authCheck(
    @Headers() headers: Record<string, string>,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const { host, connection, ...proxyHeaders } = headers;

      const data = await this.appService.proxyRequest(
        "auth",
        "/check",
        "GET",
        undefined,
        proxyHeaders
      )
      return res.status(HttpStatus.OK).json(data);
    } catch (error: any) {
      return this.errorsHandler(error, res);
    }
  }

  @Get("ml/*")
  async mlGet(
    @Req() req: Request,
    @Query() query: any,
    @Headers() headers: Record<string, string>,
    @Res() res: Response,
  ): Promise<Response> {
    return this.mlGet(req, query, headers, res);
  }

  @Get("app/*")
  async appGet(
    @Req() req: Request,
    @Query() query: any,
    @Headers() headers: Record<string, string>,
    @Res() res: Response,
  ): Promise<Response> {
    return this.appGet(req, query, headers, res);
  }

  // TODO: Implement service-specific health check endpoints if needed
  // @Get('services/:service/health')
  // async serviceHealth(
  //   @Param('service') service: string,
  //   @Res() res: Response,
  // ): Promise<Response> {
  //   const isHealthy = await this.appService.healthCheck(service);

  //   return res.status(isHealthy ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE)
  //     .json({
  //       service,
  //       status: isHealthy ? 'healthy' : 'unhealthy',
  //       timestamp: new Date().toISOString(),
  //     });
  // }
}
