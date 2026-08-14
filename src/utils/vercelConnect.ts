import {
  getToken,
  getTokenResponse,
  ConnectTokenParams,
  ConnectOptions,
  ConnectTokenResponse,
  NoValidTokenError,
  UserAuthorizationRequiredError,
  ConnectorInstallationRequiredError
} from '@vercel/connect';

export const VERCEL_CONNECT_RESOURCE = 'mcp.vercel.com/cheyoung1983-sudo-www-displaycellpros-com-refractored';

/**
 * Obtain access token string using getToken.
 */
export async function getVercelConnectToken(
  connector: string = VERCEL_CONNECT_RESOURCE,
  params: ConnectTokenParams = { subject: { type: 'app' } },
  options?: ConnectOptions
): Promise<string> {
  return await getToken(connector, params, options);
}

/**
 * Obtain full token response object including metadata, expiry, and connector identity.
 */
export async function getVercelConnectResponse(
  connector: string = VERCEL_CONNECT_RESOURCE,
  params: ConnectTokenParams = { subject: { type: 'app' } },
  options?: ConnectOptions
): Promise<ConnectTokenResponse> {
  return await getTokenResponse(connector, params, options);
}

/**
 * Error matching helper to handle typed @vercel/connect errors.
 */
export function handleVercelConnectError(error: any) {
  if (error instanceof UserAuthorizationRequiredError || error?.name === 'UserAuthorizationRequiredError') {
    return { errorType: 'UserAuthorizationRequired', message: 'User authorization required. Please surface account link UI.', error };
  }
  if (error instanceof ConnectorInstallationRequiredError || error?.name === 'ConnectorInstallationRequiredError') {
    return { errorType: 'ConnectorInstallationRequired', message: 'Connector installation required. Surface install link.', error };
  }
  if (error instanceof NoValidTokenError || error?.name === 'NoValidTokenError') {
    return { errorType: 'NoValidToken', message: 'No valid token available or grant revoked.', error };
  }
  if (error?.name === 'ConnectorNotFoundError') {
    return { errorType: 'ConnectorNotFound', message: 'Connector not found under team configuration.', error };
  }
  if (error?.name === 'ClientNotLinkedToProjectError') {
    return { errorType: 'ClientNotLinkedToProject', message: 'Calling project is not linked to connector.', error };
  }
  if (error?.name === 'ClientNotEnabledForEnvironmentError') {
    return { errorType: 'ClientNotEnabledForEnvironment', message: 'Link exists but not enabled for current environment.', error };
  }
  return { errorType: 'UnknownError', message: (error as Error)?.message || 'An unexpected error occurred.', error };
}

export {
  NoValidTokenError,
  UserAuthorizationRequiredError,
  ConnectorInstallationRequiredError
};


