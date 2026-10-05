# 🗳️ Urna Eletrônica

Simulador de urna eletrônica com servidor Node.js e banco de dados SQLite, que utiliza uma base de candidatos brasileiros importada a partir de arquivos CSV.

> ⚠️ Projeto de caráter educacional/simulação. Não possui qualquer relação com a urna eletrônica oficial da Justiça Eleitoral.

## 📁 Estrutura do projeto

```
Urna_Eletronica/
├── csvs/                    # Instruções sobre o banco de dados
├── urna-eletronica/         # Interface da aplicação (front-end)
├── candidatos_brasil.csv    # Base de candidatos
├── importar_dados.js        # Script de importação dos dados (Node.js)
├── importar_dados.py        # Script de importação dos dados (Python)
├── server.js                # Servidor da aplicação
├── urna.db                  # Banco de dados SQLite
├── package.json
└── package-lock.json
```

## ✨ Funcionalidades

- Importação de candidatos a partir de arquivos CSV para o banco de dados
- Servidor que disponibiliza os dados da urna
- Simulação do processo de votação

## 🛠️ Tecnologias

- Node.js
- SQLite
- Python (script de importação)
- CSV como fonte de dados

## ✅ Pré-requisitos

- [Node.js](https://nodejs.org/) (versão LTS recomendada)
- [Python 3](https://www.python.org/) (apenas se for usar `importar_dados.py`)

## 🚀 Como executar

1. Clone o repositório:

   ```bash
   git clone https://github.com/bastosfernando79/Urna_Eletronica.git
   cd Urna_Eletronica
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. (Opcional) Importe ou atualize os dados dos candidatos no banco `urna.db`:

   ```bash
   node importar_dados.js
   # ou
   python importar_dados.py
   ```

4. Inicie o projeto em modo de desenvolvimento:

   ```bash
   npm run dev
   ```

   Para iniciar o servidor:

   ```bash
   node server.js
   ```

5. Acesse a aplicação no navegador pelo endereço exibido no terminal (por exemplo, `http://localhost:3000`).

## 🗃️ Dados

Os candidatos estão em `candidatos_brasil.csv` e na pasta `csvs/`. Os scripts de importação leem esses arquivos e gravam as informações no banco `urna.db`.

## 🤝 Contribuindo

Sugestões e melhorias são bem-vindas. Abra uma *issue* ou envie um *pull request*.

## 👤 Autor

[bastosfernando79](https://github.com/bastosfernando79)

## 📄 Licença

Defina aqui a licença do projeto (por exemplo, MIT).