import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/MobileShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireAuth } from "@/lib/auth/route-guard";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export const Route = createFileRoute("/profile/settings")({
  beforeLoad: requireAuth,
  component: SettingsPage,
});

function SettingsPage() {
  const [dark, setDark] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <MobileShell>
      <PageHeader title="Settings" backTo="/profile" />
      <div className="glass mt-6 space-y-4 rounded-2xl p-4">
        <SettingRow label="Dark Mode" checked={dark} onChange={setDark} />
        <SettingRow label="Push Notifications" checked={notifications} onChange={setNotifications} />
        <div className="border-t border-white/10 pt-3">
          <p className="text-sm font-bold">Language</p>
          <p className="text-muted-foreground text-sm">English (India)</p>
        </div>
        <div>
          <p className="text-sm font-bold">Privacy & Security</p>
          <p className="text-[12px] text-muted-foreground">End-to-end encrypted SOS data</p>
        </div>
      </div>
    </MobileShell>
  );
}

function SettingRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-bold">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
