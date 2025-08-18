import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { profile: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    // Check if trial has expired
    if (
      user.subscriptionStatus === 'TRIAL' &&
      user.trialExpiresAt &&
      user.trialExpiresAt < new Date()
    ) {
      // Update user status to expired
      await this.prisma.user.update({
        where: { id: user.id },
        data: { subscriptionStatus: 'EXPIRED' },
      });

      throw new UnauthorizedException(
        'Trial period has expired. Please upgrade your subscription.',
      );
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      profile: user.profile,
    };
  }
}
