import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password, name } = await req.json();

    // Criar usuário no Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Salvar o usuário no banco
    const { error: dbError } = await supabase
      .from("User")
      .insert([{ id: data.user?.id, email, name }]);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 400 });
    }

    return NextResponse.json({ message: "Usuário criado com sucesso!" });
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
