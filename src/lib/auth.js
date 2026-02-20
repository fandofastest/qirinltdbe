import jwt from "jsonwebtoken";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Missing env var: JWT_SECRET");
}

export function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function getBearerToken(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  const [type, value] = authHeader.split(" ");
  if (type?.toLowerCase() !== "bearer") return null;
  return value || null;
}

export async function getUserFromRequest(request) {
  const token = getBearerToken(request);
  if (!token) return null;

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    return null;
  }

  await connectMongo();
  const user = await User.findById(payload.userId).select("-password");
  return user;
}

export async function requireAuth(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    const err = new Error("Unauthorized");
    err.status = 401;
    throw err;
  }
  return user;
}

export async function requireAdmin(request) {
  const user = await requireAuth(request);
  if (user.role !== "admin") {
    const err = new Error("Forbidden");
    err.status = 403;
    throw err;
  }
  return user;
}
