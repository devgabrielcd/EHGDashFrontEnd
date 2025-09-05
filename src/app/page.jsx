import { auth } from "@/auth";
import Link from "next/link";
import styles from "./page.module.css";
import { SignIn } from "@/components/auth/sign-in";
import Signout from "@/components/auth/signout-button"; // 👈 importa o botão client

export default async function Home() {
  const session = await auth();

  return (
    <div className={styles.container}>
      {/* Left panel with glass effect */}
      <div className={styles.leftPanel}>
        <div className={styles.card}>
          {session ? (
            <>
              <h1 className={styles.title}>Welcome back 👋</h1>
              <p className={styles.subtitle}>
                Access your dashboard to continue.
              </p>
              <Link href="/dashboard" className={styles.primaryBtn}>
                Go to Dashboard
              </Link>

              {/* 👇 novo botão de logout */}
              <Signout className={styles.primaryBtn} />  {/* 👈 pronto, estilos iguais */}

            </>
          ) : (
            <>
              <h1 className={styles.title}>Sign In</h1>
              <p className={styles.subtitle}>
                Use your credentials to access the system.
              </p>

              {/* Login form */}
              <div className={styles.formWrapper} id="login">
                <SignIn />
              </div>

              <div className={styles.authLinks}>
                <Link href="/forgot-password" className={styles.mutedLink}>
                  Forgot your password?
                </Link>
              </div>

              <div className={styles.registerBox}>
                <span>New here?</span>
                <Link href="/register" className={styles.registerLink}>
                  Create a Customer Account
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right panel with branding/hero content */}
      <div className={styles.rightPanel}>
        <div className={styles.rightContent}>
          <h2 className={styles.heroTitle}>Welcome to EhgCorp System</h2>
          <p className={styles.heroSubtitle}>
            Your portal to Manage Your Health.
          </p>
        </div>
      </div>
    </div>
  );
}
