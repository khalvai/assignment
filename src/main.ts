import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupDocument } from 'src/Common/Infrastructure/Input/Swagger';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);


  await setupDocument(app, "api-docs")

  await app.listen(3000);
}
bootstrap();
