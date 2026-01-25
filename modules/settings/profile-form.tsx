"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getUserProfile, updateUserProfile } from "./settings-actions";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const ProfileForm = () => {
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => await getUserProfile(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      return await updateUserProfile(data);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["user-profile"] });
        toast.success("PROFILE UPDATED!");
      } else {
        toast.error("FAILED TO UPDATE!");
      }
    },
    onError: () => toast.error("FAILED TO UPDATE!"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ name, email });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Update your name and email address.</CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <ProfileSkeleton />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={updateMutation.isPending}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={updateMutation.isPending}
              />
            </div>

            {/* Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileForm;

// ✅ Skeleton Loader Component
const ProfileSkeleton = () => {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>

      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>

      <Skeleton className="h-10 w-full" />
    </div>
  );
};
