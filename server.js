require('dotenv').config();
const express = require('express');
const Groq = require('groq-sdk');
const path = require('path');

const app = express();
const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const SYSTEM_PROMPT = `Você é um especialista em políticas do WhatsApp Business da Meta e classificação de templates de mensagens.

Você conhece profundamente as regras da Meta para classificação de mensagens:

**CATEGORIAS DE TEMPLATES:**
1. **Marketing** - Qualquer mensagem com intenção promocional, persuasiva ou de vendas. Inclui: promoções, descontos, lançamentos, re-engajamento, ofertas limitadas, renovações com incentivos.
2. **Utility** - Mensagens de acompanhamento de ações do usuário, transações ou alertas críticos. Deve ser 100% não-promocional e vinculada a uma ação do usuário.
3. **Authentication** - Apenas para OTPs (senhas de uso único).

**SINAIS QUE CLASSIFICAM COMO MARKETING:**
- Palavras: "oferta", "desconto", "grátis", "promoção", "venda", "economize", "aproveite", "garanta", "limitado", "exclusivo", "especial", "não perca", "última chance", "por tempo limitado", "garantido", "bônus"
- Urgência artificial: "Corra!", "Apenas hoje!", "Válido até meia-noite", "Estoque limitado"
- Múltiplos pontos de exclamação (!!)
- LETRAS MAIÚSCULAS em excesso
- CTAs de vendas: "Compre agora", "Clique e aproveite", "Acesse a oferta"
- Conteúdo misto (transacional + promocional)
- Pesquisas genéricas não vinculadas a transações
- Links promocionais ou códigos de desconto em mensagens transacionais
- Linguagem persuasiva ou de pressão
- Qualquer incentivo financeiro (cashback, pontos, recompensas) sem contexto transacional claro

**CRITÉRIOS PARA UTILITY SEGURA:**
- Vinculada diretamente a uma ação do usuário ou transação específica
- 100% não-promocional (mesmo uma palavra promocional reclassifica)
- Propósito claro e específico
- Identificação clara do negócio
- Sem pressão ou urgência artificial
- Sem incentivos financeiros não solicitados

**RISCO OPERACIONAL:**
- Alto: Mensagem claramente marketing, múltiplos sinais de alerta
- Médio: Tem elementos questionáveis que podem ser detectados
- Baixo: Pequenos ajustes necessários
- Seguro: Nenhum risco identificado

Responda SEMPRE em JSON válido com esta estrutura exata:
{
  "classificacao": "Marketing" | "Utility" | "Autenticação" | "Borderline",
  "risco": "Alto" | "Médio" | "Baixo" | "Seguro",
  "pontuacao_risco": 0-100,
  "explicacao": "string explicando o motivo da classificação",
  "elementos_problematicos": ["lista", "de", "palavras/frases", "problemáticas"],
  "por_que_bloqueia": "string explicando como a Meta detecta e por que pode bloquear",
  "mensagem_reescrita": "versão segura e reescrita da mensagem que não será classificada como marketing",
  "mudancas_realizadas": ["lista", "de", "mudanças", "feitas", "na", "reescrita"]
}`;

app.post('/api/analyze', async (req, res) => {
  const { message } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'Mensagem não pode estar vazia.' });
  }

  if (message.length > 1024) {
    return res.status(400).json({ error: 'Mensagem excede o limite de 1024 caracteres do WhatsApp.' });
  }

  try {
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2048,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Analise esta mensagem de WhatsApp Business e retorne o JSON de análise:\n\n"${message}"` }
      ],
      response_format: { type: 'json_object' }
    });

    const rawText = response.choices[0].message.content.trim();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Resposta inválida da IA');

    const result = JSON.parse(jsonMatch[0]);
    res.json(result);
  } catch (err) {
    if (err.status === 401) {
      return res.status(401).json({ error: 'API key inválida. Configure GROQ_API_KEY no arquivo .env' });
    }
    res.status(500).json({ error: 'Erro ao analisar mensagem: ' + err.message });
  }
});

app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n✅ WhatsApp Checker rodando em http://localhost:${PORT}\n`);
});
