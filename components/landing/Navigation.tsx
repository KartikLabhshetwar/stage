"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/lib/auth-client";
import { signOutUser } from "@/lib/auth-helpers";

interface NavigationProps {
  ctaLabel?: string;
  ctaHref?: string;
}

export function Navigation({ 
  ctaLabel = "Editor", 
  ctaHref = "/home" 
}: NavigationProps) {
  const { data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOutUser();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <nav className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Image 
            src="/logo.png" 
            alt="Stage" 
            width={32} 
            height={32}
            className="h-8 w-8"
          />
        </Link>
        <div className="flex items-center gap-3">
          {session?.user ? (
            <>
              <Link href={ctaHref}>
                <Button variant="ghost">{ctaLabel}</Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage 
                        src={session.user.image || undefined} 
                        alt={session.user.name || session.user.email} 
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getUserInitials(session.user.name, session.user.email)}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user.name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuItem 
                    variant="destructive"
                    onClick={handleSignOut}
                    className="cursor-pointer"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link href="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button variant="default">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

