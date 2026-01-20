"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { connectRepository } from "./repository-actions";

export const useConnectRepository = () => {
  const queryCLient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      owner,
      repo,
      githubId,
    }: {
      owner: string;
      repo: string;
      githubId: number;
    }) => {
      return await connectRepository(owner, repo, githubId);
    },

    onSuccess: () => {
      toast.success("REPOSITORY CONNECTED!");
      queryCLient.invalidateQueries({ queryKey: ["repositories"] });
    },

    onError: (error) => {
      toast.error("FAILED TO CONNECT!");
      console.error(error);
    },
  });
};
