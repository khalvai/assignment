import { Body, Controller, Delete, Get, Inject, Post, UseFilters, UseGuards, UseInterceptors } from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { ApiBearerAuth, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { UploadedFilePipe } from "src/Product/Infrastructure/HTTP/uploadFile.decorator";
import { Express } from "express";
import { FileInterceptor } from '@nestjs/platform-express'
import { HttpExceptionFilter } from "src/Common/Infrastructure/Output/HttpExceptionFilter";
import { CreateManyProductDTO } from "src/Product/Infrastructure/HTTP/Dto/create-many-product.dto";
import * as csv from 'csv-parser'
import { Stream } from "node:stream";
import CreateManyCommand from "src/Product/Application/Commands/CreateManyCommand";
import { CreateCommand } from "src/Product/Application/Commands/CreateCommand";
import { AuthGuard } from "src/Common/Infrastructure/Input/AuthGuard";
import { GetUserId } from "src/Common/Infrastructure/Input/GetUserId";
import { GetAllQuery } from "src/Product/Application/Queries/GetAllQuery";
import { ProductReadModel } from "src/Product/Infrastructure/Models/ProductReadModel";
import { DeleteAllCommand } from "src/Product/Application/Commands/DeleteAllCommand";
import { ProductResponseMessages } from "ResponseMessages/product.response.messages";
import { Publisher } from "src/Common/Application/Output/Publisher";
import { RabbitSubscribe } from "@golevelup/nestjs-rabbitmq";
import { Payload } from '@nestjs/microservices'

type row = {
    Code: string,
    Name: string,
    Value: string
}
@ApiBearerAuth()
@ApiTags("Product")
@Controller("product")
@UseFilters(HttpExceptionFilter)
export class ProductController {

    constructor(private readonly commandBus: CommandBus,
        private readonly queryBus: QueryBus,
        @Inject(Publisher) private readonly publisher: Publisher
    ) { }


    @UseGuards(AuthGuard)
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    @Post('')
    async createMany(
        @Body() data: CreateManyProductDTO,
        @UploadedFilePipe(2) file: Express.Multer.File,
        @GetUserId() userId: string
    ) {

        const createData: CreateCommand[] = []
        const rows = await this.parseCsv(file.buffer) as row[]

        rows.map(r => {

            createData.push({
                code: r.Code,
                name: r.Name,
                value: Number(r.Value)

            })
        })

        await this.commandBus.execute<CreateManyCommand>(new CreateManyCommand(createData, userId))

        return {
            message: ProductResponseMessages.PRODUCTS_ARE_CREATED
        }
    }

    @UseGuards(AuthGuard)
    @Get("/getAll")
    async getAll(@GetUserId() userId: string) {

        const data = await this.queryBus.execute<GetAllQuery, ProductReadModel>(new GetAllQuery(userId))

        return data
    }

    @UseGuards(AuthGuard)
    @Delete("/deleteAll")
    async deleteAll(@GetUserId() userId: string) {

        await this.commandBus.execute<DeleteAllCommand, Promise<void>>(new DeleteAllCommand(userId))

        return {
            message: ProductResponseMessages.PRODUCTS_ARE_DELETED
        }
    }

    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    @UseGuards(AuthGuard)
    @Post("publishToQueue1")
    async publishToQueue1(
        @Body() data: CreateManyProductDTO,
        @UploadedFilePipe(2) file: Express.Multer.File,
        @GetUserId() userId: string
    ) {

        await this.publisher.publish('Queue1', { userId: userId, file: file })
        console.log("Published");

    }

    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    @UseGuards(AuthGuard)
    @Post("publishToQueue2")
    async publishToQueue2(
        @Body() data: CreateManyProductDTO,
        @UploadedFilePipe(2) file: Express.Multer.File,
        @GetUserId() userId: string
    ) {

        await this.publisher.publish('Queue2', { userId: userId, file: file })
        console.log("Published");

    }


    @RabbitSubscribe({
        queue: "Queue1",
        routingKey: "Queue1"

    })
    async createProductsFromRabbitmqFile(@Payload() payload: { userId: string, file: any }) {

        const buffer: Buffer = Buffer.from(payload.file.buffer.data)
        const createData: CreateCommand[] = []

        const rows = await this.parseCsv(buffer) as row[]

        rows.map(r => {
            createData.push({
                code: r.Code,
                name: r.Name,
                value: Number(r.Value)
            })
        })

        try {

            await this.commandBus.execute<CreateManyCommand>(new CreateManyCommand(createData, payload.userId))
            console.log("created");

        } catch (error) {
            console.log(error);

        }


    }

    @RabbitSubscribe({
        queue: "Queue2",
        routingKey: "Queue2"

    })
    async publishToQueue3(@Payload() payload: { userId: string, file: any }) {

        const buffer: Buffer = Buffer.from(payload.file.buffer.data)
        const rows = await this.parseCsv(buffer) as row[]

        await this.publisher.publish("Queue3", { rows: rows, userId: payload.userId })

        console.log('received in queue2 listener and published to Queue3');

    }



    @RabbitSubscribe({
        queue: "Queue3",
        routingKey: "Queue3"

    })
    async createProductFromQueue3(@Payload() payload: { userId: string, rows: row[] }) {

        console.log('received in queue3listener');

        const createData: CreateCommand[] = []


        payload.rows.map(r => {
            createData.push({
                code: r.Code,
                name: r.Name,
                value: Number(r.Value)
            })
        })

        try {

            await this.commandBus.execute<CreateManyCommand>(new CreateManyCommand(createData, payload.userId))
            console.log("created");

        } catch (error) {
            console.log(error);

        }


    }


    private parseCsv(buffer: Buffer): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const results: any[] = [];
            const stream = this.bufferToStream(buffer);

            stream
                .pipe(csv())
                .on('data', (data) => {


                    results.push(data)
                    return
                }
                )
                .on('end', () => {
                    resolve(results);
                })
                .on('error', (error) => {
                    reject(error);
                });
        });
    }

    private bufferToStream(buffer: Buffer): NodeJS.ReadableStream {
        const stream = new (require('stream').Readable)();
        stream._read = () => { }; // No-op
        stream.push(buffer);
        stream.push(null);
        return stream;
    }
}