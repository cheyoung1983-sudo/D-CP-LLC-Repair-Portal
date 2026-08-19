export interface Auth0UserProfile {
  sub?: string;
  name?: string;
  nickname?: string;
  email?: string;
  email_verified?: boolean;
  picture?: string;
  updated_at?: string;
  'https://displaycellpros.com/roles'?: string[];
  'https://displaycellpros.com/permissions'?: string[];
  roles?: string[];
  permissions?: string[];
  [key: string]: any;
}

export function getAuth0Config() {
  const domain = import.meta.env.VITE_AUTH0_DOMAIN || '';
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || '';
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE || '';
  const isConfigured = Boolean(domain && clientId);

  return {
    domain,
    clientId,
    audience,
    isConfigured,
  };
}

export function getUserRoles(user?: Auth0UserProfile | null): string[] {
  if (!user) return [];
  const customNamespaceRoles = user['https://displaycellpros.com/roles'] || [];
  const standardRoles = user.roles || [];
  const allRoles = [...new Set([...customNamespaceRoles, ...standardRoles])];
  
  // Default to Customer if authenticated with no specific roles assigned
  return allRoles.length > 0 ? allRoles : ['Customer'];
}

export function isTechnicianOrAdmin(user?: Auth0UserProfile | null): boolean {
  if (!user) return false;
  const roles = getUserRoles(user).map(r => r.toLowerCase());
  return roles.some(r => r.includes('admin') || r.includes('technician') || r.includes('engineer') || r.includes('lead'));
}
