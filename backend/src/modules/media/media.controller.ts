import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { MediaService } from './media.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

const uploadsDir1 = path.resolve(__dirname, '../../../uploads');
const uploadsDir2 = path.resolve(__dirname, '../../uploads');
const uploadsDir3 = path.resolve(process.cwd(), 'uploads');
const finalUploadsDir = fs.existsSync(uploadsDir1)
  ? uploadsDir1
  : fs.existsSync(uploadsDir2)
  ? uploadsDir2
  : uploadsDir3;

if (!fs.existsSync(finalUploadsDir)) {
  fs.mkdirSync(finalUploadsDir, { recursive: true });
}

export const multerStorage = diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(finalUploadsDir)) {
      fs.mkdirSync(finalUploadsDir, { recursive: true });
    }
    cb(null, finalUploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const baseName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_\u0D80-\u0DFF-]/g, '_')
      .slice(0, 50);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  },
});

const imageFileFilter = (req: any, file: any, cb: any) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'image/avif',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestException('වලංගු ඡායාරූප ගොනුවක් පමණක් තෝරන්න (JPEG, PNG, WebP, GIF, SVG, AVIF)'), false);
  }
};

@ApiTags('Media')
@Controller('admin/media')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.EDITOR, Role.AUTHOR)
@ApiBearerAuth()
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  @ApiOperation({ summary: 'Browse media library assets' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 50) {
    return this.mediaService.findAll(Number(page), Number(limit));
  }

  @Post()
  @ApiOperation({ summary: 'Register a media asset' })
  create(
    @Body()
    dto: {
      storageKey: string;
      url: string;
      filename: string;
      mimeType: string;
      sizeBytes: number;
      altText?: string;
      credit?: string;
    },
  ) {
    return this.mediaService.create(dto);
  }

  @Post('upload')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an image file directly (Featured image / Body media)' })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multerStorage,
      limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB max
      fileFilter: imageFileFilter,
    }),
  )
  async uploadFile(
    @UploadedFile() file: any,
    @Body('altText') altText?: string,
    @Body('credit') credit?: string,
  ) {
    if (!file) {
      throw new BadRequestException('කරුණාකර උඩුගත කිරීම සඳහා ගොනුවක් තෝරන්න (No file provided)');
    }

    const fileUrl = `/uploads/${file.filename}`;

    const media = await this.mediaService.create({
      storageKey: file.filename,
      url: fileUrl,
      filename: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      altText: altText || file.originalname,
      credit: credit || 'සමබිම මාධ්‍ය ඒකකය',
    });

    return {
      success: true,
      url: fileUrl,
      filename: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      media,
    };
  }

  @Post('upload-base64')
  @ApiOperation({ summary: 'Upload a base64 encoded image directly' })
  async uploadBase64(
    @Body() dto: { data: string; filename?: string; altText?: string; credit?: string },
  ) {
    if (!dto.data) {
      throw new BadRequestException('Image data required');
    }

    const matches = dto.data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new BadRequestException('වලංගු base64 දත්ත ආකෘතියක් නොවේ');
    }

    const mimeType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const ext = mimeType.split('/')[1] || 'png';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const baseName = (dto.filename || 'pasted-image').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30);
    const filename = `${baseName}-${uniqueSuffix}.${ext}`;
    const filePath = path.join(finalUploadsDir, filename);

    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;

    const media = await this.mediaService.create({
      storageKey: filename,
      url: fileUrl,
      filename: dto.filename || filename,
      mimeType,
      sizeBytes: buffer.length,
      altText: dto.altText || filename,
      credit: dto.credit || 'සමබිම මාධ්‍ය ඒකකය',
    });

    return {
      success: true,
      url: fileUrl,
      filename,
      mimeType,
      sizeBytes: buffer.length,
      media,
    };
  }
}
