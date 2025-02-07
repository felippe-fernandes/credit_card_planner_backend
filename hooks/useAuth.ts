import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Session["user"] | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth"); // Redireciona para a página de login
      } else {
        setSession(session);
        setUser(session.user);
      }
    };

    checkUser();
  }, [router]);

  return { session, user };
}
