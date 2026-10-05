const fs = require('fs');
const csv = require('csv-parser');
const sqlite3 = require('sqlite3').verbose();

// Conecta ao banco de dados
const db = new sqlite3.Database('./urna.db');

// ATENÇÃO: Coloque aqui o nome exato do seu arquivo CSV
const arquivoCSV = './candidatos_brasil.csv'; 

db.serialize(() => {
    // Cria a tabela
    db.run(`CREATE TABLE IF NOT EXISTS candidatos (
        numero TEXT PRIMARY KEY,
        nome TEXT
    )`);

    console.log(`Lendo o arquivo: ${arquivoCSV}... isso pode levar um tempinho, aguarde.`);
    let contadorDeLinhas = 0;

    // Se os acentos ficarem zoados (caracteres estranhos), descomente a linha do .setEncoding('latin1')
    fs.createReadStream(arquivoCSV)
        // .setEncoding('latin1') 
        .pipe(csv({ 
            separator: ';',
            // Essa linha abaixo é a mágica que remove aspas e espaços invisíveis dos cabeçalhos do TSE
            mapHeaders: ({ header }) => header.replace(/"/g, '').trim()
        })) 
        .on('data', (linha) => {
            const numero = linha['NR_CANDIDATO'];
            const nome = linha['NM_CANDIDATO'];

            if (numero && nome) {
                // Insere no banco
                db.run(`INSERT OR IGNORE INTO candidatos (numero, nome) VALUES (?, ?)`, [numero, nome]);
                contadorDeLinhas++;
            }
        })
        .on('end', () => {
            console.log(`\n--- SUCESSO! ---`);
            console.log(`Fim da leitura! Foram inseridos ${contadorDeLinhas} candidatos no banco urna.db.`);
            console.log(`Abra o urna.db no SQLite Viewer para conferir.`);
        });
});