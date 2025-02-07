import { SignInWithPassword, SignOut, SignUp } from "@/services/auth";
import { IAuthFields } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

export const useLoginForm = () => {
  const router = useRouter();

  const { mutateAsync, error } = useMutation({
    mutationFn: SignInWithPassword,
    onSuccess: () => {
      router.push("/");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IAuthFields>();

  const onSubmit = async (data: IAuthFields) => await mutateAsync(data);

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
  const { mutateAsync, error } = useMutation({
    mutationFn: SignUp,
    onSuccess: () => {
      router.push("/dashboard");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IAuthFields>();

  const onSubmit = async (data: IAuthFields) => await mutateAsync(data);

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
  const { mutateAsync, error } = useMutation({
    mutationFn: SignOut,
    onSuccess: () => {
      router.push("/");
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<IAuthFields>();

  const onSubmit = async () => await mutateAsync();

  return {
    register,
    handleSubmit,
    formErrors: errors,
    isSubmitting,
    error,
    onSubmit,
  };
};
