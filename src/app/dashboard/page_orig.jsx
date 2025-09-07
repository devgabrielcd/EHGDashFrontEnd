"use client";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

// importa os roles direto
import DashAdmin from "@/components/DashRole/DashAdmin";
import DashEmployee from "@/components/DashRole/DashEmployee";
import DashCustomer from "@/components/DashRole/DashCustomer";

export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    return redirect("/login");
  }

  const user = session.user;

  // Verifica se os detalhes do usuário foram carregados
  if (!user.details) {
    return <div>Loading user details...</div>;
  }

  // Renderiza conforme o tipo de usuário
  switch (user.details.user_type) {
    case "employee":
      return <DashEmployee user={user.details} />;
    case "customer":
      return <DashCustomer user={user.details} />;
    default:
      return <DashAdmin user={user.details} />;
  }
}
