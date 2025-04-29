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

export function findUserByCredentials(email: string, password: string) {
  const user = registeredUsers.find(
    (user) => user.email === email && user.password === password
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