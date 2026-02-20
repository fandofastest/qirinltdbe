import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connectMongo from "@/lib/mongodb";
import User from "@/models/User";
import { generateToken } from "@/lib/auth";

const SUPERADMIN_EMAIL = process.env.SUPERADMIN_EMAIL;
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD;
const SUPERADMIN_NAME = process.env.SUPERADMIN_NAME || "Super Admin";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password } = body || {};

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "name, email, password are required" },
        { status: 400 }
      );
    }

    await connectMongo();

    const normalizedEmail = email.toLowerCase().trim();

    if (SUPERADMIN_EMAIL && SUPERADMIN_PASSWORD) {
      const superEmail = SUPERADMIN_EMAIL.toLowerCase().trim();
      if (normalizedEmail === superEmail) {
        if (password !== SUPERADMIN_PASSWORD) {
          return NextResponse.json(
            { success: false, message: "Superadmin password mismatch" },
            { status: 403 }
          );
        }

        const hashed = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);

        const user = await User.findOneAndUpdate(
          { email: superEmail },
          {
            $set: {
              name: SUPERADMIN_NAME,
              email: superEmail,
              password: hashed,
              role: "admin",
            },
          },
          { new: true, upsert: true }
        );

        const token = generateToken(user);

        return NextResponse.json(
          {
            success: true,
            data: {
              token,
              user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt,
              },
            },
          },
          { status: 201 }
        );
      }
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ success: false, message: "Email already registered" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashed,
    });

    const token = generateToken(user);

    return NextResponse.json(
      {
        success: true,
        data: {
          token,
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
          },
        },
      },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
