export const ROLES = {
  USER: 'user',
  LOT_OPERATOR: 'lot_operator',
  SUPERADMIN: 'superadmin'
};

export const isAdmin = (role) => {
  return role === ROLES.SUPERADMIN;
};

export const isSuperAdmin = (role) => {
  return role === ROLES.SUPERADMIN;
};

