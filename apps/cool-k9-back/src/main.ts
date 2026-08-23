import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app/app.module';
import { parseCorsOrigins } from './app/config/cors-origins.util';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const isProduction = process.env.NODE_ENV === 'production';

  // The hosting platform terminates TLS and forwards requests, so without this Express
  // reports the proxy address for every caller. Rate limiting would then count every
  // client in a single bucket and let one visitor lock out the rest. A fixed hop count
  // is used rather than `true`, which would trust a client-supplied X-Forwarded-For.
  app.set('trust proxy', 1);

  app.use(
    helmet({
      // The API only serves JSON; the document CSP belongs to whatever serves the
      // frontend, not here.
      contentSecurityPolicy: false,
      // HSTS only means something once traffic actually goes over HTTPS.
      hsts: isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
    })
  );

  // Allowed origins come from the environment and are never hardcoded, so pointing the
  // API at a new frontend URL is a configuration change rather than a code change.
  app.enableCors({
    origin: parseCorsOrigins(process.env.CORS_ORIGINS),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    maxAge: 86400,
  });

  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(`🚀 Application is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
