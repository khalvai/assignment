import { Module } from '@nestjs/common'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { ConfigModule } from '@nestjs/config'
import { UserModule } from 'src/User/UserModule'
import { ScheduleModule } from '@nestjs/schedule'
import { ProductModule } from 'src/Product/ProductModule'

@Module({
	imports: [
		ConfigModule.forRoot(),
		ScheduleModule.forRoot(),
		EventEmitterModule.forRoot(),
		UserModule,
		ProductModule
	]
})
export class AppModule {}
