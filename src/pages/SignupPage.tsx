import { useMemo, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";

import { AuthShell } from "@/components/auth/AuthShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { ApiError } from "@/lib/api";

const DEFAULT_ORG = "Elangovan Associates";

type Strength = { bars: 0 | 1 | 2 | 3; label: string; bar: string; text: string };

/** Real-time password strength heuristic. */
function passwordStrength(pw: string): Strength {
  if (!pw) return { bars: 0, label: "", bar: "", text: "" };
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw) && /\d/.test(pw)) score += 1;
  if (pw.length >= 12 || /[^A-Za-z0-9]/.test(pw)) score += 1;
  const bars = Math.max(1, score) as 1 | 2 | 3;
  if (bars === 1) return { bars, label: "Weak", bar: "bg-red-400", text: "text-red-500" };
  if (bars === 2) return { bars, label: "Medium", bar: "bg-gold", text: "text-gold" };
  return { bars: 3, label: "Strong", bar: "bg-emerald-500", text: "text-emerald-600" };
}

export default function SignupPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState("");
  const [orgName, setOrgName] = useState(DEFAULT_ORG);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await register({
        email,
        password,
        full_name: fullName.trim() || undefined,
        organization_name: orgName.trim() || undefined,
      });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to create account");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "h-14 rounded-xl border-softgray bg-white pl-12 pr-4 text-[15px] text-charcoal transition-all duration-200 placeholder:text-charcoal/35 focus-visible:border-navy focus-visible:ring-2 focus-visible:ring-navy/20 focus-visible:ring-offset-0";

  return (
    <AuthShell>
      <div className="flex w-full max-w-[520px] animate-fade-in flex-col gap-4">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 self-start text-sm font-medium text-gold transition-colors hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Sign In
        </Link>

        <div className="rounded-[28px] border border-black/5 bg-white p-8 shadow-[0_30px_70px_-25px_rgba(11,19,43,0.22)] sm:p-10">
          <h2 className="font-serif text-3xl font-semibold tracking-tight text-navy">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-charcoal/60">
            Start managing your work orders and invoices.
          </p>
          <div className="mt-5 h-px w-14 bg-gradient-to-r from-gold to-gold/20" />

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-charcoal">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-charcoal/35" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  aria-invalid={!!error}
                  className={inputClass}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-charcoal">
                Password
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-charcoal/35" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  aria-describedby="password-help"
                  className={`${inputClass} pr-12`}
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

              {/* Strength meter + helper */}
              <div className="flex items-center justify-between gap-3 pt-0.5">
                <div className="flex flex-1 gap-1.5" aria-hidden="true">
                  {[1, 2, 3].map((i) => (
                    <span
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                        strength.bars >= i ? strength.bar : "bg-softgray"
                      }`}
                    />
                  ))}
                </div>
                {strength.label && (
                  <span className={`text-xs font-medium ${strength.text}`}>{strength.label}</span>
                )}
              </div>
              <p id="password-help" className="text-xs text-charcoal/45">
                At least 8 characters.
              </p>
            </div>

            {/* Full name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm font-medium text-charcoal">
                Full Name <span className="font-normal text-charcoal/45">(optional)</span>
              </Label>
              <div className="relative">
                <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-charcoal/35" />
                <Input
                  id="fullName"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Organization name */}
            <div className="space-y-2">
              <Label htmlFor="orgName" className="text-sm font-medium text-charcoal">
                Organization Name <span className="font-normal text-charcoal/45">(optional)</span>
              </Label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-charcoal/35" />
                <Input
                  id="orgName"
                  autoComplete="organization"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Enter your organization name"
                  className={inputClass}
                />
              </div>
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
              {submitting ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-charcoal/55">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-gold transition-colors hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
