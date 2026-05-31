import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { api, getErrorMessage } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/forgot-password")({
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/api/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <div className="min-h-screen bg-cockpit px-4 py-12">
      <div className="mx-auto max-w-md glass rounded-2xl p-6">
        <h1 className="text-xl font-black">Reset password</h1>
        {sent ? (
          <p className="mt-4 text-sm text-success">If the email exists, reset instructions were sent.</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            {error && <p className="text-sm text-emergency">{error}</p>}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1" />
            </div>
            <Button type="submit" className="w-full">Send reset link</Button>
          </form>
        )}
        <Link to="/login" className="mt-4 block text-center text-sm text-electric">Back to login</Link>
      </div>
    </div>
  );
}
