import { SignInWithPassword, SignOut, SignUp } from "@/services/auth";
import { IAuthFields } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export function useLogin() {
  return useMutation({
    mutationFn: SignInWithPassword,
  });
}

export function useSignUp() {
  return useMutation({
    mutationFn: SignUp,
  });
}

export function useSignOut() {
  return useMutation({
    mutationFn: SignOut,
  });
}

export const useLoginForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const loginMutate = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IAuthFields>();

  const onSubmit = async (data: IAuthFields) => {
    setError(null);
    try {
      await loginMutate.mutateAsync(data);
      router.push("/dashboard");
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(String(e));
      }
    }
  };

  return {
    register,
    handleSubmit,
    formErrors: errors,
    isSubmitting,
    error,
    onSubmit,
  };
};

export const useSignUpForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const signupMutate = useSignUp();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IAuthFields>();

  const onSubmit = async (data: IAuthFields) => {
    setError(null);
    try {
      await signupMutate.mutateAsync(data);
      router.push("/dashboard");
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(String(e));
      }
    }
  };

  return {
    register,
    handleSubmit,
    formErrors: errors,
    isSubmitting,
    error,
    onSubmit,
  };
};

export const useSignOutForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const signoutMutate = useSignOut();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IAuthFields>();

  const onSubmit = async () => {
    setError(null);
    try {
      await signoutMutate.mutateAsync();
      router.push("/");
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError(String(e));
      }
    }
  };

  return {
    register,
    handleSubmit,
    formErrors: errors,
    isSubmitting,
    error,
    onSubmit,
  };
};
