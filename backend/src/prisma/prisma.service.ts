import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Connected to PostgreSQL database');
    } catch (err: any) {
      console.warn('⚠️ Notice: Could not connect to PostgreSQL at startup:', err.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
