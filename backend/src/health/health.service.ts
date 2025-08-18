import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HealthService {
  constructor(private configService: ConfigService) {}

  getEnvironmentInfo() {
    return {
      environment: this.configService.get('NODE_ENV', 'development'),
      version: process.env.npm_package_version || '1.0.0',
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
  }

  getDatabaseInfo() {
    return {
      databaseUrl: this.configService.get('DATABASE_URL')
        ? 'configured'
        : 'not configured',
      redisUrl: this.configService.get('REDIS_URL')
        ? 'configured'
        : 'not configured',
    };
  }
}
