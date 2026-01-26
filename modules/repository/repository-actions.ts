"use server";

import { inngest } from "@/inngest/client";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { createWebhook, getRepositories } from "../github/github";

export const fetchRepositries = async (
  page: number = 1,
  perPage: number = 10,
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  const githubRepos = await getRepositories(page, perPage);

  const dbRepos = await prisma.repository.findMany({
    where: {
      userId: session.user.id,
    },
  });

  const connectedRepoIds = new Set(dbRepos.map((repo) => repo.githubId));

  return githubRepos.map((repo: any) => ({
    ...repo,
    isConnected: connectedRepoIds.has(BigInt(repo.id)),
  }));
};

export const connectRepository = async (
  owner: string,
  repo: string,
  githubId: number,
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  //TODO: CHECK IF USER CAN CONNECT MORE REPO

  const webhook = await createWebhook(owner, repo);

  if (webhook) {
    await prisma.repository.create({
      data: {
        githubId: BigInt(githubId),
        name: repo,
        owner,
        fullName: `${owner}/${repo}`,
        url: `https://github.com/${owner}/${repo}`,
        userId: session.user.id,
      },
    });
  }

  //TODO: INCREAMENT REPO COUNT FOR USAGE

  try {
    await inngest.send({
      name:"repository.connected",
      data:{
        owner,
        repo,
        userId:session.user.id
      }
    })
  } catch (error) {
    console.error("FAILED TO TRIGGER REPOSITY INDEXING",error)
  }

  return webhook;
};
