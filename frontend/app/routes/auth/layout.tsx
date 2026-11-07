import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";

export default function AuthLayout() {
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      const { data: session } = await authClient.getSession();
      if (session) {
        navigate("/");
      }
    }
    checkAuth();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-8 lg:p-0">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[40px] shadow-soft-3d overflow-hidden border border-slate-100">

        {/* Left Side: Visual Branding Section */}
        <div className="hidden lg:flex flex-col justify-center items-center p-12 bg-accent relative overflow-hidden">
          {/* Decorative Soft Gradient Blobs */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"></div>

          <div className="relative z-10 w-full max-w-md text-center">
            <div className="mb-12 flex justify-center">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="w-8 h-8 bg-primary rounded-lg rotate-45"></div>
              </div>
            </div>

            <div className="relative mb-12 group">
              <div className="absolute -inset-4 bg-primary/20 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <img
                src="/auth-image.png"
                alt="Learning Journey"
                className="relative w-full aspect-square object-cover rounded-[32px] shadow-xl transform group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>

            <h2 className="text-4xl font-extrabold tracking-tight text-foreground mb-4 leading-tight">
              Elevate Your <span className="text-primary">Knowledge</span>
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              Experience the future of learning with AI-driven personalization and immersive content.
            </p>
          </div>
        </div>

        {/* Right Side: Form Section */}
        <div className="p-8 sm:p-12 lg:p-20 flex flex-col justify-center">
          <div className="w-full max-w-md mx-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
