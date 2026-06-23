import { Injectable } from '@nestjs/common';
import { RedisService } from '@app/integration/redis/redis.service';
import { UsersService } from '@app/modules/users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { StringValue } from 'ms';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  private readonly redisService: RedisService;
  private readonly usersService: UsersService;
  private readonly jwtService: JwtService;
  private readonly configService: ConfigService;
  constructor(
    RedisService: RedisService,
    UsersService: UsersService,
    JwtService: JwtService,
    ConfigService: ConfigService,
  ) {
    this.redisService = RedisService;
    this.usersService = UsersService;
    this.jwtService = JwtService;
    this.configService = ConfigService;
  }

  otpGenerate(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async sendOtp(phoneNumber: string) {
    try {
      await this.redisService.setotp(phoneNumber, this.otpGenerate());
      return { message: 'OTP sent successfully' };
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw new Error('Failed to send OTP');
    }
  }

  async verifyOtp(phoneNumber: string, otp: string) {
    const storeOtp = await this.redisService.getOtp(phoneNumber);
    if (!storeOtp) {
      return { message: 'OTP expired or not found' };
    }
    if (storeOtp !== otp) {
      return { message: 'Invalid OTP' };
    }
    const user = await this.usersService.findMyPhoneNumber(phoneNumber);
    if (user) {
      const tokens = await this.generateToken(user.id, user.phone_number);
      const refreshTokenHash = await this.hashRefreshToken(tokens.refreshToken);
      await this.usersService.updateRefreshToken(user.id, refreshTokenHash);
      await this.redisService.deleteOtp(phoneNumber);
      return {
        success: true,
        user: user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } else {
      const newUser = await this.usersService.create(phoneNumber);
      const tokens = await this.generateToken(newUser.id, newUser.phone_number);
      const refreshTokenHash = await this.hashRefreshToken(tokens.refreshToken);
      await this.usersService.updateRefreshToken(newUser.id, refreshTokenHash);
      await this.redisService.deleteOtp(phoneNumber);
      return {
        success: true,
        user: newUser,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    }
  }

  async generateToken(userId: number, phoneNumber: string) {
    const payload = {
      sub: userId,
      phoneNumber,
    };
    const accessExpiry = this.configService.get<string>(
      'ACCESS_TOKEN_EXPIRY',
    )! as StringValue;
    const refreshExpiry = this.configService.get<string>(
      'REFRESH_TOKEN_EXPIRY',
    )! as StringValue;
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET')!,
      expiresIn: accessExpiry,
    }); //access token is generated for the access part

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET')!,
      expiresIn: refreshExpiry,
    }); // this is used to create another access Token
    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET')!,
      }); // here we are extracting the payloads from the refresh token

      const user = await this.usersService.findById(payload.sub); // now through payloads we are extracting the user

      if (!user) {
        return {
          message: 'User not found',
        };
      }

      if (!user.refresh_token_hash) {
        return {
          message: 'Refresh token missing',
        };
      }
      // we are finding the that user sended refresh token is same as latest refresh_token or different
      const isValid = await bcrypt.compare(
        refreshToken,
        user.refresh_token_hash,
      );

      if (!isValid) {
        return {
          message: 'Invalid refresh token',
        };
      }
      // as we found that refresh token is valid means we can say user have sended the correct latest refresh token
      const tokens = await this.generateToken(user.id, user.phone_number); // that is why we created new tokens

      const newHash = await this.hashRefreshToken(tokens.refreshToken); // we again hanshed the refresh token in newHash variable

      await this.usersService.updateRefreshToken(user.id, newHash); // we again updated the refresh token

      return {
        accessToken: tokens.accessToken, // and this time we are returning  the new access token
        refreshToken: tokens.refreshToken, // and we are returning the new refresh token as well
      };
    } catch {
      return {
        message: 'Invalid refresh token',
      };
    }
  }
  async hashRefreshToken(refreshToken: string) {
    return bcrypt.hash(refreshToken, 10);
  } // this is to hash that refreshToken
}
