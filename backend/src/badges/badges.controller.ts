import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { BadgesService } from './badges.service';

@ApiTags('Badges')
@Controller('badges')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active badges' })
  @ApiResponse({ status: 200, description: 'List of badges returned' })
  async getAll() {
    return this.badgesService.getAllBadges();
  }

  @Get('me')
  @ApiOperation({ summary: "Get current user's earned badges" })
  @ApiResponse({ status: 200, description: 'List of user badges returned' })
  async getMine(@Request() req: any) {
    return this.badgesService.getUserBadges(req.user.id);
  }
}
