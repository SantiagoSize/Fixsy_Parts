export const isAuthRoute = (path: string) =>
  ["/login", "/register", "/forgot-password"].includes(path);

