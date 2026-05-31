import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { redirectIfAuthenticated } from "@/lib/auth/route-guard";
import { getErrorMessage } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiHealthBanner } from "@/components/system/ApiHealthBanner";

export const Route = createFileRoute("/login")({
  beforeLoad: redirectIfAuthenticated,
  component: LoginPage,
});

function LoginPage() {
  const { login, guest } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password, remember);
      navigate({ to: "/" });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function onGuest() {
    setLoading(true);
    try {
      await guest();
      navigate({ to: "/" });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cockpit px-4 py-12">
      <div className="mx-auto max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-electric-grad text-2xl font-black text-primary-foreground">R</div>
          <h1 className="mt-4 text-2xl font-black">Welcome to Roxzave</h1>
          <p className="text-sm text-muted-foreground">Enterprise road safety platform</p>
        </div>

        <ApiHealthBanner />

        <form onSubmit={onSubmit} className="glass space-y-4 rounded-2xl p-6">
          {error && <p className="rounded-lg bg-emergency/15 px-3 py-2 text-sm text-emergency">{error}</p>}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
            Remember me
          </label>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Login"}
          </Button>
          <Link to="/forgot-password" className="block text-center text-sm text-electric">
            Forgot password?
          </Link>
        </form>

        <Button variant="outline" className="mt-4 w-full" onClick={onGuest} disabled={loading}>
          Continue as Guest
        </Button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          No account? <Link to="/signup" className="font-bold text-electric">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
