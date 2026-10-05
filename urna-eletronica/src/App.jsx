import { useState, useEffect } from 'react'
import './App.css'

const ETAPAS = [
  { titulo: 'DEPUTADO FEDERAL', cargoDB: 'DEPUTADO FEDERAL', digitos: 4, abrangencia: 'ESTADUAL' },
  { titulo: 'DEPUTADO ESTADUAL', cargoDB: 'DEPUTADO ESTADUAL', digitos: 5, abrangencia: 'ESTADUAL' },
  { titulo: '1º SENADOR', cargoDB: 'SENADOR', digitos: 3, abrangencia: 'ESTADUAL' },
  { titulo: '2º SENADOR', cargoDB: 'SENADOR', digitos: 3, abrangencia: 'ESTADUAL' },
  { titulo: 'GOVERNADOR', cargoDB: 'GOVERNADOR', digitos: 2, abrangencia: 'ESTADUAL' },
  { titulo: 'PRESIDENTE', cargoDB: 'PRESIDENTE', digitos: 2, abrangencia: 'FEDERAL' }
]

const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
]

function App() {
  const [urnaLiberada, setUrnaLiberada] = useState(false)
  const [estadoSelecionado, setEstadoSelecionado] = useState('SP')

  const [etapaAtual, setEtapaAtual] = useState(0)
  const [numeroDigitado, setNumeroDigitado] = useState('')
  const [candidato, setCandidato] = useState(null)
  const [telaFim, setTelaFim] = useState(false)
  const [votos, setVotos] = useState([])
  
  // Novo estado para o Voto em Branco
  const [votoBranco, setVotoBranco] = useState(false)

  const cargoAtual = ETAPAS[etapaAtual]

  // --- EFEITOS SONOROS ---
  const tocarSomTecla = () => {
    // O .catch() evita erros caso o navegador bloqueie o áudio antes da interação do utilizador
    new Audio('/tecla.mp3').play().catch(() => {});
  }

  const tocarSomFim = () => {
    new Audio('/confirma.mp3').play().catch(() => {});
  }

  useEffect(() => {
    if (urnaLiberada && !telaFim && !votoBranco && numeroDigitado.length === cargoAtual.digitos) {
      buscarCandidato()
    } else {
      setCandidato(null)
    }
  }, [numeroDigitado, votoBranco, urnaLiberada, telaFim])

  const buscarCandidato = async () => {
    try {
      const estadoDaBusca = cargoAtual.abrangencia === 'FEDERAL' ? 'BR' : estadoSelecionado;
      const url = `http://localhost:3001/api/candidato/${estadoDaBusca}/${cargoAtual.cargoDB}/${numeroDigitado}`
      const resposta = await fetch(url)
      const dados = await resposta.json()
      setCandidato(dados)
    } catch (erro) {
      console.error("Erro ao contactar a API:", erro)
    }
  }

  const clicarNumero = (n) => {
    if (telaFim) return;
    tocarSomTecla();
    
    // Se estiver a votar em branco, o utilizador precisa de corrigir primeiro para voltar a digitar
    if (votoBranco) return; 

    if (numeroDigitado.length < cargoAtual.digitos) {
      setNumeroDigitado(numeroDigitado + n)
    }
  }

  // Lógica do botão BRANCO
  const clicarBranco = () => {
    if (telaFim) return;
    tocarSomTecla();

    // Regra do TSE: Só permite votar em branco se não houver números digitados
    if (numeroDigitado.length === 0) {
      setVotoBranco(true);
      setCandidato(null);
    } else {
      alert("Para votar em BRANCO, pressione primeiro a tecla CORRIGE para apagar os números.");
    }
  }

  const corrigir = () => {
    if (telaFim) return;
    tocarSomTecla();
    setNumeroDigitado('')
    setCandidato(null)
    setVotoBranco(false)
  }

  const confirmar = () => {
    if (telaFim) return;

    // Permite confirmar se for Branco OU se todos os dígitos estiverem preenchidos
    if (votoBranco || numeroDigitado.length === cargoAtual.digitos) {
      
      if (!votoBranco && cargoAtual.titulo === '2º SENADOR') {
        const votoPrimeiroSenador = votos.find(v => v.cargo === '1º SENADOR');
        if (votoPrimeiroSenador && votoPrimeiroSenador.numero === numeroDigitado) {
          alert("Atenção: Você não pode votar no mesmo candidato para o 1º e 2º Senador.");
          corrigir();
          return;
        }
      }

      const novoVoto = {
        cargo: cargoAtual.titulo,
        numero: votoBranco ? 'BRANCO' : numeroDigitado,
        nome_candidato: votoBranco ? 'BRANCO' : (candidato?.nome || 'NULO'),
        estado: estadoSelecionado
      }
      
      setVotos([...votos, novoVoto])
      console.log("Votos confirmados até o momento:", [...votos, novoVoto])

      if (etapaAtual + 1 < ETAPAS.length) {
        tocarSomTecla(); // Som curto a cada mudança de cargo
        setEtapaAtual(etapaAtual + 1)
        setNumeroDigitado('')
        setCandidato(null)
        setVotoBranco(false)
      } else {
        tocarSomFim(); // O longo "Pililim" ao finalizar a eleição
        setTelaFim(true)
      }
    }
  }

  const renderizarCaixas = () => {
    let caixas = []
    for (let i = 0; i < cargoAtual.digitos; i++) {
      caixas.push(
        <div key={i} className={`numero-caixa ${numeroDigitado.length === i ? 'pisca' : ''}`}>
          {numeroDigitado[i] || ''}
        </div>
      )
    }
    return caixas
  }

  if (!urnaLiberada) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#2b2b2b' }}>
        <div style={{ background: '#e8e8e8', padding: '40px', borderRadius: '5px', textAlign: 'center', border: '2px solid #000' }}>
          <h2 style={{ marginTop: 0 }}>Terminal do Mesário</h2>
          <p>Configure a UF de operação desta urna:</p>
          <select 
            value={estadoSelecionado} 
            onChange={(e) => setEstadoSelecionado(e.target.value)}
            style={{ fontSize: '20px', padding: '10px', width: '100%', marginBottom: '20px' }}
          >
            {ESTADOS_BRASIL.map(uf => <option key={uf} value={uf}>{uf}</option>)}
          </select>
          <button 
            onClick={() => setUrnaLiberada(true)}
            style={{ backgroundColor: '#4caf50', color: '#000', border: '2px solid #000', padding: '15px 30px', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}
          >
            LIBERAR URNA PARA VOTAÇÃO
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="urna">
      <div className="tela">
        {telaFim ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', width: '100%' }}>
            <h1 style={{ fontSize: '100px', margin: 0, color: '#000' }}>FIM</h1>
          </div>
        ) : (
          <>
            <div className="tela-topo">
              <div>
                <h3>SEU VOTO PARA</h3>
                <h2>{cargoAtual.titulo}</h2>
              </div>
            </div>

            {/* Alterna entre mostrar o Voto em Branco ou as caixas de números */}
            {votoBranco ? (
              <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h2 style={{ fontSize: '40px', animation: 'piscar 1s infinite', margin: 0 }}>VOTO EM BRANCO</h2>
              </div>
            ) : (
              <>
                <div className="tela-numeros">
                  {renderizarCaixas()}
                </div>

                <div className="tela-informacoes">
                  {candidato && candidato.encontrado && (
                    <>
                      <div className="info-texto">
                        <p><strong>Nome:</strong> {candidato.nome}</p>
                        <p><strong>Partido:</strong> {candidato.partido}</p>
                      </div>
                      
                      {/* Busca a imagem usando o número digitado. 
                          O onError coloca uma imagem em branco caso você não tenha baixado a foto daquele número */}
                      <img 
                        src={`/fotos/${numeroDigitado}.jpg`} 
                        alt="Foto do Candidato" 
                        className="foto-candidato"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/110x150?text=SEM+FOTO' }}
                      />
                    </>
                  )}
                  {candidato && !candidato.encontrado && (
                    <div className="voto-nulo">
                      <h2>VOTO NULO</h2>
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="tela-rodape">
              <hr />
              <p>Aperte a tecla:<br/>VERDE para CONFIRMAR<br/>LARANJA para CORRIGIR</p>
            </div>
          </>
        )}
      </div>

      <div className="teclado-container">
        <div className="teclado-numerico">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button key={n} className="tecla" onClick={() => clicarNumero(n.toString())}>
              {n}
            </button>
          ))}
          <div></div>
          <button className="tecla" onClick={() => clicarNumero('0')}>0</button>
          <div></div>
        </div>

        <div className="teclado-acoes">
          <button className="btn-acao btn-branco" onClick={clicarBranco}>Branco</button>
          <button className="btn-acao btn-corrige" onClick={corrigir}>Corrige</button>
          <button className="btn-acao btn-confirma" onClick={confirmar}>Confirma</button>
        </div>
      </div>
    </div>
  )
}

export default App