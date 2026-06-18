import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@modules/auth/auth.module';
import { UserModule } from './modules/users/users.module';
import { PrismaModule } from './database/prisma.module';
import { RedisModule } from './integration/redis/redis.module';
@Module({
  imports: [AuthModule, UserModule, PrismaModule, RedisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
