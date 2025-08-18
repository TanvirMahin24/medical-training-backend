import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateSimulationProgressDto {
  @ApiProperty({ description: 'Current visit number', example: 1 })
  @IsNumber()
  currentVisit: number;

  @ApiProperty({ description: 'Current task ID', example: 'task-check-in', required: false })
  @IsOptional()
  @IsString()
  currentTask?: string;

  @ApiProperty({ description: 'Player position coordinates', example: { x: 100, y: 150 } })
  playerPosition: { x: number; y: number };

  @ApiProperty({ description: 'Current game state', example: { isActive: true, patientState: 'waiting' } })
  gameState: any;

  @ApiProperty({ description: 'Time spent in simulation (seconds)', example: 300 })
  @IsNumber()
  timeSpent: number;

  @ApiProperty({ description: 'Current patient state', example: 'waiting' })
  @IsString()
  patientState: string;
}
