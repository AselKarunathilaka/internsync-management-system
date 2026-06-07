const azureClientId = import.meta.env.VITE_AZURE_CLIENT_ID;
const azureTenantId = import.meta.env.VITE_AZURE_TENANT_ID;
const azureRedirectUri =
  import.meta.env.VITE_AZURE_REDIRECT_URI || `${window.location.origin}/login`;

console.log("AZURE CLIENT:", azureClientId);
console.log("AZURE TENANT:", azureTenantId);
console.log("AZURE REDIRECT:", azureRedirectUri);

export const msalConfig = {
  auth: {
    clientId: azureClientId,
    authority: `https://login.microsoftonline.com/${azureTenantId}`,
    redirectUri: azureRedirectUri,
    postLogoutRedirectUri: window.location.origin,
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["openid", "profile", "email"],
};