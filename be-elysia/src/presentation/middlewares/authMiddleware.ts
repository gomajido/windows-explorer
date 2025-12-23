import { Elysia } from "elysia";

interface AuthConfig {
  excludePaths?: string[];
}

interface FakeJwtPayload {
  userId: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

interface AuthUser {
  id: number;
  email: string;
  role: string;
}

const FAKE_SECRET = "fake-jwt-secret-for-development";

const createFakeJwt = (payload: Omit<FakeJwtPayload, "iat" | "exp">): string => {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: FakeJwtPayload = {
    ...payload,
    iat: now,
    exp: now + 3600, // 1 hour expiry
  };

  const base64Header = Buffer.from(JSON.stringify(header)).toString("base64url");
  const base64Payload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = Buffer.from(`${base64Header}.${base64Payload}.${FAKE_SECRET}`).toString("base64url");

  return `${base64Header}.${base64Payload}.${signature}`;
};

const verifyFakeJwt = (token: string): FakeJwtPayload | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString()) as FakeJwtPayload;

    // Check expiry
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;

    return payload;
  } catch {
    return null;
  }
};

// Export helper to generate test tokens
export const generateTestToken = (
  userId: number = 1,
  email: string = "test@example.com",
  role: string = "user"
): string => {
  return createFakeJwt({ userId, email, role });
};

// Helper to extract and verify auth from request
export const getAuthUser = (request: Request): AuthUser | null => {
  const authHeader = request.headers.get("authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);
  const payload = verifyFakeJwt(token);

  if (!payload) {
    return null;
  }

  return {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
  };
};

// Guard function for protected routes
export const requireAuth = ({ request, set }: { request: Request; set: { status?: number | string } }) => {
  const user = getAuthUser(request);
  
  if (!user) {
    set.status = 401;
    return {
      success: false,
      data: null,
      error: "Unauthorized: Invalid or missing token",
    };
  }
};

// Middleware that derives user context (always passes fake user for development)
export const authMiddleware = () => {
  return new Elysia({ name: "auth-middleware" })
    .derive(() => {
      // Always return a fake user for development
      const user: AuthUser = {
        id: 1,
        email: "dev@example.com",
        role: "admin",
      };
      return { user, isAuthenticated: true };
    });
};
