import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { MobileShell } from "@/components/MobileShell";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireAuth } from "@/lib/auth/route-guard";
import { api } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/AuthProvider";
import { Settings, LogOut, Phone, Car } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/profile")({
  beforeLoad: requireAuth,
  component: ProfilePage,
});

function ProfilePage() {
  const { logout } = useAuth();
  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await api.get("/api/user/profile");
      return data as {
        full_name: string;
        email: string;
        mobile: string;
        safety_score: number;
        blood_group: string;
      };
    },
  });

  const { data: vehicles } = useQuery({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const { data } = await api.get("/api/user/vehicles");
      return data as { make: string; model: string; registration_number: string }[];
    },
  });

  return (
    <MobileShell>
      <PageHeader title="Profile" subtitle="Dashboard" backTo="/" />
      <div className="glass mt-6 rounded-2xl p-5">
        {isLoading ? (
          <p className="text-muted-foreground">Loading…</p>
        ) : (
          <>
            <p className="text-xl font-black">{profile?.full_name}</p>
            <p className="text-sm text-muted-foreground">{profile?.email}</p>
            <p className="mt-2 flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-electric" /> {profile?.mobile ?? "—"}
            </p>
            <p className="mt-4 text-3xl font-black text-success">{profile?.safety_score ?? 85}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Safety Score</p>
          </>
        )}
      </div>

      {vehicles?.[0] && (
        <div className="glass mt-3 flex items-center gap-3 rounded-2xl p-4">
          <Car className="h-5 w-5 text-electric" />
          <div>
            <p className="text-sm font-bold">
              {vehicles[0].make} {vehicles[0].model}
            </p>
            <p className="text-[11px] text-muted-foreground">{vehicles[0].registration_number}</p>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        <Link to="/profile/edit" className="glass block rounded-2xl px-4 py-3 text-sm font-bold">
          Edit Profile
        </Link>
        <Link to="/profile/emergency-contacts" className="glass block rounded-2xl px-4 py-3 text-sm font-bold">
          Emergency Contacts
        </Link>
        <Link to="/profile/settings" className="glass flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold">
          <Settings className="h-4 w-4" /> Settings
        </Link>
        <Link to="/vehicles" className="glass block rounded-2xl px-4 py-3 text-sm font-bold">
          Vehicle Management
        </Link>
        <Link to="/devices" className="glass block rounded-2xl px-4 py-3 text-sm font-bold">
          ESP32 / BLE Devices
        </Link>
        <Link to="/admin" className="glass block rounded-2xl px-4 py-3 text-sm font-bold text-electric">
          Admin Dashboard
        </Link>
        <Link to="/safety-center" className="glass block rounded-2xl px-4 py-3 text-sm font-bold">
          Safety Center
        </Link>
        <Link to="/navigation-hub" className="glass block rounded-2xl px-4 py-3 text-sm font-bold">
          Navigation Hub
        </Link>
      </div>

      <Button variant="outline" className="mt-6 w-full gap-2" onClick={() => { logout(); window.location.href = "/login"; }}>
        <LogOut className="h-4 w-4" /> Logout
      </Button>
    </MobileShell>
  );
}
