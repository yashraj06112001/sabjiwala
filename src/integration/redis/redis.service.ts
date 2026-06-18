import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis({
      host: 'localhost',
      port: 6379,
    });
  }
  async setotp(phoneNumber: String, otp: string) {
    await this.redis.set(`otp:${phoneNumber}`, otp, 'EX', 300);
  }

  async getOtp(phoneNumber: string) {
    return this.redis.get(`otp:${phoneNumber}`);
  }

  async deleteOtp(phoneNumber: string) {
    await this.redis.del(`otp:${phoneNumber}`);
  }
  async onModuleDestroy() {
    await this.redis.quit();
  }
}
