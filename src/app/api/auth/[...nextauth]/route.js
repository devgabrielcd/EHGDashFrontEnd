//este arquivo ativa os metodos GET e POST no AUTHv5.
//Importa handlers do meu auth.js

import { handlers } from "@/auth" // Referring to the auth.ts we just created
export const { GET, POST } = handlers