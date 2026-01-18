"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip } from "@/components/ui/tooltip";
import ContributionGraph from "@/modules/dashboard/components/contribution-graph";
import {
  getDashboardStats,
  getMonthlyActivity,
} from "@/modules/dashboard/dashboard-action";
import { useQuery } from "@tanstack/react-query";
import { GitBranch } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

const DashboardPage = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => await getDashboardStats(),
    refetchOnWindowFocus: false,
  });

  console.log(stats);

  const { data: monthlyActivity, isLoading: isLoadingActivity } = useQuery({
    queryKey: ["monthly-activity"],
    queryFn: async () => getMonthlyActivity(),
    refetchOnWindowFocus: false,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your coding activity statistics and AI reviews
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Repositories
            </CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold pb-1">
              {isLoading ? "..." : stats?.totalRepos || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Number of repositories connected
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Total Commits</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold pb-1">
              {isLoading ? "..." : stats?.totalCommits || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Number of commits made in the last year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Pull Requests
            </CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold pb-1">
              {isLoading ? "..." : stats?.totalPRs || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Number of pull requests made all time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">
              Total AI Reviews
            </CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          <CardContent>
            <div className="text-2xl font-bold pb-1">
              {isLoading ? "..." : stats?.totalReviews || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Number of AI reviews conducted
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col justify-between space-y-0">
          <CardTitle className="text-sm font-medium">
            Contribution Activity
          </CardTitle>
          <CardDescription>
            Overview of your contribution activity on GitHub
          </CardDescription>
          <CardContent>
            <ContributionGraph />
          </CardContent>
        </CardHeader>
      </Card>

      <div className="">
        <CardHeader>
          <CardTitle className="text-sm font-medium">
            Activity Overview
          </CardTitle>
          <CardDescription>
            Monthly breakdown of commits, prs, reviews
          </CardDescription>
          <CardContent>
            {isLoadingActivity ? (
              <Spinner />
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width={"100%"} height={"100%"}>
                  <BarChart data={monthlyActivity || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Legend />
                    <Tooltip />
                    <Bar dataKey="commits" fill="#8884d8" />
                    <Bar dataKey="prs" fill="#82ca9d" />
                    <Bar dataKey="reviews" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </CardHeader>
      </div>
    </div>
  );
};

export default DashboardPage;
