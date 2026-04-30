import { 
  Controller, 
  Get, 
  Post, 
  Delete, 
  Param, 
  Body, 
  Query,
  Headers,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { RoomsService } from './rooms.service';


@Controller('rooms')
export class RoomsController {
  constructor(private roomsService: RoomsService) {}

  @Get()
  async findAll() {
    const rooms = await this.roomsService.findAll();
    return { success: true, data: { rooms } };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() body: { name: string },
    @Headers('authorization') auth: string,
  ) {
    const token = auth?.replace('Bearer ', '');
    const result = await this.roomsService.create(body.name, token);
    return result;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const room = await this.roomsService.findOne(id);
    return { success: true, data: room };
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    const token = auth?.replace('Bearer ', '');
    await this.roomsService.remove(id, token);
    return { success: true, data: { deleted: true } };
  }

  @Get(':id/messages')
  async getMessages(
    @Param('id') id: string,
    @Query('limit') limit: string = '50',
    @Query('before') before?: string,
  ) {
    const messages = await this.roomsService.getMessages(id, parseInt(limit), before);
    return { success: true, data: messages };
  }

  @Post(':id/messages')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Param('id') id: string,
    @Body() body: { content: string },
    @Headers('authorization') auth: string,
  ) {
    const token = auth?.replace('Bearer ', '');
    const result = await this.roomsService.sendMessage(id, body.content, token);
    return result;
  }
}