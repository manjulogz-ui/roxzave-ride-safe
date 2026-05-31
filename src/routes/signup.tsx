import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth/AuthProvider";
import { redirectIfAuthenticated } from "@/lib/auth/route-guard";
import { getErrorMessage } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/signup")({
  beforeLoad: redirectIfAuthenticated,
  component: SignupPage,
});

function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    mobile: "",
    password: "",
    confirm_password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(form.mobile.replace(/\D/g, "").slice(-10))) {
      setError("Enter a valid 10-digit Indian mobile number");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signup(form);
      navigate({ to: "/" });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cockpit px-4 py-10">
      <div className="mx-auto max-w-md">
        <h1 className="text-2xl font-black">Create account</h1>
        <form onSubmit={onSubmit} className="glass mt-6 space-y-3 rounded-2xl p-6">
          {error && <p className="rounded-lg bg-emergency/15 px-3 py-2 text-sm text-emergency">{error}</p>}
          {(["full_name", "email", "mobile", "password", "confirm_password"] as const).map((field) => (
            <div key={field}>
              <Label htmlFor={field}>{field.replace(/_/g, " ")}</Label>
              <Input
                id={field}
                type={field.includes("password") ? "password" : field === "email" ? "email" : "text"}
                value={form[field]}
                onChange={(e) => update(field, e.target.value)}
                required
                className="mt-1"
              />
            </div>
          ))}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating…" : "Sign up"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          Have an account? <Link to="/login" className="text-electric font-bold">Login</Link>
        </p>
      </div>
    </div>
  );
}
