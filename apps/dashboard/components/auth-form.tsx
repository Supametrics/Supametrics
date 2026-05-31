"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import { cn } from "@repo/ui/lib/utils";
import { Button } from "@repo/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "@repo/ui/components/ui/label";
import { IconBrandGithub, IconBrandGoogle, IconEye, IconEyeOff } from "@tabler/icons-react";
import { LoadingSpinner } from "@repo/ui/components/loading-spinner";

import { useAuth } from "@/hooks/use-auth";

export function AuthForm({ className, ...props }: React.ComponentProps<"div">) {
  const pathname = usePathname();
  const mode = useMemo<"login" | "signup" | "forgot" | "reset">(() => {
    if (pathname === "/signup") return "signup";
    if (pathname === "/forgot-password") return "forgot";
    if (pathname.startsWith("/reset-password")) return "reset";
    return "login";
  }, [pathname]);

  const [showPassword, setShowPassword] = useState(false);

  const {
    signup,
    signin,
    forgotPassword,
    resetPassword,
    googleLogin,
    loading,
    error,
    email,
    password,
    name,
    setEmail,
    setPassword,
    validateField,
    setName,
  } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "signup") {
      await signup();
    } else if (mode === "login") {
      await signin();
    } else if (mode === "forgot") {
      await forgotPassword();
    } else if (mode === "reset") {
      await resetPassword();
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center md:px-4 md:py-10",
        className
      )}
      {...props}
    >
      <Card className="w-full max-w-lg md:w-[700px]">
        <CardHeader>
          <CardTitle className="text-lg md:text-2xl">
            {
              {
                login: "Login to Supametrics",
                signup: "Create a new account",
                forgot: "Forgot your password?",
                reset: "Reset your password",
              }[mode]
            }
          </CardTitle>
          <CardDescription className="mb-4">
            {
              {
                login: "Enter your email below to login to your account",
                signup: "Sign up with your email to get started",
                forgot: "We'll send you a link to reset your password",
                reset: "Enter your new password below to reset your account",
              }[mode]
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-6">
              {mode === "signup" && (
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => validateField("name", name)}
                    required
                  />
                  {error?.name && (
                    <p className="text-sm text-red-500">{error.name}</p>
                  )}
                </div>
              )}

              {mode !== "reset" && (
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => validateField("email", email)}
                    required
                  />
                  {error?.email && (
                    <p className="text-sm text-red-500">{error.email}</p>
                  )}
                </div>
              )}

              {(mode === "login" || mode === "signup" || mode === "reset") && (
                <div className="grid gap-2">
                  <Label htmlFor="password">
                    {mode === "reset" ? "New Password" : "Password"}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => validateField("password", password)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <IconEyeOff size={20} />
                      ) : (
                        <IconEye size={20} />
                      )}
                    </button>
                  </div>
                  {error?.password && (
                    <p className="text-sm text-red-500">{error.password}</p>
                  )}
                </div>
              )}

              {mode === "login" && (
                <div>
                  <Link
                    href="/forgot-password"
                    className="text-main text-right block text-sm font-semibold"
                  >
                    Forgotten Password?
                  </Link>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <LoadingSpinner loading={loading} />
                ) : (
                  {
                    login: "Login",
                    signup: "Sign up",
                    forgot: "Send reset link",
                    reset: "Reset Password",
                  }[mode]
                )}
              </Button>

              {mode === "signup" && (
                <p className="text-sm text-center text-muted-foreground">
                  By signing up, you agree to our{" "}
                  <Link
                    href="/terms"
                    className="underline underline-offset-4 font-semibold"
                  >
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="underline underline-offset-4 font-semibold"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              )}

              {/* eslint-disable-next-line*/}
              {mode !== "forgot" && mode !== "reset" && false && (
                <>
                  <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                    <span className="relative z-10 bg-background md:bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={googleLogin}
                  >
                    <IconBrandGoogle size={18} />
                    Continue with Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="-mt-1 w-full flex items-center justify-center gap-2"
                  >
                    <IconBrandGithub size={18} />
                    Continue with GitHub
                  </Button>
                </>
              )}
            </div>

            {mode !== "forgot" && mode !== "reset" && (
              <div className="text-center text-sm mt-6">
                {mode === "login" ? (
                  <>
                    Don’t have an account?{" "}
                    <Link href="/signup" className="text-main font-semibold">
                      Sign up
                    </Link>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <Link href="/login" className="text-main font-semibold">
                      Log in
                    </Link>
                  </>
                )}
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
