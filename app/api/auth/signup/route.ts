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
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    // Salvar o usuário no banco
    const { error: dbError } = await supabase
      .from("User")
      .insert([{ id: data.user?.id, email, name }]);

    if (dbError) {
      return NextResponse.json({ message: dbError.details }, { status: 400 });
    }

    return NextResponse.json({ message: "User created successfully" });
  } catch {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
