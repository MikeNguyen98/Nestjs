import { ExceptionsLoggerFilter } from './utils/exceptionsLogger.filter';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new ExceptionsLoggerFilter(httpAdapter));
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();

// import { ExceptionsLoggerFilter } from './utils/exceptionsLogger.filter';
// import { HttpAdapterHost, NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import * as cookieParser from 'cookie-parser';
// import { MicroserviceOptions, Transport } from '@nestjs/microservices';

// async function bootstrap() {
//   const app = await NestFactory.createMicroservice<MicroserviceOptions>(
//     AppModule,
//     {
//       transport: Transport.REDIS,
//       options: {
//         url: 'redis://localhost:6379',
//       },
//     },
//   );
//   const { httpAdapter } = app.get(HttpAdapterHost);
//   app.useGlobalFilters(new ExceptionsLoggerFilter(httpAdapter));
//   app.use(cookieParser());
//   await app.listen();
// }
// bootstrap();
