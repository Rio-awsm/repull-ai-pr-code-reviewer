"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepositories } from "@/modules/repository/use-repositories";
import { ExternalLink, Github, Link2, Search, Star } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  topics: string[];
  isConnected?: boolean;
}

const RepoCardSkeleton = () => {
  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2 w-full">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[65%]" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-24" />
        </div>
      </CardContent>
    </Card>
  );
};

export default function RepositoryPage() {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useRepositories();

  const [searchQuery, setSearchQuery] = useState("");

  // Sentinel ref for infinite scrolling
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const allRepositories = useMemo(() => {
    return data?.pages.flatMap((page) => page) || [];
  }, [data]);

  const filteredRepositories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allRepositories;

    return allRepositories.filter((repo: Repository) => {
      return (
        repo.name.toLowerCase().includes(q) ||
        (repo.full_name && repo.full_name.toLowerCase().includes(q))
      );
    });
  }, [allRepositories, searchQuery]);

  // ✅ Infinite Scroll Effect
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const el = loadMoreRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first.isIntersecting) return;

        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: null, // viewport
        rootMargin: "250px", // fetch before reaching bottom
        threshold: 0.1,
      }
    );

    observer.observe(el);

    return () => {
      observer.unobserve(el);
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
          <p className="text-muted-foreground">Manage your repositories here.</p>
        </div>

        <Button variant="secondary" className="gap-2" asChild>
          <a href="https://github.com" target="_blank" rel="noreferrer">
            <Github className="h-4 w-4" />
            Open GitHub
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>

      <Separator />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search for repositories..."
          className="pl-10 h-11"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Error */}
      {isError && (
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="text-destructive">Something went wrong</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Couldn’t load repositories. Please try again.
          </CardContent>
        </Card>
      )}

      {/* Initial Loading */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <RepoCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Data */}
      {!isLoading && !isError && (
        <>
          {filteredRepositories.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No repositories found</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Try another search term.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredRepositories.map((repo: Repository) => (
                <Card key={repo.id} className="hover:shadow-sm transition-shadow">
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <CardTitle className="text-base md:text-lg truncate">
                          {repo.name}
                        </CardTitle>

                        <p className="text-xs text-muted-foreground truncate">
                          {repo.full_name}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {repo.isConnected && (
                          <Badge variant="secondary" className="gap-1">
                            <Link2 className="h-3.5 w-3.5" />
                            Connected
                          </Badge>
                        )}

                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={repo.html_url}
                            target="_blank"
                            rel="noreferrer"
                            className="gap-2"
                          >
                            View
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {repo.description || "No description provided."}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        <Star className="h-3.5 w-3.5" />
                        {repo.stargazers_count.toLocaleString()}
                      </Badge>

                      {repo.language && (
                        <Badge variant="outline">{repo.language}</Badge>
                      )}

                      {repo.topics?.slice(0, 4)?.map((topic) => (
                        <Badge key={topic} variant="secondary">
                          {topic}
                        </Badge>
                      ))}

                      {repo.topics?.length > 4 && (
                        <Badge variant="secondary">
                          +{repo.topics.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* ✅ Sentinel Element (triggers infinite loading) */}
          <div ref={loadMoreRef} className="h-10" />

          {/* Loading next page skeletons */}
          {isFetchingNextPage && (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <RepoCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* End message */}
          {!hasNextPage && filteredRepositories.length > 0 && (
            <p className="text-center text-sm text-muted-foreground pt-3">
              You’ve reached the end.
            </p>
          )}
        </>
      )}
    </div>
  );
}
