import jwt from "jsonwebtoken";

// Read secret once and warn if missing. Signing/verifying will fail without it.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn(
    "⚠️ JWT_SECRET is not set. Token signing/verifying will not work."
  );
}

// Sign a JWT for a payload. Throws if secret is not configured.
export function signToken(payload) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET not configured");
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

// Middleware that requires a valid Bearer token. Responds 401 if missing/invalid.
export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Middleware that optionally authenticates: if a Bearer token is provided it is verified
// and `req.user` is populated. If no token is provided the request continues as anonymous (req.user remains undefined).
export function optionalAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;

  // No token provided: continue as anonymous
  if (!token) {
    req.user = undefined;
    return next();
  }

  // Token provided: verify it
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
}
