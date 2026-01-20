"use client";

import { useSession } from "@/lib/auth-client";
import {
  BookOpen,
  GitBranch,
  GitPullRequest,
  LogOut,
  Settings,
  Star,
  Text,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";
import Logout from "./logout";

const Appsidebar = () => {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const { data: session } = useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigationItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: BookOpen,
    },
    {
      title: "Repository",
      url: "/dashboard/repository",
      icon: GitBranch,
    },
    {
      title: "Reviews",
      url: "/dashboard/reviews",
      icon: Text,
    },
    {
      title: "Subscription",
      url: "/dashboard/subscription",
      icon: Star,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const isActive = (url: string) => {
    if (url === "/dashboard") return pathname === "/dashboard";
    return pathname === url || pathname.startsWith(url + "/");
  };

  if (!mounted || !session) return null;

  const user = session.user;
  const username = user.name || "GUEST";
  const useremail = user.email || "";
  const userinitial = username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toLocaleUpperCase();

  return (
    <Sidebar>
      <SidebarContent>
        <div className="p-4 flex gap-2 items-center">
          <GitPullRequest className="text-primary" />
          <h1 className="text-3xl font-bold text-primary">REPULL</h1>
        </div>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 p-2">
          <Avatar>
            <AvatarFallback>{userinitial}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{username}</p>
            <p className="text-xs text-muted-foreground truncate">
              {useremail}
            </p>
          </div>
          <Logout className="text-muted-foreground hover:text-foreground cursor-pointer p-1">
            <LogOut size={16} />
          </Logout>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default Appsidebar;
