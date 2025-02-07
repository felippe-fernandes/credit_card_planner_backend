'use client';

import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const withAuth = (WrappedComponent: React.FC) => {
    return function ProtectedRoute(props: React.ComponentProps<typeof WrappedComponent>) {
        const [loading, setLoading] = useState(true);
        const [user, setUser] = useState<Session['user'] | null>(null);
        const router = useRouter();

        useEffect(() => {
            const checkUser = async () => {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) {
                    router.push("/auth"); // Se não estiver autenticado, redireciona
                } else {
                    setUser(session.user);
                }
                setLoading(false);
            };

            checkUser();
        }, [router]);

        if (loading) return <div className="text-center mt-10">Carregando...</div>;
        return user ? <WrappedComponent {...props} /> : null;
    };
};

export default withAuth;
