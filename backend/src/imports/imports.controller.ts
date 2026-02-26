import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ImportsService } from './imports.service';

type UserPayload = { id: string; email: string };

@Controller('imports')
@UseGuards(JwtAuthGuard)
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @CurrentUser() user: UserPayload,
    @UploadedFile() file: { buffer?: Buffer; originalname?: string },
    @Body('accountId') accountId: string,
  ) {
    if (!file?.buffer) {
      return { error: 'No file uploaded' };
    }
    if (!accountId) {
      return { error: 'accountId is required' };
    }
    return this.importsService.importFromCsv(
      user.id,
      accountId,
      file.originalname ?? 'upload.csv',
      file.buffer,
    );
  }

  @Get()
  list(@CurrentUser() user: UserPayload) {
    return this.importsService.listJobs(user.id);
  }
}
