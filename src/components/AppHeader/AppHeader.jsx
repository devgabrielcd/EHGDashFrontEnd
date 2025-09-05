// components/AppHeader/AppHeader.jsx
import { auth } from "@/auth";
import { Header } from "antd/es/layout/layout";
import { Avatar } from "antd";
import Link from "next/link";

import ThemeSwitch from "@/components/Themes/ThemeSwitch";
import styles from "./AppHeader.module.css";
import SearchBar from "../navbar/SearchBar";

export default async function AppHeader() {
  const session = await auth();
  const firstName =
    session?.user?.details?.first_name ||
    session?.user?.first_name ||
    session?.user?.name ||
    "User";

  return (
    <Header className={styles.header}>
      {/* Logo + Brand */}
      <div className={styles.logoContainer}>
        {/* coloque seu componente de logo se quiser */}
        <Link href="/" className={styles.logoText}>EHGCorp Dashboard</Link>
      </div>

      {/* Busca */}
      <div className={styles.searchContainer}>
        <SearchBar />
      </div>

      {/* Right side: theme switch + avatar + user text */}
      <div className={styles.userContainer}>
        <ThemeSwitch />
        <Link href="/profile" aria-label="Profile">
          <Avatar size={40} src="/profile.jpeg" />
        </Link>
        <div className={styles.userInfo}>
          <p>logged as:</p>
          <p>{firstName}</p>
        </div>
      </div>
    </Header>
  );
}
