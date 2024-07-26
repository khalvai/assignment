import { Body, Controller, Post, UseFilters, UseInterceptors } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { UploadedFilePipe } from "src/Product/Infrastructure/HTTP/uploadFile.decorator";
import { Express } from "express";
import { FileInterceptor } from '@nestjs/platform-express'
import { HttpExceptionFilter } from "src/Common/Infrastructure/Output/HttpExceptionFilter";
import { CreateManyProductDTO } from "src/Product/Infrastructure/HTTP/Dto/create-many-product.dto";
import * as csv from 'csv-parser'
import { Stream } from "node:stream";
import CreateManyCommand from "src/Product/Application/Commands/CreateManyCommand";
import { CreateCommand } from "src/Product/Application/Commands/CreateCommand";

type row = {
    Code: string,
    Name: string,
    Value: string
}
@ApiTags("Product")
@Controller("product")
@UseFilters(HttpExceptionFilter)
export class ProductController {

    constructor(private readonly commandBus: CommandBus) { }


    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file'))
    @Post('')
    async createMany(
        @Body() data: CreateManyProductDTO,
        @UploadedFilePipe(2) file: Express.Multer.File) {



        const createData: CreateCommand[] = []
        const rows = await this.parseCsv(file.buffer) as row[]

        rows.map(r => {

            createData.push({
                code: r.Code,
                name: r.Name,
                value: Number(r.Value)

            })
        })

        await this.commandBus.execute<CreateManyCommand>(new CreateManyCommand(createData))

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