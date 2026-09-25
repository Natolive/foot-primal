import { Injectable } from '@nestjs/common';
import { WEEKDAYS, type DayAvailabilityDto, type ManagedUserDto, type UpdateUserDto, type UpdateUserPermissionsDto, type UpdateUserRoleDto } from '@footix/shared';
import { BaseService } from '../../common/application/base.service.js';
import { EmailAlreadyUsedError, OwnAccessLockedError, SuperAdminOnlyError } from '../domain/errors.js';
import { toManagedUser, type NewUser, type PublicUser, type User } from '../domain/user.entity.js';
import { UserRepository } from '../domain/user.repository.js';

const byName = (a: User, b: User) => a.lastName.localeCompare(b.lastName, 'fr') || a.firstName.localeCompare(b.firstName, 'fr');

@Injectable()
export class UsersService extends BaseService<User, NewUser> {
  protected readonly notFoundMessage = 'Utilisateur introuvable.';

  constructor(protected override readonly repository: UserRepository) {
    super(repository);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repository.findByEmail(email);
  }

  findByVerificationTokenHash(tokenHash: string): Promise<User | null> {
    return this.repository.findByVerificationTokenHash(tokenHash);
  }

  findByPasswordResetTokenHash(tokenHash: string): Promise<User | null> {
    return this.repository.findByPasswordResetTokenHash(tokenHash);
  }

  // Idempotent : la date de la première visite est conservée.
  async completeOnboarding(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user.onboardedAt) await this.update(id, { onboardedAt: new Date() });
  }

  async findAllManaged(): Promise<ManagedUserDto[]> {
    const users = await this.findAll();
    return users.toSorted(byName).map(toManagedUser);
  }

  // Comptes confirmés seulement : un compte jamais activé ne viendra pas jouer.
  async findAvailability(): Promise<DayAvailabilityDto[]> {
    const players = (await this.findAll()).filter((u) => u.emailVerifiedAt).toSorted(byName);
    return WEEKDAYS.map((day) => ({
      day,
      people: players.filter((u) => u.availableDays.includes(day)).map(({ id, firstName, lastName }) => ({ id, firstName, lastName })),
    }));
  }

  // `actor` : l'administrateur qui fait la modification, `id` : la personne modifiée.
  async updateProfile(actor: PublicUser, id: string, dto: UpdateUserDto): Promise<ManagedUserDto> {
    await this.findManageable(actor, id);
    const owner = await this.findByEmail(dto.email);
    if (owner && owner.id !== id) throw new EmailAlreadyUsedError();
    return toManagedUser(await this.update(id, dto));
  }

  async updateRole(actor: PublicUser, id: string, { role }: UpdateUserRoleDto): Promise<ManagedUserDto> {
    await this.findManageable(actor, id, { self: false });
    if (role === 'super_admin' && actor.role !== 'super_admin') throw new SuperAdminOnlyError();
    return toManagedUser(await this.update(id, { role }));
  }

  async updatePermissions(
    actor: PublicUser,
    id: string,
    { extraPermissions }: UpdateUserPermissionsDto,
  ): Promise<ManagedUserDto> {
    await this.findManageable(actor, id, { self: false });
    return toManagedUser(await this.update(id, { extraPermissions }));
  }

  // Ses réponses, ses invités et ses sessions partent avec lui (cascade en base).
  async deleteUser(actor: PublicUser, id: string): Promise<void> {
    await this.findManageable(actor, id, { self: false });
    await this.delete(id);
  }

  // Seul un super admin touche à un super admin ; son propre accès ne se modifie pas
  // (évite de se retirer l'administration par erreur, ou de s'accorder plus de droits).
  private async findManageable(actor: PublicUser, id: string, { self = true } = {}): Promise<User> {
    if (!self && actor.id === id) throw new OwnAccessLockedError();
    const target = await this.findById(id);
    if (target.role === 'super_admin' && actor.role !== 'super_admin') throw new SuperAdminOnlyError();
    return target;
  }
}
