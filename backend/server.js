/* backend/server.js */
import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from 'dotenv';

// CARREGA AS VARIÁVEIS DO ARQUIVO .ENV
dotenv.config();

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIGURAÇÕES GERAIS
const OLLAMA_URL = 'http://127.0.0.1:11434/api/generate';
const OLLAMA_MODEL = 'llama3.2'; 
const JWT_SECRET = process.env.JWT_SECRET || 'chave-secreta-padrao-tcc';
const PORT = process.env.PORT || 3000;

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURAÇÃO DO EMAIL REAL (NODEMAILER)
// O sistema usa os dados do arquivo .env para autenticar
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS
    }
});

// LISTA DE EQUIPAMENTOS (Para IA)
const EQUIPMENT_LIST = [
    "Impressora 3D Finder 01", "Impressora 3D Finder 02", "Cortadora a Laser", 
    "Prototipadora", "Bambu Lab A1", "X1 Carbon Combo", "Estação de Solda", 
    "Furadeira de Bancada", "Serra Tico-Tico", "Máquina de Costura", 
    "Plotter de Recorte", "Parafusadeira", "Lixadeira Portátil", "Scanner 3D"
];

// --- BANCO DE DADOS (SQLite) ---
const db = new sqlite3.Database('./inovfablab.db', (err) => {
    if (err) console.error("❌ Erro no DB:", err.message);
    else console.log('✅ Banco de dados conectado.');
});

db.serialize(() => {
    // Tabela de Usuários
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        name TEXT, 
        email TEXT UNIQUE, 
        ra TEXT, 
        password TEXT,
        isTempPassword INTEGER DEFAULT 0
    )`);
    
    // Tabela de Agendamentos
    db.run(`CREATE TABLE IF NOT EXISTS appointments (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        userId INTEGER, 
        equipment TEXT, 
        date TEXT, 
        startTime TEXT, 
        endTime TEXT,
        status TEXT DEFAULT 'Confirmado', 
        FOREIGN KEY(userId) REFERENCES users(id)
    )`);
});

// --- FUNÇÕES AUXILIARES ---
const checkAvailability = (equipment, date, newStart, newEnd) => {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT count(*) as count FROM appointments 
            WHERE equipment = ? AND date = ? AND status != 'Cancelado'
            AND startTime < ? AND endTime > ?
        `;
        db.get(query, [equipment, date, newEnd, newStart], (err, row) => {
            if (err) reject(err); else resolve(row.count > 0);
        });
    });
};

const createAppointment = (userId, equipment, date, startTime, endTime) => {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO appointments (userId, equipment, date, startTime, endTime) VALUES (?, ?, ?, ?, ?)`;
        db.run(query, [userId, equipment, date, startTime, endTime], function(err) {
            if (err) reject(err); else resolve(this.lastID);
        });
    });
};

// --- ROTAS DA API ---

// 1. LOGIN
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (!user) return res.status(404).json({ error: "Usuário não encontrado." });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Senha inválida." });
        
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
        
        res.json({ 
            auth: true, 
            token, 
            name: user.name, 
            id: user.id, 
            ra: user.ra,
            email: user.email,
            isTempPassword: user.isTempPassword 
        });
    });
});

// 2. CADASTRO
app.post('/api/register', async (req, res) => {
    const { fullName, email, ra, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    db.run(`INSERT INTO users (name, email, ra, password, isTempPassword) VALUES (?, ?, ?, ?, 0)`, [fullName, email, ra, hashedPassword], function(err) {
        if (err) return res.status(400).json({ error: "Erro ao cadastrar. E-mail já existe?" });
        res.json({ message: "Sucesso!" });
    });
});

// 3. RECUPERAÇÃO DE SENHA (ENVIO REAL)
app.post('/api/reset-password', async (req, res) => {
    const { email } = req.body;

    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err) return res.status(500).json({ error: "Erro no banco." });
        if (!user) return res.status(404).json({ error: "E-mail não encontrado." });

        const tempPassword = crypto.randomBytes(4).toString('hex');
        const hashedPassword = await bcrypt.hash(tempPassword, 8);

        db.run(`UPDATE users SET password = ?, isTempPassword = 1 WHERE id = ?`, [hashedPassword, user.id], async function(err) {
            if (err) return res.status(500).json({ error: "Erro ao atualizar senha." });

            const mailOptions = {
                from: `"INOVFABLAB System" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: '🔐 Recuperação de Senha',
                html: `
                    <div style="font-family: Arial; color: #333;">
                        <h2>Olá, ${user.name}!</h2>
                        <p>Sua nova senha temporária é:</p>
                        <h1 style="background: #f4f4f4; padding: 10px; color: #004aad;">${tempPassword}</h1>
                        <p>Use esta senha para entrar e crie uma nova senha imediatamente.</p>
                    </div>
                `
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log(`✅ E-mail enviado para ${email}`);
                res.json({ message: "Senha enviada para seu e-mail!" });
            } catch (error) {
                console.error("❌ Falha envio:", error);
                res.status(500).json({ error: "Erro ao enviar e-mail." });
            }
        });
    });
});

// 4. TROCAR SENHA
app.post('/api/change-password', async (req, res) => {
    const { userId, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 8);
    db.run(`UPDATE users SET password = ?, isTempPassword = 0 WHERE id = ?`, [hashedPassword, userId], function(err) {
        if (err) return res.status(500).json({ error: "Erro ao salvar." });
        res.json({ message: "Senha alterada com sucesso!" });
    });
});

