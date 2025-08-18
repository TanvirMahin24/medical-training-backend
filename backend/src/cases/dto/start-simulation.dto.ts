import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class StartSimulationDto {
  @ApiProperty({ description: 'Start time of the simulation', example: '2025-01-15T09:00:00Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: 'Initial player position', example: { x: 50, y: 50 }, required: false })
  @IsOptional()
  initialPosition?: { x: number; y: number };
}
