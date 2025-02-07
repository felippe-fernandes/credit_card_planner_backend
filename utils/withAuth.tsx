"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const withAuth = (WrappedComponent: React.FC) => {
  return function ProtectedRoute(
    props: React.ComponentProps<typeof WrappedComponent>
  ) {
    const router = useRouter();
    const { session, user } = useAuth();
    console.log("🚀 | session:", session);

    useEffect(() => {
      if (!session) {
        router.push("/auth/login");
      }
    }, [session, router]);

    return user ? <WrappedComponent {...props} /> : null;
  };
};

export default withAuth;
