"use client";

import { Separator } from "@/components/ui/separator";
import ProfileForm from "@/modules/settings/profile-form";
import RepositoryList from "@/modules/settings/repository-list";

const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Manage your account here.</p>
        </div>
      </div>
      <Separator />

      <div>
        <ProfileForm />
      </div>

      <Separator />

      <div>
        <RepositoryList />
      </div>
    </div>
  );
};

export default SettingsPage;
