import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ProgressService } from './progress.service';

@ApiTags('Progress')
@Controller('progress')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get progress summary for current user' })
  @ApiResponse({ status: 200, description: 'Summary returned' })
  async getSummary(@Request() req: any) {
    return this.progressService.getSummary(req.user.id);
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get global leaderboard' })
  @ApiResponse({ status: 200, description: 'Leaderboard returned' })
  async getLeaderboard() {
    return this.progressService.getLeaderboard();
  }
}
