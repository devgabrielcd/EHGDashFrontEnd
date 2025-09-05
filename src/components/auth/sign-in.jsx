// Logica de Login(Formulario). Pega o input de login e senha e passa pro 
// credentials signIn do authv5

import { signIn } from "@/auth";
import styles from "./sign-in.module.css";

export function SignIn() {
  return (
    <form
      className={styles.form}
      action={async (formData) => {
        "use server";

        const username = formData.get("username");
        const password = formData.get("password");

        const result = await signIn("credentials", {
          redirect: true,
          username,
          password,
        });

        if (result.error) {
          console.error("Error during login:", result.error);
        } else if (result?.ok) {
          window.location.href = "/dashboard";
        }
      }}
    >
      <label className={styles.label}>
        Username
        <input name="username" type="text" className={styles.input} />
      </label>
      <label className={styles.label}>
        Password
        <input name="password" type="password" className={styles.input} />
      </label>
      <button type="submit" className={styles.button}>Sign In</button>
    </form>
  );
}
