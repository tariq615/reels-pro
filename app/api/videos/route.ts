import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { IVideo, videoModel } from "@/models/Video";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();

    const videos = await videoModel.find({}).sort({ createdAt: -1 }).lean();
    if (!videos) {
      return NextResponse.json([], { status: 200 });
    }
    return NextResponse.json(videos, { status: 200 });
  } catch (error) {
    console.error("Error while fetching videos", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  try {
    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }
    await connectToDatabase();

    const body: IVideo = await request.json();

    if (
      !body.title ||
      !body.description ||
      !body.thumbnailUrl ||
      !body.videoUrl
    ) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const videoData = {
      ...body,
      controls: body.controls ?? true,
      transformation: {
        height: 1990,
        width: 1080,
        quality: body.transformation?.quality ?? 100,
        // userId: session.user.id,
      },
    };
    const newVideo = await videoModel.create(videoData);

    return NextResponse.json(newVideo, { status: 201 });
  } catch (error) {
    console.error("Error while creating video", error);
    return NextResponse.json(
      { error: "Failed to create video" },
      { status: 500 }
    );
  }
}
