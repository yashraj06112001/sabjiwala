import SendOtpDto from '../dto/send-otp.dto';
import verifyOtpDto from '../dto/verify-otp.dto';
import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
@Controller('auth')
export class AuthController {
  AuthService: AuthService;
  constructor(AuthService: AuthService) {
    this.AuthService = AuthService;
  }
  @Post('send-otp')
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return await this.AuthService.sendOtp(sendOtpDto?.phoneNumber);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: verifyOtpDto) {
    return await this.AuthService.verifyOtp(
      verifyOtpDto?.phoneNumber,
      verifyOtpDto?.otp,
    );
  }
}
