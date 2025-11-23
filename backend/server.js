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

const VECTOR_CACHE_PATH = path.join(__dirname, 'vector_cache.json');

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
                // CÓDIGO NOVO (MANTÉM AS QUEBRAS DE LINHA)
                // Remove apenas excesso de espaços, mas respeita o \n
                const cleanText = textContent.replace(/\r/g, '').replace(/\n\s*\n/g, '\n').trim();
                
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
    console.log("\n🧠 Inicializando Motor de IA...");
    
    // Carrega o modelo de embeddings (Xenova)
    try {
        embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
        console.log("✅ Modelo de Embeddings carregado na memória.");
    } catch (e) {
        console.error("❌ Erro fatal ao carregar modelo Xenova:", e);
        return;
    }

    // --- DEBUG: Vamos ver se a base de conhecimento existe ---
    console.log(`🧐 Verificando base de conhecimento: ${knowledgeBase.length} itens.`);
    if (knowledgeBase.length === 0) {
        console.error("❌ ERRO: A base de conhecimento está vazia! O RAG não vai funcionar.");
        return;
    }

    // --- FORÇA O PROCESSAMENTO (Ignorando cache por enquanto para testar) ---
    console.log(`📊 Iniciando vetorização de ${knowledgeBase.length} blocos...`);
    vectorStore = []; // Reseta o store

    for (let i = 0; i < knowledgeBase.length; i++) {
        const item = knowledgeBase[i];
        try {
            const output = await embedder(item.text, { pooling: 'mean', normalize: true });
            vectorStore.push({ 
                id: i, 
                text: item.text, 
                source: item.source, 
                vector: output.data 
            });
            process.stdout.write(`.`); // Pontinho de progresso
        } catch (e) {
            console.error(`\n❌ Erro ao processar bloco ${i}:`, e);
        }
    }
    
    console.log(`\n✅ Vetorização concluída! Temos ${vectorStore.length} vetores prontos.`);

    // Salva o cache
    try {
        fs.writeFileSync(VECTOR_CACHE_PATH, JSON.stringify(vectorStore));
        console.log("💾 Cache salvo no disco.");
    } catch (e) {
        console.error("Erro ao salvar cache (não crítico):", e);
    }

    console.log("🚀 IA RAG Pronta para perguntas!\n");
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

    // --- TRAVA DE SEGURANÇA ---
    if (!vectorStore || vectorStore.length === 0) {
        console.error("❌ ERRO CRÍTICO: O VectorStore está vazio (0 itens).");
        console.error("   Motivo provável: A função initAI falhou ou não terminou.");
        return res.status(500).end("Erro interno: A IA está sem memória.");
    }

    try {
        // ... (parte do RAG/Embeddings continua igual) ...
        const output = await embedder(message, { pooling: 'mean', normalize: true });
        const queryVector = output.data;
        const results = vectorStore.map(item => ({ item, score: cosineSimilarity(queryVector, item.vector) }));
        const topResults = results.sort((a, b) => b.score - a.score).slice(0, 4); // Contexto reduzido
        const contextText = topResults.map(r => r.item.text).join("\n\n---\n\n");

        // --- ADICIONE ESTE LOG ---
        console.log("--------------------------------------------------");
        console.log("🔍 O QUE A IA RECEBEU DE CONTEXTO:");
        console.log(contextText);
        console.log("--------------------------------------------------");

        const prompt = `
            <role>
            Você é o assistente virtual oficial do INOVFABLAB da Universidade Santa Cecília.
            Sua função é responder dúvidas dos alunos com precisão, baseando-se EXCLUSIVAMENTE nos documentos fornecidos.
            </role>

            <constraints>
            1. USE APENAS O CONTEXTO: Nunca invente informações, não use seu conhecimento externo e não invente categorias que não existem no texto.
            2. SEJA COMPLETO: Se perguntarem "quais equipamentos", liste TODOS os equipamentos encontrados no contexto. Não resuma.
            3. SEM CONVERSA FIADA: Não comece com "Claro, posso ajudar", "Aqui está", ou "É importante notar". Vá direto ao ponto.
            4. FIDELIDADE: Use os nomes exatos dos equipamentos conforme aparecem no contexto.
            5. FORMATAÇÃO:
            - Use uma lista com marcadores (•) para equipamentos.
            - Não use numeração (1., 2.) a menos que seja um passo-a-passo.
            - Se a lista for longa, não a divida em categorias a menos que o texto original o faça.
            </constraints>

            <context>
            ${contextText}
            </context>

            <user_question>
            ${message}
            </user_question>

            <response_guideline>
            Responda em Português do Brasil.
            Se a pergunta for sobre equipamentos, comece a lista imediatamente ou com uma frase curta como "Os equipamentos disponíveis são:".
            </response_guideline>
        `;

        const response = await fetch('http://127.0.0.1:11434/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: "llama3.2", prompt: prompt, stream: true })
        });

        // Prepara headers para stream
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        // LÊ O FLUXO E REPASSA
        for await (const chunk of response.body) {
            const lines = chunk.toString().split('\n');
            for (const line of lines) {
                if (!line) continue;
                try {
                    const json = JSON.parse(line);
                    
                    // Se tiver pedaço de texto, envia
                    if (json.response) {
                        res.write(json.response);
                    }
                    
                    // Se o Ollama disser que acabou, ENCERRA a conexão
                    if (json.done) {
                        res.end(); // <--- O PULO DO GATO PARA NÃO TRAVAR
                        return; // Sai da função
                    }
                } catch (e) {
                    // Ignora erros de JSON quebrado
                }
            }
        }
        res.end(); // Garante fechamento se sair do loop

    } catch (error) {
        console.error(error);
        res.status(500).end("Erro na IA.");
    }
});

app.listen(PORT, () => console.log(`🔥 Servidor: http://localhost:${PORT}`));