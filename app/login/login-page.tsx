"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, signup, loginWithDiscord } from "./actions";
import { useToast } from "@/components/ui/use-toast";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  async function handleSubmit(
    formData: FormData,
    action: typeof login | typeof signup,
  ) {
    try {
      setIsLoading(true);
      await action(formData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Enter your email and password to login or create an account
          </CardDescription>
        </CardHeader>
        <form>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button
              className="w-full bg-blue-700 hover:bg-blue-800 transition-colors text-white"
              onClick={() => loginWithDiscord()}
            >
              Discord
            </Button>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              formAction={(formData) => handleSubmit(formData, login)}
            >
              Log in
            </Button>
            <Button
              type="submit"
              variant="outline"
              className="w-full"
              disabled={isLoading}
              formAction={(formData) => handleSubmit(formData, signup)}
            >
              Sign up
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
