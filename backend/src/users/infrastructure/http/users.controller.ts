import { Body, Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Patch, Put } from '@nestjs/common';
import {
  updateUserPermissionsSchema,
  updateUserRoleSchema,
  updateUserSchema,
  type ManagedUserDto,
  type UpdateUserDto,
  type UpdateUserPermissionsDto,
  type UpdateUserRoleDto,
  type UserDto,
} from '@footix/shared';
import { Authorize, CurrentUser } from '../../../auth/infrastructure/http/session.guard.js';
import { ZodValidationPipe } from '../../../common/infrastructure/http/pipes/zod-validation.pipe.js';
import { UsersService } from '../../application/users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @Authorize('users.read')
  findAll(): Promise<ManagedUserDto[]> {
    return this.users.findAllManaged();
  }

  @Patch(':id')
  @Authorize('users.update')
  update(
    @CurrentUser() actor: UserDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateUserSchema)) dto: UpdateUserDto,
  ): Promise<ManagedUserDto> {
    return this.users.updateProfile(actor, id, dto);
  }

  @Put(':id/role')
  @Authorize('users.update_role')
  updateRole(
    @CurrentUser() actor: UserDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateUserRoleSchema)) dto: UpdateUserRoleDto,
  ): Promise<ManagedUserDto> {
    return this.users.updateRole(actor, id, dto);
  }

  @Put(':id/permissions')
  @Authorize('users.update_permissions')
  updatePermissions(
    @CurrentUser() actor: UserDto,
    @Param('id', ParseUUIDPipe) id: string,
    @Body(new ZodValidationPipe(updateUserPermissionsSchema)) dto: UpdateUserPermissionsDto,
  ): Promise<ManagedUserDto> {
    return this.users.updatePermissions(actor, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Authorize('users.delete')
  delete(@CurrentUser() actor: UserDto, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.users.deleteUser(actor, id);
  }
}
