import { Injectable } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findMyPhoneNumber(phoneNumber: string) {
    const data = await this.prisma.user.findUnique({
      where: {
        phone_number: phoneNumber,
      },
    });
    return data;
  }

  async create(phoneNumber: string) {
    const data = await this.prisma.user.create({
      data: {
        phone_number: phoneNumber,
        created_at: new Date(),
      },
    });
    return data;
  }

  async updateRefreshToken(userId: number, refreshTokenHash: string) {
    return await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        refresh_token_hash: refreshTokenHash,
      },
    });
  }

  async findById(userId: number) {
    const data = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (data) {
      return data;
    } else {
      return {
        success: false,
        message: 'user not found having this id',
      };
    }
  }
}
