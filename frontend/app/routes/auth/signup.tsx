import { useState } from "react";
import { useNavigate } from "react-router";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  HiOutlineUser,
  HiOutlineMail,
  HiOutlineLockClosed,
} from "react-icons/hi";
import { toast } from "sonner";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: authError } = await authClient.signUp.email({
        email,
        password,
        name,
        callbackURL: "/dashboard/student",
      });

      if (authError) {
        setError(authError.message || "Registration failed");
        toast.error(authError.message || "Registration failed");
      } else {
        toast.success("Account created successfully! Redirecting...");
        navigate("/dashboard/student");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-3">
          Create account
        </h1>
        <p className="text-slate-500 text-lg">
          Join our community and start learning today.
        </p>
      </div>

      <form onSubmit={handleSignup} className="space-y-6">
        <div className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="text-sm font-semibold text-slate-700 ml-1"
            >
              Full Name
            </label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<HiOutlineUser size={20} />}
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-slate-700 ml-1"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<HiOutlineMail size={20} />}
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-slate-700 ml-1"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<HiOutlineLockClosed size={20} />}
              required
            />
          </div>
        </div>

        {error && (
          <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-2xl animate-shake">
            {error}
          </div>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full py-8 text-lg shadow-lg shadow-primary/20"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create account"}
        </Button>

        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-slate-100"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-4 text-slate-400 font-medium tracking-wider">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full py-8 text-lg border-slate-100 hover:bg-slate-50 shadow-sm"
          onClick={() => {
            authClient.signIn.social({
              provider: "google",
              callbackURL: "http://localhost:5173/dashboard/student",
            });
          }}
        >
          <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-3.71 3.32-7.77 3.32-12.25z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.36-3.71 1.36-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.25c-.22-.66-.35-1.36-.35-2.25 0-1.09.13-2.09.35-3.00H2.18v2.84C2.18 14.25 5.84 14.25 5.84 14.25z"
              fill="#FBBC05"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.36-3.71 1.36-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#EA4335"
            />
          </svg>
          Google
        </Button>

        <p className="text-center text-sm text-slate-500 mt-8">
          Already have an account?{" "}
          <a
            href="/login"
            className="text-primary font-bold hover:text-indigo-600 transition-colors"
          >
            Log in
          </a>
        </p>
      </form>
    </div>
  );
}
