import { reviewPullRequest } from "@/modules/ai/ai-actions";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = req.headers.get("x-github-event");

    if (event === "ping") {
      return NextResponse.json({ message: "Pong" }, { status: 200 });
    }

    if(event === "pull_request") {
      const action = body.action;
      const repo = body.repository.full_name;
      const prNumber = body.number;

      const [owner, repoName] = repo.split("/")

      if(action === "opened" || action === "synchronize") {
        reviewPullRequest(owner, repoName, prNumber)
        .then(() => console.log(`Review completed for ${repo} #${prNumber}`))
        .catch((error : Error) => console.log(`Error in pr review ${repo} #${prNumber} ${error}`))
      }
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
