"use client";

import { Button } from "@/components/ui/button";
import { signIn } from "@/lib/auth-client";
import { Code, Github } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGithubLogin = async () => {
    setIsLoading(true);
    try {
      await signIn.social({ provider: "github" });
      toast.message("Login Successful!");
    } catch (error: any) {
      const msg = error?.message ?? String(error);
      toast.message(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md">
        {/* App branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Code className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Repull</h1>
          <p className="text-slate-300 text-sm">AI Code Reviewer on the go</p>
        </div>

        {/* Login card */}
        <div className="bg-card/80 backdrop-blur-sm text-card-foreground border border-border/50 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-2xl font-semibold mb-2 text-center">Welcome Back</h2>
          <p className="text-sm text-muted-foreground mb-8 text-center">
            Sign in to continue reviewing code with AI
          </p>

          <div className="space-y-4">
            <Button
              type="button"
              aria-label="Sign in with GitHub"
              onClick={handleGithubLogin}
              disabled={isLoading}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:hover:scale-100"
            >
              <Github className="w-5 h-5 mr-3" />
              <span>{isLoading ? "Signing in..." : "Continue with GitHub"}</span>
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              By signing in, you agree to our terms of service
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
