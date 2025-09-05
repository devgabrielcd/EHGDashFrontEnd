import dynamic from "next/dynamic";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashEmployee from "@/components/DashRole/DashEmployee";
import DashCustomer from "@/components/DashRole/DashCustomer";
import DashAdmin from "@/components/DashRole/DashAdmin";



export default async function Dashboard() {
  const session = await auth();

  if (!session) {
    return redirect("/");
  }

  const user = session.user;
  console.log("DashBoardPage",user);
  // Verifica se os detalhes do usuário foram carregados
  if (!user.details) {
    return <div>Loading user details...</div>;
  }

  // Redireciona para a dashboard correta com base no `user_type`
  switch (user.details.user_role) {
    case "employee":
      return <DashEmployee user={user.details} />;
    case "customer":
      return <DashCustomer user={user.details} />;
    default:
      return <DashAdmin />;
  }
}
