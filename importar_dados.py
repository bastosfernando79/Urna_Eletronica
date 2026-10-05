import csv
import sqlite3

# Nomes dos arquivos
nome_arquivo_csv = 'candidatos_brasil.csv'
nome_banco_dados = 'urna.db'

# Conecta ao banco de dados SQLite
conexao = sqlite3.connect(nome_banco_dados)
cursor = conexao.cursor()

# Cria a tabela no banco de dados sem a coluna município
cursor.execute('''
CREATE TABLE IF NOT EXISTS candidatos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    numero TEXT,
    nome_urna TEXT,
    cargo TEXT,
    estado TEXT,
    partido TEXT,
    UNIQUE(numero, cargo, estado) -- Evita duplicidade do mesmo candidato no mesmo cargo e estado
)
''')

linhas_inseridas = 0

print(f"Lendo o arquivo {nome_arquivo_csv}...")

# Abre o arquivo CSV
with open(nome_arquivo_csv, mode='r', encoding='latin1') as arquivo:
    leitor_csv = csv.DictReader(arquivo, delimiter=';', quotechar='"')
    
    # Limpa os cabeçalhos
    if leitor_csv.fieldnames:
        leitor_csv.fieldnames = [cabecalho.strip().replace('"', '') for cabecalho in leitor_csv.fieldnames]

    # Percorre cada linha do arquivo
    for linha in leitor_csv:
        numero = linha.get('NR_CANDIDATO')
        nome_urna = linha.get('NM_URNA_CANDIDATO')
        cargo = linha.get('DS_CARGO')
        estado = linha.get('SG_UF')
        partido = linha.get('SG_PARTIDO')

        # Só insere se tiver o número e o nome da urna válidos
        if numero and nome_urna and numero != '-1' and numero != '#NULO':
            try:
                # Insere no banco de dados
                cursor.execute('''
                INSERT OR IGNORE INTO candidatos (numero, nome_urna, cargo, estado, partido)
                VALUES (?, ?, ?, ?, ?)
                ''', (numero, nome_urna, cargo, estado, partido))
                
                # Conta apenas se a linha foi realmente inserida (ignorando duplicadas)
                if cursor.rowcount > 0:
                    linhas_inseridas += 1
            except sqlite3.Error as e:
                print(f"Erro ao inserir candidato {numero}: {e}")

# Salva e fecha o banco
conexao.commit()
conexao.close()

print("\n--- SUCESSO! ---")
print(f"Total de {linhas_inseridas} candidatos inseridos no banco '{nome_banco_dados}'.")