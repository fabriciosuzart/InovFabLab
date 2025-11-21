/* backend/server.js - VERSÃO OTIMIZADA PARA DOCUMENTOS GRANDES */
import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pipeline } from '@xenova/transformers';
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');
const mammoth = require('mammoth');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DOCUMENTS_PATH = path.join(__dirname, 'documents');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'sua_chave_secreta_super_segura';

app.use(cors());
app.use(express.json());

// --- BANCO DE DADOS ---
const db = new sqlite3.Database('./inovfablab.db', (err) => {
    if (err) console.error("❌ Erro no DB:", err.message);
    else console.log('✅ Banco de dados conectado.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT UNIQUE, ra TEXT, password TEXT)`);
    db.run(`CREATE TABLE IF NOT EXISTS appointments (id INTEGER PRIMARY KEY AUTOINCREMENT, userId INTEGER, equipment TEXT, date TEXT, time TEXT, FOREIGN KEY(userId) REFERENCES users(id))`);
});

// --- BASE DE CONHECIMENTO ---
let knowledgeBase = [
    // Mantenha seus dados fixos aqui se quiser, ou deixe vazio para usar só arquivos
    { source: "Regras Gerais", text: "O horário de funcionamento do INOVFABLAB é de segunda a sexta, das 08h às 22h." },
];

let vectorStore = [];
let embedder = null;

// --- FUNÇÃO MELHORADA: LER ARQUIVOS ---
async function loadDocuments() {
    if (!fs.existsSync(DOCUMENTS_PATH)) {
        fs.mkdirSync(DOCUMENTS_PATH);
        console.log("📂 Pasta 'documents' criada.");
        return;
    }

    const files = fs.readdirSync(DOCUMENTS_PATH);
    console.log(`📂 Lendo ${files.length} arquivos...`);

    for (const file of files) {
        const filePath = path.join(DOCUMENTS_PATH, file);
        const ext = path.extname(file).toLowerCase();
        let textContent = "";

        try {
            if (ext === '.pdf') {
                const dataBuffer = fs.readFileSync(filePath);
                const data = await pdf(dataBuffer);
                textContent = data.text;
            } else if (ext === '.docx') {
                const result = await mammoth.extractRawText({ path: filePath });
                textContent = result.value;
            } else if (ext === '.txt') {
                textContent = fs.readFileSync(filePath, 'utf-8');
            }

            if (textContent) {
                const cleanText = textContent.replace(/\n+/g, ' ').trim();
                
                // --- MELHORIA 1: CHUNKS MAIORES (2000 caracteres) ---
                // Isso garante que listas longas fiquem juntas no mesmo contexto
                const chunkSize = 2000; 
                for (let i = 0; i < cleanText.length; i += chunkSize) {
                    const chunk = cleanText.substring(i, i + chunkSize);
                    knowledgeBase.push({
                        source: `Arquivo: ${file}`,
                        text: chunk
                    });
                }
                console.log(`   ✅ Lido: ${file}`);
            }
        } catch (error) {
            console.error(`   ❌ Erro ao ler ${file}:`, error.message);
        }
    }
}

async function initAI() {
    await loadDocuments();
    console.log("🧠 Carregando modelo de IA...");
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    
    console.log(`📊 Processando ${knowledgeBase.length} blocos de informação...`);
    for (let i = 0; i < knowledgeBase.length; i++) {
        const item = knowledgeBase[i];
        const output = await embedder(item.text, { pooling: 'mean', normalize: true });
        vectorStore.push({ id: i, text: item.text, source: item.source, vector: output.data });
    }
    console.log("🚀 IA RAG Pronta!");
}
initAI();

function cosineSimilarity(vecA, vecB) {
    let dot = 0.0, normA = 0.0, normB = 0.0;
    for (let i = 0; i < vecA.length; i++) {
        dot += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// --- ROTAS ---
app.post('/api/register', async (req, res) => {
    const { fullName, email, ra, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 8);
    db.run(`INSERT INTO users (name, email, ra, password) VALUES (?, ?, ?, ?)`, [fullName, email, ra, hashedPassword], function(err) {
        if (err) return res.status(400).json({ error: "Erro ao cadastrar." });
        res.json({ message: "Sucesso!" });
    });
});

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (!user) return res.status(404).json({ error: "Usuário não encontrado." });
        if (!(await bcrypt.compare(password, user.password))) return res.status(401).json({ error: "Senha inválida." });
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: 86400 });
        res.json({ auth: true, token, name: user.name, id: user.id });
    });
});

app.post('/api/schedule', (req, res) => {
    const { userId, equipment, date, time } = req.body;
    db.run(`INSERT INTO appointments (userId, equipment, date, time) VALUES (?, ?, ?, ?)`, [userId, equipment, date, time], (err) => {
        if (err) return res.status(500).json({ error: "Erro." });
        res.json({ message: "Agendado!" });
    });
});

app.post('/api/chat', async (req, res) => {
    const { message } = req.body;
    console.log("💬 Pergunta:", message);

    try {
        const output = await embedder(message, { pooling: 'mean', normalize: true });
        const queryVector = output.data;

        const results = vectorStore.map(item => ({
            item,
            score: cosineSimilarity(queryVector, item.vector)
        }));
        
        // --- MELHORIA 2: PEGAR MAIS RESULTADOS (TOP 10) ---
        // Aumentando para 10, a IA recebe muito mais contexto para ler listas grandes
        const topResults = results.sort((a, b) => b.score - a.score).slice(0, 10);
        
        const contextText = topResults.map(r => r.item.text).join("\n\n---\n\n");

        const prompt = `
            Você é o assistente do INOVFABLAB.
            Use APENAS o contexto abaixo para responder.
            Não mencione nomes de arquivos ou "partes" do texto.
            Se a pergunta for "quais equipamentos", liste TODOS que aparecem no contexto.

            CONTEXTO:
            ${contextText}

            PERGUNTA:
            ${message}

            RESPOSTA:
        `;

        const response = await fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: "llama3", prompt: prompt, stream: false })
        });

        const data = await response.json();
        res.json({ reply: data.response });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro na IA." });
    }
});

app.listen(PORT, () => console.log(`🔥 Servidor: http://localhost:${PORT}`));