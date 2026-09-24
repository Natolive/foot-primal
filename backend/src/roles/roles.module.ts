import { Module } from '@nestjs/common';
import { RolesService } from './application/roles.service.js';
import { RolePermissionRepository } from './domain/role-permission.repository.js';
import { DrizzleRolePermissionRepository } from './infrastructure/drizzle-role-permission.repository.js';
import { RolesController } from './infrastructure/http/roles.controller.js';

// Les routes sont protégées par le guard global d'AuthModule : pas besoin de l'importer ici.
@Module({
  controllers: [RolesController],
  providers: [RolesService, { provide: RolePermissionRepository, useClass: DrizzleRolePermissionRepository }],
  exports: [RolesService],
})
export class RolesModule {}
