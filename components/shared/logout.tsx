"use client";

import { signOut } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

const Logout = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const router = useRouter();
  return (
    <span
      className={className}
      onClick={() =>
        signOut({
          fetchOptions: {
            onSuccess: () => {
              toast.message("Logged out successfully");
              router.push("/login");
            },
          },
        })
      }
    >
      {children}
    </span>
  );
};

export default Logout;
