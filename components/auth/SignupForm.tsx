"use client";

import Input from "@/components/commons/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSignUpForm } from "@/hooks/components/auth";
import { cn } from "@/lib/utils";

export function SignupForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const { error, formErrors, handleSubmit, isSubmitting, onSubmit, register } =
    useSignUpForm();

  const nameRegister = {
    ...register("name", { required: "Name is required" }),
  };
  const emailRegister = {
    ...register("email", { required: "Email is required" }),
  };
  const passwordRegister = {
    ...register("password", { required: "Password is required" }),
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Input
                    label="Name"
                    id="Name"
                    type="text"
                    placeholder="John Doe"
                    required
                    register={nameRegister}
                    formErrors={formErrors}
                  />
                </div>
                <div className="grid gap-2">
                  <Input
                    label="Email"
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    required
                    register={emailRegister}
                    formErrors={formErrors}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center"></div>
                  <Input
                    label="Password"
                    id="password"
                    type="password"
                    placeholder="At least 6 characters"
                    required
                    register={passwordRegister}
                    formErrors={formErrors}
                  />
                </div>
                {error && (
                  <p className="text-red-500 text-sm">{error.message}</p>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating account..." : "Create Account"}
                </Button>
              </div>
              <div className="text-center text-sm">
                Already have an account?{" "}
                <a href="/auth/login" className="underline underline-offset-4">
                  Login
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  );
}
