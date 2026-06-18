import { Module } from '@nestjs/common';
import { UserModule } from '@app/modules/users/users.module';
import { AuthService } from './services/auth.service';
import { AuthController } from './controllers/auth.controller';
@Module({
  imports: [UserModule],
  providers: [AuthService],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
