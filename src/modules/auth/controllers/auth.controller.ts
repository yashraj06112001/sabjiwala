import SendOtpDto from '../dto/send-otp.dto';
import verifyOtpDto from '../dto/verify-otp.dto';
import RefreshTokenDto from '../dto/refresh-token.dto';
import { Body, Controller, Post, Get, Req } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

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

  @Post('refresh-token')
  async refreshToken(@Body() body: RefreshTokenDto) {
    return await this.AuthService.refreshTokens(body?.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: any) {
    return req.user;
  }
}
