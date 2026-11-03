import { Module } from '@nestjs/common';
import { NewspapersController } from './newspapers.controller';
import { NewspapersService } from './newspapers.service';

@Module({
  controllers: [NewspapersController],
  providers: [NewspapersService],
  exports: [NewspapersService],
})
export class NewspapersModule {}
