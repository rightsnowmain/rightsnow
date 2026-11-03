import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCommentDto {
  @ApiProperty({ example: 'මෙම ලිපිය ඉතා කාලෝචිත සහ අර්ථවත් ය.' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Comment must be at least 2 characters long' })
  @MaxLength(2000, { message: 'Comment cannot exceed 2000 characters' })
  body: string;

  @ApiPropertyOptional({ example: 'c0a80123-4567-89ab-cdef-0123456789ab' })
  @IsOptional()
  @IsString()
  parentId?: string;
}
