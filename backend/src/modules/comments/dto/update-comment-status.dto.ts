import { IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CommentStatus } from '@prisma/client';

export class UpdateCommentStatusDto {
  @ApiProperty({ enum: CommentStatus, example: CommentStatus.APPROVED })
  @IsEnum(CommentStatus)
  @IsNotEmpty()
  status: CommentStatus;
}
