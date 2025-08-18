import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CompleteTaskDto {
  @ApiProperty({ description: 'Task ID to complete', example: 'task-check-in' })
  @IsString()
  taskId: string;

  @ApiProperty({ description: 'Score earned for the task', example: 100 })
  @IsNumber()
  score: number;

  @ApiProperty({ description: 'Time spent on the task (seconds)', example: 30 })
  @IsNumber()
  timeSpent: number;

  @ApiProperty({ description: 'Expected time for the task (seconds)', example: 45, required: false })
  @IsOptional()
  @IsNumber()
  expectedTime?: number;

  @ApiProperty({ description: 'Accuracy of task completion (0-1)', example: 0.95, required: false })
  @IsOptional()
  @IsNumber()
  accuracy?: number;

  @ApiProperty({ description: 'Additional task metadata', required: false })
  @IsOptional()
  metadata?: any;
}
