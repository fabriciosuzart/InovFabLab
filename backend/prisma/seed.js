import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Iniciando o Seed do Banco de Dados...");

    const passwordHash = await bcrypt.hash("senha123", 8);

    const usersToCreate = [
        {
            name: "Administrador Geral",
            email: "admin@inovfablab.com",
            ra: "ADMIN001",
            password: passwordHash,
            role: "ADMIN"
        },
        {
            name: "Professor Responsável",
            email: "prof@inovfablab.com",
            ra: "PROF001",
            password: passwordHash,
            role: "PROFESSOR"
        },
        {
            name: "Aluno Inovador 1",
            email: "aluno1@inovfablab.com",
            ra: "ALU001",
            password: passwordHash,
            role: "ALUNO"
        },
        {
            name: "Aluno Inovador 2",
            email: "aluno2@inovfablab.com",
            ra: "ALU002",
            password: passwordHash,
            role: "ALUNO"
        }
    ];

    for (const u of usersToCreate) {
        // Usa upsert para não criar duplicado se rodar duas vezes
        await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: u,
        });
        console.log(`✅ Usuário ${u.role} (${u.email}) verificado/criado.`);
    }

    console.log("🎉 Seed concluído com sucesso!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
