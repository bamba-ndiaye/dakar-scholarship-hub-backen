import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { CurrentUser, CurrentUserData } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AssignApplicationDto } from './dto/assign-application.dto';
import { CreateApplicationDto } from './dto/create-application.dto';
import { QueryApplicationsDto } from './dto/query-applications.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { UpdateApplicationStatusDto } from './dto/update-application-status.dto';
import { ApplicationsService } from './applications.service';

@ApiTags('Applications')
@ApiBearerAuth()
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Create a new scholarship application draft' })
  create(@CurrentUser() user: CurrentUserData, @Body() dto: CreateApplicationDto) {
    return this.applicationsService.create(user.sub, dto);
  }

  @Get('my')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'List current student applications' })
  findMine(@CurrentUser() user: CurrentUserData, @Query() query: QueryApplicationsDto) {
    return this.applicationsService.findMine(user.sub, query);
  }

  @Get()
  @Roles(Role.MUNICIPAL, Role.ADMIN)
  @ApiOperation({ summary: 'List applications for municipal agents and admins' })
  findAll(@CurrentUser() user: CurrentUserData, @Query() query: QueryApplicationsDto) {
    return this.applicationsService.findMany(query, user.sub, user.role as Role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single application' })
  findOne(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.applicationsService.findOne(id, user.sub, user.role as Role);
  }

  @Patch(':id')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Update a draft application' })
  update(@CurrentUser() user: CurrentUserData, @Param('id') id: string, @Body() dto: UpdateApplicationDto) {
    return this.applicationsService.update(user.sub, id, dto);
  }

  @Post(':id/submit')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Submit a draft application' })
  submit(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    return this.applicationsService.submit(user.sub, id);
  }

  @Patch(':id/status')
  @Roles(Role.MUNICIPAL, Role.ADMIN)
  @ApiOperation({ summary: 'Update application review status' })
  updateStatus(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateStatus(id, dto, user.sub);
  }

  @Patch(':id/assign')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Assign an application to a municipal reviewer' })
  assign(@Param('id') id: string, @Body() dto: AssignApplicationDto) {
    return this.applicationsService.assign(id, dto);
  }
}
