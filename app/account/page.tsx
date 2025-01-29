import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { LogOut, Trash2, UserCircle } from "lucide-react";

import { handleLogout, handlePrivacyToggle } from './actions'

export default async function AccountPage() {

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  const userData = data.user;
  console.log
  const isPublic = false
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };


  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <UserCircle className="h-6 w-6" />
            Account Settings
          </CardTitle>
          <CardDescription>
            Manage your account preferences and Discord connection
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Discord Profile</h3>
            <div className="flex items-center space-x-4">
              <img
                src={userData?.user_metadata?.avatar_url}
                alt="Discord Avatar"
                className="h-16 w-16 rounded-full"
              />
              <div>
                <p className="font-medium">
                  {userData?.user_metadata?.full_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {userData?.user_metadata?.email}
                </p>
                <p className="text-sm text-muted-foreground">
                  Discord ID: {userData?.user_metadata?.sub}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Privacy Settings</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="public-profile">Public Profile</Label>
                <p className="text-sm text-muted-foreground">
                  Allow others to view your collection and profile.
                </p>
              </div>
              <Switch
                id="public-profile"
                value={isPublic}
                formAction={handlePrivacyToggle}
              />
            </div>
          </div>

          <Separator />

          {/* Danger Zone */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-destructive">
              Danger Zone
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                formAction={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and remove all of your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      formAction={handleLogout}
                      className="bg-destructive hover:bg-destructive/90"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}