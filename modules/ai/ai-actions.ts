"use server";

import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { getPullRequestDiff } from "../github/github";
import { canCreateReview, incrementReviewCount } from "../payment/subscription";

export async function reviewPullRequest(
  owner: string,
  repo: string,
  prNumber: number,
) {
  try {
    const repository = await prisma.repository.findFirst({
      where: {
        owner: owner,
        name: repo,
      },
      include: {
        user: {
          include: {
            accounts: {
              where: {
                providerId: "github",
              },
            },
          },
        },
      },
    });

    if (!repository) {
      throw new Error(`Repository not found in the database.`);
    }

    const canReview = await canCreateReview(repository.user.id, repository.id);

    if (!canReview) {
      throw new Error(
        "REVIEW LIMIT REACHED FOR THIS REPO> PLEASE UPGRADE TO PRO.",
      );
    }

    const githubAccount = repository.user.accounts[0];

    if (!githubAccount?.accessToken) {
      throw new Error("No github access token found");
    }

    const token = githubAccount.accessToken;

    const { title } = await getPullRequestDiff(token, owner, repo, prNumber);

    await inngest.send({
      name: "pr.review.requested",
      data: {
        owner,
        repo,
        prNumber,
        userId: repository.userId,
      },
    });

    await incrementReviewCount(repository.user.id, repository.id);

    return { success: true, message: "Review Queued" };
  } catch (error) {
    try {
      const repository = await prisma.repository.findFirst({
        where: { owner, name: repo },
      });
      if (repository) {
        await prisma.review.create({
          data: {
            repositoryId: repository.id,
            prNumber,
            prTitle: "FAILED TO FETCH PR",
            prUrl: `https://github.com/${owner}/${repo}/pull/${prNumber}`,
            review: `ERROR ${error instanceof Error ? error.message : "UNKNOWN ERR"}`,
            status: "failed",
          },
        });
      }
    } catch (dberror) {
      console.error("DB ERROR", dberror);
    }
  }
}
