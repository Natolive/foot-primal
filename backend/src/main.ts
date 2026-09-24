import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // IP réelle (limites par IP) lue dans X-Forwarded-For, posé par Caddy en prod et Traefik en dev ;
  // l'API n'est jamais exposée sans l'un des deux devant.
  app.set('trust proxy', true);
  // credentials : le front envoie le cookie de session à l'API.
  app.enableCors({ origin: process.env.CORS_ORIGIN, credentials: true });
  app.enableShutdownHooks();
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
