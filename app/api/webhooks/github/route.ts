import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = req.headers.get("x-github-event");

    if (event === "ping") {
      return NextResponse.json({ message: "Pong" }, { status: 200 });
    }
    //TODO HANDLE PR LATER

    return NextResponse.json({ message: "EVENT PROCESSES" }, { status: 200 });
  } catch (error) {
    console.error("ERROR PROCESSING WEBHOOK:", error);
    return NextResponse.json(
      { error: "INTERNAL SERVER ERROR" },
      { status: 500 },
    );
  }
}
