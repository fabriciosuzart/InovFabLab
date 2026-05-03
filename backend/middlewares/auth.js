import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 1. Middleware de Autenticação (verifica X-User-Id)
export const authMiddleware = (req, res, next) => {
    const userId = req.headers['x-user-id'];
    
    if (!userId) {
        return res.status(401).json({ error: 'Acesso negado. Header X-User-Id ausente.' });
    }

    req.userId = parseInt(userId);
    next();
};

// 2. Middleware de Permissões (verifica a Role no DB)
export const roleMiddleware = (allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.userId) {
                return res.status(401).json({ error: 'Usuário não autenticado no middleware.' });
            }

            const user = await prisma.user.findUnique({
                where: { id: req.userId }
            });

            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado.' });
            }

            if (!allowedRoles.includes(user.role)) {
                return res.status(403).json({ error: `Acesso negado. Requer permissão: ${allowedRoles.join(' ou ')}` });
            }

            next();
        } catch (error) {
            console.error('Erro no roleMiddleware:', error);
            res.status(500).json({ error: 'Erro interno na validação de permissões.' });
        }
    };
};
