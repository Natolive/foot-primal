import type { ManagedUserDto, Permission, Role } from '@primal/shared';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  role: Role;
  extraPermissions: Permission[];
  createdAt: Date;
}

// Rôle et droits en plus facultatifs à la création : `user` et aucun par défaut en base.
export type NewUser = Omit<User, 'id' | 'createdAt' | 'role' | 'extraPermissions'> &
  Partial<Pick<User, 'role' | 'extraPermissions'>>;

// Ce qui peut sortir de l'API : jamais le hash du mot de passe.
export type PublicUser = Pick<User, 'id' | 'email' | 'firstName' | 'lastName' | 'role'>;

export const toPublicUser = ({ id, email, firstName, lastName, role }: User): PublicUser => ({
  id,
  email,
  firstName,
  lastName,
  role,
});

export const toManagedUser = (user: User): ManagedUserDto => ({
  ...toPublicUser(user),
  extraPermissions: user.extraPermissions,
});
