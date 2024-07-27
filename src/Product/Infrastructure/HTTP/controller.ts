import { Body, Controller, Delete, Get, Post, UseFilters, UseGuards, UseInterceptors } from "@nestjs/common";
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

    constructor(private readonly commandBus: CommandBus, private readonly queryBus: QueryBus) { }


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
            message: "ALL_PRODUCTS_DELTED"
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