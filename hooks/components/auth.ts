import { supabase } from "@/lib/supabase";
import { IAuthFields } from "@/types/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

export const useLoginForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IAuthFields>();

  const onSubmit = async (data: IAuthFields) => {
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/dashboard");
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
