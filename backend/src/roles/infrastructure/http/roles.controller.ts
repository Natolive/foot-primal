import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { ROLES, updateRoleSchema, type Role, type RoleDto, type UpdateRoleDto } from '@footix/shared';
import { z } from 'zod';
import { Authorize } from '../../../auth/infrastructure/http/session.guard.js';
import { ZodValidationPipe } from '../../../common/infrastructure/http/pipes/zod-validation.pipe.js';
import { RolesService } from '../../application/roles.service.js';

@Controller('roles')
export class RolesController {
  constructor(private readonly roles: RolesService) {}

  @Get()
  @Authorize('roles.read')
  findAll(): Promise<RoleDto[]> {
    return this.roles.findAll();
  }

  @Put(':role')
  @Authorize('roles.update')
  update(
    @Param('role', new ZodValidationPipe(z.enum(ROLES))) role: Role,
    @Body(new ZodValidationPipe(updateRoleSchema)) dto: UpdateRoleDto,
  ): Promise<RoleDto> {
    return this.roles.update(role, dto.permissions);
  }
}
