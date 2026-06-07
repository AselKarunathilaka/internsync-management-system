export const isProxyUser = (user) => {
  return user?.isProxy === true || user?.entraRoles?.includes("InternSync.Proxy.DP.Full");
};

export const isActualGM = (user) => {
  return user?.designation === "General Manager";
};

export const isActualDGM = (user) => {
  return user?.designation === "Deputy General Manager";
};

export const isAdmin = (user) => {
  const roles = user?.roles || [];
  return user?.role === "ADMIN" || roles.some(r => r === "ROLE_ADMIN" || r.authority === "ROLE_ADMIN");
};
