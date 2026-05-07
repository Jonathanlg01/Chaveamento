"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";

// ------- Tipos de estado do formulário -------

export type LoginState = {
  error?: string;
} | null;

// ------- Login -------

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  // 1. Validação básica
  if (!email || !password) {
    return { error: "Preencha todos os campos." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { error: "Formato de e-mail inválido." };
  }

  // 2. Buscar usuário no banco
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    return { error: "E-mail ou senha incorretos." };
  }

  // 3. Verificar senha
  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return { error: "E-mail ou senha incorretos." };
  }

  // 4. Criar sessão via cookie
  await createSession(user.id, user.role);

  // 5. Redirecionar para o dashboard
  redirect("/dashboard");
}

// ------- Registro -------

export async function registerAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!name || !email || !password || !confirmPassword) {
    return { error: "Preencha todos os campos." };
  }

  if (password !== confirmPassword) {
    return { error: "As senhas não coincidem." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { error: "Formato de e-mail inválido." };
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (existingUser) {
    return { error: "Este e-mail já está em uso." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
    },
  });

  await createSession(newUser.id, newUser.role);
  redirect("/dashboard");
}

// ------- Logout -------

export async function logoutAction() {
  await deleteSession();
  redirect("/");
}
