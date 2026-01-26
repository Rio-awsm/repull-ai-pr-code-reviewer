"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import { getReviews } from "@/modules/review/review-actions";
import { useQuery } from "@tanstack/react-query";
import {
    Calendar,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    FileCode,
    GitPullRequest,
    Package,
} from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Repository {
  id: string;
  name: string;
  fullName: string;
  url: string;
}

interface Review {
  id: string;
  repositoryId: string;
  repository: Repository;
  prNumber: number;
  prTitle: string;
  prUrl: string;
  review: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewsPage = () => {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => await getReviews(),
  });

  if (isLoading) {
    return <ReviewsPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">PR Reviews</h1>
        <p className="text-muted-foreground mt-2">
          View all AI-generated pull request reviews
        </p>
      </div>

      {reviews.length === 0 ? (
        <Alert>
          <GitPullRequest className="h-4 w-4" />
          <AlertDescription>
            No reviews yet. Reviews will appear here when pull requests are
            opened in your connected repositories.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Showing {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </div>

          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
};

// Review Card Component with Collapsible
const ReviewCard = ({ review }: { review: Review }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <CardTitle className="text-xl">{review.prTitle}</CardTitle>
              <Badge variant="secondary" className="text-xs">
                #{review.prNumber}
              </Badge>
              {review.status === "completed" && (
                <Badge variant="default" className="text-xs">
                  Completed
                </Badge>
              )}
            </div>

            <CardDescription className="flex items-center gap-4 flex-wrap">
              <span className="inline-flex items-center gap-1.5">
                <Package className="h-3.5 w-3.5" />
                {review.repository.fullName}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(review.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </CardDescription>
          </div>

          <a
            href={review.prUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            View PR
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </CardHeader>

      <CardContent>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="space-y-3">
            <CollapsibleTrigger className="flex items-center justify-between w-full group">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileCode className="h-4 w-4" />
                AI Review
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {isOpen ? (
                  <>
                    Hide review <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Show review <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </div>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="markdown-review bg-muted/50 rounded-lg p-4 border overflow-auto max-h-150">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1
                        className="text-2xl font-bold mt-6 mb-4 first:mt-0"
                        {...props}
                      />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2
                        className="text-xl font-bold mt-5 mb-3 first:mt-0"
                        {...props}
                      />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3
                        className="text-lg font-semibold mt-4 mb-2 first:mt-0"
                        {...props}
                      />
                    ),
                    h4: ({ node, ...props }) => (
                      <h4
                        className="text-base font-semibold mt-3 mb-2 first:mt-0"
                        {...props}
                      />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="mb-4 leading-7 last:mb-0" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul
                        className="list-disc list-inside mb-4 space-y-2"
                        {...props}
                      />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol
                        className="list-decimal list-inside mb-4 space-y-2"
                        {...props}
                      />
                    ),
                    li: ({ node, ...props }) => (
                      <li className="leading-7" {...props} />
                    ),
                    code: ({ node, className, children, ...props }) => {
                      const isInline = !className;
                      return isInline ? (
                        <code
                          className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono border"
                          {...props}
                        >
                          {children}
                        </code>
                      ) : (
                        <code
                          className="block bg-muted/80 p-3 rounded text-sm font-mono overflow-x-auto border my-3"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    },
                    pre: ({ node, ...props }) => (
                      <pre className="my-3" {...props} />
                    ),
                    blockquote: ({ node, ...props }) => (
                      <blockquote
                        className="border-l-4 border-muted-foreground/30 pl-4 italic my-4"
                        {...props}
                      />
                    ),
                    a: ({ node, ...props }) => (
                      <a
                        className="text-primary underline hover:text-primary/80 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                        {...props}
                      />
                    ),
                    table: ({ node, ...props }) => (
                      <div className="overflow-x-auto my-4">
                        <table
                          className="min-w-full divide-y divide-border"
                          {...props}
                        />
                      </div>
                    ),
                    thead: ({ node, ...props }) => (
                      <thead className="bg-muted/50" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                      <th
                        className="px-4 py-2 text-left text-sm font-semibold"
                        {...props}
                      />
                    ),
                    td: ({ node, ...props }) => (
                      <td
                        className="px-4 py-2 text-sm border-t border-border"
                        {...props}
                      />
                    ),
                    hr: ({ node, ...props }) => (
                      <hr className="my-6 border-border" {...props} />
                    ),
                  }}
                >
                  {review.review}
                </ReactMarkdown>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default ReviewsPage;

// Skeleton Loader Component
const ReviewsPageSkeleton = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-5 w-96" />
      </div>

      <Skeleton className="h-5 w-32" />

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-7 w-64" />
                    <Skeleton className="h-5 w-12" />
                    <Skeleton className="h-5 w-20" />
                  </div>
                  <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-5 w-20" />
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-3">
                <Skeleton className="h-5 w-24" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
