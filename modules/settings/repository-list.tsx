"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, Github, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { disconnectAllRepos, disconnectRepos, getConnectedRepositories } from "./settings-actions";


interface Repository {
  id: string;
  name: string;
  fullName: string;
  url: string;
  createdAt: Date;
}

const RepositoryList = () => {
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteAllDialogOpen, setDeleteAllDialogOpen] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);

  const { data: repositories = [], isLoading } = useQuery({
    queryKey: ["connected-repositories"],
    queryFn: async () => await getConnectedRepositories(),
  });

  const disconnectMutation = useMutation({
    mutationFn: async (repositoryId: string) => {
      return await disconnectRepos(repositoryId);
    },
    onSuccess: (result, repositoryId) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: ["connected-repositories"] });
        queryClient.invalidateQueries({queryKey: ["dashboard-stats"]})
        setDeleteDialogOpen(false);
        setSelectedRepo(null);
        toast.success("Repository disconnected successfully");
      } else {
        toast.error("Failed to disconnect repository");
      }
    },
    onError: () => {
      toast.error("An error occurred while disconnecting");
    },
  });

  const disconnectAllMutation = useMutation({
    mutationFn: async () => {
      return await disconnectAllRepos();
    },
    onSuccess: (result) => {
      if (result?.success) {
        queryClient.invalidateQueries({ queryKey: ["connected-repositories"] });
        queryClient.invalidateQueries({queryKey: ["dashboard-stats"]})
        setDeleteAllDialogOpen(false);
        toast.success("All repositories disconnected successfully");
      } else {
        toast.error("Failed to disconnect repositories");
      }
    },
    onError: () => {
      toast.error("An error occurred while disconnecting");
    },
  });

  const handleDisconnect = () => {
    if (!selectedRepo) return;
    disconnectMutation.mutate(selectedRepo.id);
  };

  const handleDisconnectAll = () => {
    disconnectAllMutation.mutate();
  };

  const openDeleteDialog = (repo: Repository) => {
    setSelectedRepo(repo);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return <RepositoryListSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Connected Repositories</h2>
          <p className="text-muted-foreground">
            Manage your connected GitHub repositories
          </p>
        </div>
        {repositories.length > 0 && (
          <Button
            variant="destructive"
            onClick={() => setDeleteAllDialogOpen(true)}
            disabled={disconnectAllMutation.isPending}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Disconnect All
          </Button>
        )}
      </div>

      {repositories.length === 0 ? (
        <Alert>
          <Github className="h-4 w-4" />
          <AlertDescription>
            No repositories connected yet. Connect a repository to get started.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-4 grid-cols-2">
          {repositories.map((repo) => (
            <Card key={repo.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{repo.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {repo.fullName}
                    </CardDescription>
                  </div>
                  <Github className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    View on GitHub
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDeleteDialog(repo)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Connected {new Date(repo.createdAt).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Single Repository Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect Repository?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to disconnect{" "}
              <span className="font-semibold">{selectedRepo?.fullName}</span>?
              This will remove the webhook and stop tracking this repository.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disconnectMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnect}
              disabled={disconnectMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {disconnectMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                "Disconnect"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete All Repositories Dialog */}
      <AlertDialog
        open={deleteAllDialogOpen}
        onOpenChange={setDeleteAllDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Disconnect All Repositories?</AlertDialogTitle>
            <AlertDialogDescription>
              This will disconnect all {repositories.length} repositories and
              remove all webhooks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={disconnectAllMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDisconnectAll}
              disabled={disconnectAllMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {disconnectAllMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                "Disconnect All"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RepositoryList;

// Skeleton Loader Component
const RepositoryListSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-5 w-5 rounded" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
              <Skeleton className="h-3 w-40 mt-3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};