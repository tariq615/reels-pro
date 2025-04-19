import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { userModel } from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "email and password is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await userModel.findOne({ email });

    if (user) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    await userModel.create({
      name,
      email,
      password,
    });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error while registering", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
