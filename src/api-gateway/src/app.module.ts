import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from '@nestjs/axios';
import * as winston from "winston"
import { WinstonModule } from 'nest-winston';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env'
    }),
    HttpModule,
    WinstonModule.forRootAsync({
      useFactory: () => ({

      }), inject: [],
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
