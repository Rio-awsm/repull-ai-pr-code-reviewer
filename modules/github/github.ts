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
