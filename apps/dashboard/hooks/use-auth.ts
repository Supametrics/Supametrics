import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signInSchema, signUpSchema } from "@repo/ui/lib/zod";
import { toast } from "sonner";
import { Response } from "@repo/ui/types";
import axiosFetch from "@repo/ui/lib/axios";
import type { ZodIssue } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export type AuthMode = "login" | "signup" | "forgot" | "reset";

export type AuthValues = {
  name?: string;
  email: string;
  password: string;
};

export function useAuth() {
  const pathname = usePathname();
  const router = useRouter();

  const mode = useMemo<AuthMode>(() => {
    if (pathname === "/signup") return "signup";
    if (pathname === "/forgot-password") return "forgot";
    if (pathname === "/reset-password") return "reset";
    return "login";
  }, [pathname]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState({
    name: "",
    email: "",
    password: "",
    general: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setError({ name: "", email: "", password: "", general: "" });
    setSuccess(false);
  };

  const values: AuthValues = { name, email, password };

  const handleErrors = (issues: ZodIssue[]) => {
    const newErrors = { name: "", email: "", password: "", general: "" };
    issues.forEach((issue) => {
      const field = issue.path[0];
      if (typeof field === "string" && field in newErrors) {
        newErrors[field as keyof typeof newErrors] = issue.message;
      } else {
        newErrors.general = issue.message;
        toast.error(issue.message);
      }
    });
    setError(newErrors);
  };

  const validateField = (field: keyof AuthValues, value: string) => {
    try {
      let result;
      if (mode === "signup" && field === "name") {
        result = signUpSchema.shape.name.safeParse(value);
      } else {
        const schemaField =
          signInSchema.shape[field as keyof typeof signInSchema.shape];
        if (!schemaField) return;
        result = schemaField.safeParse(value);
      }

      if (result.success) {
        setError((prev) => ({ ...prev, [field]: "" }));
      } else {
        const message = result.error.issues[0]?.message || "Invalid input";
        setError((prev) => ({ ...prev, [field]: message }));
      }
    } catch {
      // ignore
    }
  };

  const handleSignIn = async () => {
    const isValid = signInSchema.safeParse(values);
    if (!isValid.success) {
      handleErrors(isValid.error.issues);
      return;
    }

    try {
      setLoading(true);
      const { data: res } = await axiosFetch.post<Response>(
        "/auth/signin",
        values,
      );
      if (!res.success) throw new Error(res?.message ?? res.error);

      setSuccess(true);
      toast.success(res.message);

      // Redirect to dashboard after login
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error signing in";
      setError((prev) => ({ ...prev, general: message }));
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    const isValid = signUpSchema.safeParse(values);
    if (!isValid.success) {
      handleErrors(isValid.error.issues);
      return;
    }

    try {
      setLoading(true);
      const { data: res } = await axiosFetch.post<Response>(
        "/auth/login",
        values,
      );

      if (!res.success) throw new Error(res?.message ?? res.error);

      setSuccess(true);
      toast.success(res.message);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error signing up";
      setError((prev) => ({ ...prev, general: message }));
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError((prev) => ({ ...prev, email: "Email is required" }));
      return;
    }

    try {
      setLoading(true);
      const { data: res } = await axiosFetch.post<Response>(
        "/auth/forgot-password",
        {
          email,
        },
      );
      if (!res.success) throw new Error(res?.message ?? res.error);

      setSuccess(true);
      toast.success(res.message);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error sending reset email";
      setError((prev) => ({ ...prev, general: message }));
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!password) {
      setError((prev) => ({ ...prev, password: "Password is required" }));
      return;
    }
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      return toast.error("Invalid or missing reset token.");
    }

    try {
      setLoading(true);
      const { data: res } = await axiosFetch.post<Response>(
        "/auth/verify-reset-password",
        { token, password },
      );
      if (!res.success) throw new Error(res?.message ?? res.error);

      setSuccess(true);
      toast.success(res.message);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Error resetting password";
      setError((prev) => ({ ...prev, general: message }));
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    mode,
    values,
    error,
    loading,
    success,
    setName,
    name,
    email,
    password,
    setEmail,
    setPassword,
    reset,
    signin: handleSignIn,
    signup: handleSignUp,
    forgotPassword: handleForgotPassword,
    resetPassword: handleResetPassword,
    validateField,
    googleLogin: async () => {
      console.log("google login not implemented yet");
    },
  };
}

export const useUpdateProfileName = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const { data: res } = await axiosFetch.patch("/profile", { name });
      return res;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.success(data?.message || "Profile updated successfully");
    },
    onError: (err) => {
      if (err instanceof Error) {
        toast.error(err?.message || "Failed to update profile name");
      }
    },
  });
};
