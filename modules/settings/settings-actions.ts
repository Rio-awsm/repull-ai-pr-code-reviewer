"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { deleteWebhook } from "../github/github";

export async function getUserProfile() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("UNAUTHORIZED");
    }

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    });
    return user;
  } catch (error) {
    console.error("error fetching user", error);
  }
}

export async function updateUserProfile(data: {
  name?: string;
  email?: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("UNAUTHORIZED");
    }

    const updateUser = await prisma.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name: data.name,
        email: data.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    revalidatePath("/dashboard/settings");
    return {
      success: true,
      user: updateUser,
    };
  } catch (error) {
    console.error("error updating user", error);
    return {
      success: false,
      error: "Failed to update user profile",
    };
  }
}

export async function getConnectedRepositories() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("UNAUTHORIZED");
    }

    const repositories = prisma.repository.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        fullName: true,
        url: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return repositories;
  } catch (error) {
    console.error("ERROR FETCHING REPOS", error);
  }
}

export async function disconnectRepos(repositoryId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("UNAUTHORIZED");
    }

    const repository = await prisma.repository.findUnique({
      where: {
        id: repositoryId,
        userId: session.user.id,
      },
    });

    if (!repository) {
      throw new Error("REPOSITORY NOT FOUND");
    }
    await deleteWebhook(repository.owner, repository.name);
    await prisma.repository.delete({
      where: {
        id: repositoryId,
        userId: session.user.id,
      },
    });
    revalidatePath("/dashboard/settings", "page");
    revalidatePath("/dashboard/repository", "page");

    return { success: true };
  } catch (error) {
    console.error("ERROR DISCONNECTING REPO", error);
    return { success: false };
  }
}

export async function disconnectAllRepos() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("UNAUTHORIZED");
    }

    const repositories = await prisma.repository.findMany({
      where: {
        userId: session.user.id,
      },
    });

    await Promise.all(
      repositories.map(async (repo) => {
        await deleteWebhook(repo.owner, repo.name);
      }),
    );

    const result = await prisma.repository.deleteMany({
      where: {
        userId: session.user.id,
      },
    });
    revalidatePath("/dashboard/settings", "page");
    revalidatePath("/dashboard/repository", "page");

    return { success: true };
  } catch (error) {
    console.error("ERROR DISCONNECTING REPOS", error);
    return { success: false };
  }
}
