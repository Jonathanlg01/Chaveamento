import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

// dotenv/config já carregou DATABASE_URL do .env
// PrismaClient lê automaticamente via env
const prisma = new PrismaClient();


async function main() {
  const adminEmail = "admin@chaveamento.pro";
  const adminPassword = "admin123";
  const adminName = "Administrador";

  const existing = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existing) {
    console.log(`✅ Usuário admin já existe: ${adminEmail}`);
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      role: "admin",
      name: adminName,
    },
  });

  console.log("🎉 Conta admin criada com sucesso!");
  console.log(`   Email: ${adminEmail}`);
  console.log(`   Senha: ${adminPassword}`);
  console.log(`   Role:  admin`);
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
