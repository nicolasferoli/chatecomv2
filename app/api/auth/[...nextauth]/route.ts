import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GithubProvider from "next-auth/providers/github";

// Em um ambiente real, você armazenaria essa lista no banco de dados
// Esta lista é apenas para demonstração
let registeredUsers: { id: string; name: string; email: string; password: string }[] = [
  {
    id: "1",
    name: "Usuário Teste",
    email: "teste@exemplo.com",
    password: "senha123"
  }
];

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Em um ambiente real, você consultaria seu banco de dados
        // Verificando se existe um usuário com as credenciais fornecidas
        const user = registeredUsers.find(
          (user) => user.email === credentials.email && user.password === credentials.password
        );

        if (user) {
          // Retornar apenas dados que não sejam sensíveis
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`
          };
        }
        
        return null;
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GithubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    })
  ],
  pages: {
    signIn: '/login',
    // signOut: '/auth/signout',
    // error: '/auth/error',
    // newUser: '/auth/new-user'
  },
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Você pode adicionar mais dados ao token se necessário
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // Adicione outros campos personalizados que você queira na sessão
      }
      return session;
    },
  },
};

// Função auxiliar para registrar um usuário (usado pela API)
export async function registerUser(name: string, email: string, password: string) {
  // Verificar se o email já existe
  const existingUser = registeredUsers.find(user => user.email === email);
  if (existingUser) {
    throw new Error('Este email já está em uso');
  }

  // Criando novo usuário
  const newUser = {
    id: Math.random().toString(36).substring(2, 15),
    name,
    email,
    password // Em um ambiente real, você armazenaria a senha criptografada
  };

  // Adicionando à "base de dados" em memória
  registeredUsers.push(newUser);

  // Retornando o usuário sem a senha
  const { password: _, ...userWithoutPassword } = newUser;
  return userWithoutPassword;
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 