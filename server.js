const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORTA = 3001;

// Configurações básicas
app.use(cors()); // Permite que o React (que vai rodar em outra porta) acesse esta API
app.use(express.json());

// Conecta ao banco de dados no modo Somente Leitura
const db = new sqlite3.Database('./urna.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error("Erro ao conectar ao banco urna.db:", err.message);
    } else {
        console.log("Conectado ao banco de dados urna.db com sucesso.");
    }
});

// A Rota Principal da Urna
// Exemplo de uso: http://localhost:3001/api/candidato/SP/Governador/12
app.get('/api/candidato/:estado/:cargo/:numero', (req, res) => {
    const { estado, cargo, numero } = req.params;

    // Converte o estado e o cargo para maiúsculo automaticamente
    const estadoFormatado = estado.toUpperCase(); 
    const cargoFormatado = cargo.toUpperCase();
    
    const query = `
        SELECT nome_urna, partido 
        FROM candidatos 
        WHERE estado = ? AND cargo = ? AND numero = ?
    `;

    // Note que agora passamos o cargoFormatado na busca
    db.get(query, [estadoFormatado, cargoFormatado, numero], (err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ erro: 'Erro interno no banco de dados.' });
        }

        if (row) {
            // Candidato encontrado
            return res.json({
                encontrado: true,
                nome: row.nome_urna,
                partido: row.partido
            });
        } else {
            // Candidato não existe - Voto Nulo
            return res.json({
                encontrado: false,
                mensagem: 'VOTO NULO'
            });
        }
    });
});

// Inicia o servidor
app.listen(PORTA, () => {
    console.log(`\n--- Servidor da Urna Eletrônica ---`);
    console.log(`API rodando na porta ${PORTA}`);
    console.log(`Para testar, abra no seu navegador: http://localhost:${PORTA}/api/candidato/BR/Presidente/13`);
});