import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../../common/decorators/roles.decorator';
import { CreateScholarshipDto } from './dto/create-scholarship.dto';
import { UpdateScholarshipDto } from './dto/update-scholarship.dto';
import { ScholarshipsService } from './scholarships.service';

@ApiTags('Scholarships')
@Controller('scholarships')
export class ScholarshipsController {
  constructor(private readonly scholarshipsService: ScholarshipsService) {}

  @ApiBearerAuth()
  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a scholarship entry' })
  create(@Body() dto: CreateScholarshipDto) {
    return this.scholarshipsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all scholarships' })
  findAll() {
    return this.scholarshipsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a scholarship by id' })
  findOne(@Param('id') id: string) {
    return this.scholarshipsService.findOne(id);
  }

  @ApiBearerAuth()
  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Update a scholarship' })
  update(@Param('id') id: string, @Body() dto: UpdateScholarshipDto) {
    return this.scholarshipsService.update(id, dto);
  }

  @ApiBearerAuth()
  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a scholarship' })
  remove(@Param('id') id: string) {
    return this.scholarshipsService.remove(id);
  }
}
