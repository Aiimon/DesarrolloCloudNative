export const msalConfig = {
  auth: {
    clientId: "9870c4b1-0353-4eb0-8e1d-812cb76676b5",
    authority: "https://login.microsoftonline.com/a5af7e18-9965-418a-9b8a-a0dd9bd96c52",
    redirectUri: "http://localhost:5173",
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: [
    "api://ae706c64-5e56-4573-b311-b2919b52c67a/Pedidos.Read",
    "openid",
    "profile"
  ]
};