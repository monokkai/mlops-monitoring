import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get("/health")
  getHealth(): string {
    return "Service https://localhost:80 is healthy";
  }
}
