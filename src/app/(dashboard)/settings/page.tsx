"use client";

import { parseAsString, useQueryState } from "nuqs";
import AccountSettings from "@/components/layouts/settings/account-settings";
import RoleSpecificSettings from "@/components/layouts/settings/role-specific-settings";
import SecuritySettings from "@/components/layouts/settings/security-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsString.withDefault("account")
  );

  return (
    <div className="container p-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Tabs value={tab ?? undefined} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="role">Role Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <AccountSettings />
        </TabsContent>
        <TabsContent value="security">
          <SecuritySettings />
        </TabsContent>
        <TabsContent value="role">
          <RoleSpecificSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
