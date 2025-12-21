"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";

export default function SignIn() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <Card className="w-md">
      <CardHeader>
        <CardTitle className="text-lg md:text-2xl">Sign In</CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Enter your credentials below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Roll Number / Faculty ID</Label>
            <Input
              id="username"
              type="text"
              placeholder="23951A052X"
              required
              onChange={(e) => {
                setUsername(e.target.value);
              }}
              value={username}
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="ml-auto inline-block text-sm underline">
                Forgot your password?
              </Link>
            </div>

            <Input
              id="password"
              type="password"
              placeholder="password"
              autoComplete="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
            onClick={async () => {
              await signIn.username(
                {
                  username,
                  password,
                },
                {
                  onRequest: (_ctx) => {
                    setLoading(true);
                  },
                  onResponse: (_ctx) => {
                    setLoading(false);
                  },
                },
              );
            }}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <p>Sign In</p>
            )}
          </Button>
        </div>
      </CardContent>
      <div className="w-auto h-px bg-border mx-4"></div>
      <CardFooter className="text-sm text-muted-foreground flex items-center justify-center">
        Built with 💖 at IARE!
      </CardFooter>
    </Card>
  );
}
