import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, Lock, Mail, UserPlus } from "lucide-react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

interface LocationState {
  from?: { pathname: string };
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as LocationState | null)?.from?.pathname ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell>
      <div className="w-full max-w-[460px] animate-fade-in rounded-[28px] border border-black/5 bg-white p-8 shadow-[0_30px_70px_-25px_rgba(11,19,43,0.22)] sm:p-10">
        <h2 className="font-serif text-3xl font-semibold tracking-tight text-navy">Welcome Back</h2>
        <p className="mt-2 text-sm text-charcoal/60">Sign in to continue to Elangovan Associates</p>
        <div className="mt-5 h-px w-14 bg-gradient-to-r from-gold to-gold/20" />

        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-charcoal">
              Email or Mobile Number
            </Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-charcoal/35" />
              <Input
                id="email"
                type="text"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@firm.com or mobile number"
                aria-invalid={!!error}
                className="h-14 rounded-xl border-softgray bg-white pl-12 pr-4 text-[15px] text-charcoal transition-all duration-200 placeholder:text-charcoal/35 focus-visible:border-navy focus-visible:ring-2 focus-visible:ring-navy/20 focus-visible:ring-offset-0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-charcoal">
              Password
            </Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-charcoal/35" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                aria-invalid={!!error}
                className="h-14 rounded-xl border-softgray bg-white pl-12 pr-12 text-[15px] text-charcoal transition-all duration-200 placeholder:text-charcoal/35 focus-visible:border-navy focus-visible:ring-2 focus-visible:ring-navy/20 focus-visible:ring-offset-0"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-charcoal/40 transition-colors hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/30"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-charcoal/70">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-softgray accent-navy"
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-navy/80 transition-colors hover:text-gold"
            >
              Forgot password?
            </Link>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="group relative flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#16223f] to-navy text-[15px] font-medium text-white shadow-[0_12px_30px_-12px_rgba(11,19,43,0.7)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-12px_rgba(11,19,43,0.75)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-charcoal/55">Don't have an account?</p>
          <Link
            to="/signup"
            className="mt-3 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-gold/60 bg-white text-sm font-medium text-charcoal transition-all duration-200 hover:-translate-y-0.5 hover:border-gold hover:bg-gold/5"
          >
            <UserPlus className="h-4 w-4 text-gold" />
            Register Here
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
