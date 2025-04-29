import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      // Adicione aqui quaisquer campos personalizados que você queira na sessão
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    // Adicione aqui quaisquer campos personalizados que você queira no usuário
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    // Adicione aqui quaisquer campos personalizados que você queira no token JWT
  }
} 