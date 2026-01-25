import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { headers } from "next/headers";
import { Octokit } from "octokit";

export const getGithubToken = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  const account = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "github",
    },
  });

  if (!account?.accessToken) {
    throw new Error("NO GITHUB ACCESSTOKEN");
  }

  return account.accessToken;
};

// interface contributiondata {
//   user: {
//     contributionCollection: {
//       contributionCalendar: {
//         totalContributions: number;
//         weeks: {
//           contributionDays: {
//             contributionCount: number;
//             date: string | Date;
//             color: string;
//           };
//         };
//       };
//     };
//   };
// }

export async function fetchUserContribution(token: string, username: string) {
  const octokit = new Octokit({ auth: token });

  const query = `
   query($username: String!) {
     user(login: $username) {
       contributionsCollection {
         contributionCalendar {
           totalContributions
           weeks {
             contributionDays {
               contributionCount
               date
               color
             }
           }
         }
       }
     }
   }
   `;
  try {
    const response: any = await octokit.graphql(query, {
      username,
    });

    return response.user.contributionsCollection.contributionCalendar;
  } catch (error) {
    throw error;
  }
}

export const getRepositories = async (
  page: number = 1,
  perPage: number = 10,
) => {
  const token = await getGithubToken();
  const octokit = new Octokit({ auth: token });

  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    direction: "desc",
    visibility: "all",
    per_page: perPage,
    page: page,
  });

  return data;
};

export const createWebhook = async (owner: string, repo: string) => {
  const token = await getGithubToken();
  const octokit = new Octokit({ auth: token });

  const webhookURL = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/webhooks/github`;

  const { data: hooks } = await octokit.rest.repos.listWebhooks({
    owner,
    repo,
  });

  const existinghook = hooks.find((hook) => hook.config.url === webhookURL);

  if (existinghook) {
    return existinghook;
  }

  const { data } = await octokit.rest.repos.createWebhook({
    owner,
    repo,
    config: {
      url: webhookURL,
      content_type: "json",
    },
    events: ["pull_request"],
  });
  return data;
};


export const deleteWebhook = async (owner:string, repo:string) => {
  const token = await getGithubToken();
  const octokit = new Octokit({ auth: token });

  const webhookURL = `${process.env.NEXT_PUBLIC_APP_BASE_URL}/api/webhooks/github`;

  try {
    const {data: hooks} = await octokit.rest.repos.listWebhooks({
      owner, repo
    })
    const hookToDelete = hooks.find(hook => hook.config.url === webhookURL)
    if(hookToDelete) {
      await octokit.rest.repos.deleteWebhook({
        owner, repo, hook_id:hookToDelete.id
      })
      return true
    }
    return false
  } catch (error) {
    console.error("ERROR DELETING WEBHOOK", error)
    return false
  }
}