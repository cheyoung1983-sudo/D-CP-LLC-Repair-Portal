import React from 'react';
import { Auth0Provider, AppState } from '@auth0/auth0-react';
import { getAuth0Config } from '../lib/auth0Rbac';

interface Auth0ProviderWithConfigProps {
  children: React.ReactNode;
}

export const Auth0ProviderWithConfig: React.FC<Auth0ProviderWithConfigProps> = ({ children }) => {
  const { domain, clientId, audience, isConfigured } = getAuth0Config();

  const onRedirectCallback = (appState?: AppState) => {
    const targetUrl = appState?.returnTo || window.location.pathname;
    window.history.replaceState({}, document.title, targetUrl);
  };

  if (!isConfigured) {
    // Provide graceful fallback so the application runs even before environment credentials are bound
    return <>{children}</>;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: typeof window !== 'undefined' ? window.location.origin : undefined,
        ...(audience ? { audience } : {}),
        scope: 'openid profile email read:clients update:clients',
      }}
      onRedirectCallback={onRedirectCallback}
      cacheLocation="localstorage"
      useRefreshTokens={true}
    >
      {children}
    </Auth0Provider>
  );
};

export default Auth0ProviderWithConfig;
