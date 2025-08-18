import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CasesService } from './cases.service';
import { StartSimulationDto } from './dto/start-simulation.dto';
import { UpdateSimulationProgressDto } from './dto/update-simulation-progress.dto';
import { CompleteTaskDto } from './dto/complete-task.dto';

@ApiTags('cases')
@Controller('cases')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available medical cases' })
  @ApiResponse({ status: 200, description: 'List of medical cases' })
  async getAllCases() {
    return this.casesService.getAllCases();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific medical case by ID' })
  @ApiResponse({ status: 200, description: 'Medical case details' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async getCaseById(@Param('id') id: string) {
    return this.casesService.getCaseById(id);
  }

  @Get(':id/simulation-data')
  @ApiOperation({ summary: 'Get simulation data for a specific case' })
  @ApiResponse({ status: 200, description: 'Case simulation data' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async getSimulationData(@Param('id') id: string) {
    return this.casesService.getSimulationData(id);
  }

  @Post(':id/start-simulation')
  @ApiOperation({ summary: 'Start a new simulation session for a case' })
  @ApiResponse({ status: 201, description: 'Simulation session started' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  async startSimulation(
    @Param('id') caseId: string,
    @Body() startData: StartSimulationDto,
    @Request() req: any,
  ) {
    return this.casesService.startSimulation(caseId, req.user.id, startData);
  }

  @Put(':id/simulation-progress')
  @ApiOperation({ summary: 'Update simulation progress' })
  @ApiResponse({ status: 200, description: 'Simulation progress updated' })
  @ApiResponse({ status: 404, description: 'Simulation session not found' })
  async updateSimulationProgress(
    @Param('id') caseId: string,
    @Body() progressData: UpdateSimulationProgressDto,
    @Request() req: any,
  ) {
    return this.casesService.updateSimulationProgress(
      caseId,
      req.user.id,
      progressData,
    );
  }

  @Post(':id/complete-task')
  @ApiOperation({ summary: 'Complete a task in the simulation' })
  @ApiResponse({ status: 201, description: 'Task completed successfully' })
  @ApiResponse({ status: 404, description: 'Simulation session not found' })
  async completeTask(
    @Param('id') caseId: string,
    @Body() taskData: CompleteTaskDto,
    @Request() req: any,
  ) {
    return this.casesService.completeTask(caseId, req.user.id, taskData);
  }
}