// 5. AGENDAMENTO MANUAL
app.post('/api/schedule', async (req, res) => {
    const { userId, equipment, date, startTime, endTime } = req.body;

    if (!userId) return res.status(401).json({ error: "Faça login." });
    if (!startTime || !endTime) return res.status(400).json({ error: "Horários inválidos." });

    const hoje = new Date().toISOString().split('T')[0];
    if (date < hoje) return res.status(400).json({ error: "Data passada." });
    if (startTime >= endTime) return res.status(400).json({ error: "Hora final deve ser maior." });
    if (startTime < "08:00" || endTime > "22:00") return res.status(400).json({ error: "Fora do expediente." });
    
    const [hS, mS] = startTime.split(':').map(Number);
    const [hE, mE] = endTime.split(':').map(Number);
    if (mS % 5 !== 0 || mE % 5 !== 0) return res.status(400).json({ error: "Use múltiplos de 5 min." });

    try {
        const isTaken = await checkAvailability(equipment, date, startTime, endTime);
        if (isTaken) return res.status(409).json({ error: "Horário ocupado." });
        await createAppointment(userId, equipment, date, startTime, endTime);
        res.json({ message: "Agendado!" });
    } catch (err) { res.status(500).json({ error: "Erro interno." }); }
});

// 6. LISTAR AGENDAMENTOS
app.get('/api/appointments/:userId', (req, res) => {
    const { userId } = req.params;
    db.all(`SELECT * FROM appointments WHERE userId = ? ORDER BY date DESC, startTime ASC`, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: "Erro." });
        res.json(rows);
    });
});

// 7. CANCELAR
app.put('/api/appointments/:id/cancel', (req, res) => {
    const { id } = req.params;
    db.run(`UPDATE appointments SET status = 'Cancelado' WHERE id = ?`, [id], function(err) {
        if (err || this.changes === 0) return res.status(500).json({ error: "Erro." });
        res.json({ message: "Cancelado." });
    });
});

// 8. STATUS REAL
app.get('/api/equipment-status', (req, res) => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

    db.all(`SELECT equipment, startTime, endTime FROM appointments WHERE date = ? AND status != 'Cancelado'`, [today], (err, rows) => {
        const busy = [];
        if (rows) rows.forEach(r => { if (timeStr >= r.startTime && timeStr < r.endTime) busy.push(r.equipment); });
        res.json({ busy });
    });
});

// 9. CHATBOT IA
app.post('/api/chat', async (req, res) => {
    const { message, userName, userId } = req.body; 
    const today = new Date().toISOString().split('T')[0];
    let systemMessage = "";

    const extractionPrompt = `
        Analise a mensagem. Hoje: ${today}. Equipamentos: ${EQUIPMENT_LIST.join(', ')}.
        Se for agendamento (Equipamento + Data + Inicio + Fim), retorne JSON:
        {"intent": "schedule", "equipment": "Nome", "date": "YYYY-MM-DD", "startTime": "HH:MM", "endTime": "HH:MM"}
        Se for conversa: {"intent": "chat"}
        Msg: "${message}"
    `;

    try {
        const decisionRes = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: OLLAMA_MODEL, prompt: extractionPrompt, stream: false, format: "json" })
        });
        const decisionJson = await decisionRes.json();
        const analysis = JSON.parse(decisionJson.response);

        if (analysis.intent === "schedule" && analysis.equipment && analysis.date && analysis.startTime && analysis.endTime) {
            if (!userId) systemMessage = "Usuário não logado.";
            else {
                const isTaken = await checkAvailability(analysis.equipment, analysis.date, analysis.startTime, analysis.endTime);
                if (isTaken) systemMessage = "Falha: Horário ocupado.";
                else {
                    await createAppointment(userId, analysis.equipment, analysis.date, analysis.startTime, analysis.endTime);
                    systemMessage = `Sucesso! Agendado: ${analysis.equipment}, ${analysis.date}, ${analysis.startTime}-${analysis.endTime}.`;
                }
            }
        }
    } catch (e) { console.error("Erro IA:", e); }

    try {
        const prompt = `Você é o assistente INOVFABLAB. Usuário: ${userName}. Aviso Sistema: ${systemMessage}. Msg: ${message}. Responda em PT-BR.`;
        const response = await fetch(OLLAMA_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: OLLAMA_MODEL, prompt: prompt, stream: true })
        });
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        for await (const chunk of response.body) {
            const lines = chunk.toString().split('\n');
            for (const line of lines) {
                if (!line) continue;
                try {
                    const json = JSON.parse(line);
                    if (json.response) res.write(json.response);
                    if (json.done) { res.end(); return; }
                } catch (e) {}
            }
        }
        res.end();
    } catch (error) { res.status(500).end("Erro IA."); }
});

// 10. FORMULÁRIO DE CONTATO (CORRIGIDO)
app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: "Preencha todos os campos." });
    }

    const mailOptions = {
        // Envia DO sistema PARA o admin (você), mas com Reply-To do aluno
        from: `"Contato Site" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: `[Contato] ${subject}`,
        html: `
            <div style="font-family: Arial; border: 1px solid #eee; padding: 20px;">
                <h2 style="color: #004aad;">Nova Mensagem</h2>
                <p><strong>Nome:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Assunto:</strong> ${subject}</p>
                <div style="background:#f9f9f9; padding:15px; margin-top:10px;">${message.replace(/\n/g, '<br>')}</div>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`📩 Contato de ${email}`);
        res.json({ message: "Mensagem enviada com sucesso!" });
    } catch (error) {
        console.error("❌ Erro envio contato:", error);
        res.status(500).json({ error: "Erro ao enviar e-mail." });
    }
});

app.listen(PORT, () => console.log(`🔥 Servidor rodando na porta ${PORT}`));