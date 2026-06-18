import { Injectable } from '@nestjs/common';
import { RedisService } from '@app/integration/redis/redis.service';
import { UsersService } from '@app/modules/users/services/users.service';
@Injectable()
export class AuthService {
  RedisService: RedisService;
  UsersService: UsersService;
  constructor(RedisService: RedisService, UsersService: UsersService) {
    this.RedisService = RedisService;
    this.UsersService = UsersService;
  }

  otpGenerate(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(phoneNumber: string) {
    try {
      await this.RedisService.setotp(phoneNumber, this.otpGenerate());
      return { message: 'OTP sent successfully' };
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw new Error('Failed to send OTP');
    }
  }

  async verifyOtp(phoneNumber: string, otp: string) {
    const storeOtp = await this.RedisService.getOtp(phoneNumber);
    if (!storeOtp) {
      return { message: 'OTP expired or not found' };
    }
    if (storeOtp != otp) {
      return { message: 'Invalid OTP' };
    }
    await this.RedisService.deleteOtp(phoneNumber);
    const user = await this.UsersService.findMyPhoneNumber(phoneNumber);
    if (user) {
      return { message: 'Login Successfull', user: user };
    } else {
      const newUser = await this.UsersService.create(phoneNumber);
      return {
        message: 'Login Successfull, user is created',
        user: newUser,
      };
    }
  }
}
