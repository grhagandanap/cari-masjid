// import { sentinelClient } from "@better-auth/infra/client";
// import { createAuthClient } from "better-auth/react";

// export const authClient = createAuthClient({
//   plugins: [
//     sentinelClient()
//   ]
// })

import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" 
    ? window.location.origin 
    : process.env.BETTER_AUTH_URL,
});