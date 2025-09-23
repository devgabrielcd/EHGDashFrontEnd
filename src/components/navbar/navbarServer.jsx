// src/components/navbar/NavbarServer.jsx
import { auth } from "@/auth";

// Atenção: este arquivo é SERVER
export const dynamic = "force-dynamic";

import NavbarClient from "./NavbarClient";

function getDisplayName(user) {
  return (
    user?.name ||
    user?.first_name ||
    user?.details?.name ||
    user?.details?.first_name ||
    (user?.email ? user.email.split("@")[0] : null) ||
    "User"
  );
}

function getAvatar(user) {
  return user?.image || user?.avatar || user?.details?.avatar || undefined;
}

export default async function NavbarServer({ brand = "Dashboard" }) {
  const session = await auth();

  const isAuthenticated = Boolean(session?.accessToken);
  const user = session?.user || null;
  const accessToken = session?.accessToken || null;

  const displayName = getDisplayName(user);
  const avatarSrc = getAvatar(user);

  return (
    <NavbarClient
      brand={brand}
      isAuthenticated={isAuthenticated}
      user={user}
      accessToken={accessToken}
      displayName={displayName}
      avatarSrc={avatarSrc}
    />
  );
}
