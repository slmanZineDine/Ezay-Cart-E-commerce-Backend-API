// app.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

@ApiTags('Health')
@Controller('health')
export class AppController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({
    summary: 'Check server and database health status',
  })
  @ApiOkResponse({
    description:
      'Returns the current operational status of the server and database connection',
  })
  async checkHealth() {
    const dbStatus = await this.dataSource
      .query('SELECT 1')
      .then(() => 'connected')
      .catch(() => 'disconnected');

    return {
      status: 'ok',
      database: dbStatus,
      timestamp: new Date().toISOString(),
    };
  }
}
