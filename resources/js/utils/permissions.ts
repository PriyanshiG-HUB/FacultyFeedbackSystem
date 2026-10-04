export const isAdministratorRole = (role?: string | null): boolean => {
  return role === 'ADMIN' || role === 'SUPER_ADMIN';
};
