import { NestFactory } from '@nestjs/core'
import { AppModule } from './AppModule'
import { setupDocument } from 'src/Common/Infrastructure/Input/Swagger'
async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	await setupDocument(app, 'api-docs')

	await app.listen(3000)
}
bootstrap()
