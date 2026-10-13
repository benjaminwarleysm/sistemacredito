import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
} from 'react-native';

// INICIO LOGICA

// Formata valor em reais (ex: 5000 -> R$ 5.000,00)
function formatarMoeda(valor) {
  const partes = valor.toFixed(2).split('.');
  const inteiro = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return 'R$ ' + inteiro + ',' + partes[1];
}

// Formata percentual (ex: 12.5 -> 12,5%)
function formatarPercentual(valor) {
  return String(valor).replace('.', ',') + '%';
}

// Valida os campos
function validarDados(idadeTexto, rendaTexto, temCLT, temDividas) {
  const idadeLimpa = idadeTexto.trim();
  const rendaLimpa = rendaTexto.trim().replace(',', '.');

  if (idadeLimpa === '') {
    return 'Informe a idade do correntista.';
  }
  if (!/^\d+$/.test(idadeLimpa) || Number(idadeLimpa) <= 0) {
    return 'A idade deve ser um número inteiro maior que zero.';
  }
  if (rendaLimpa === '') {
    return 'Informe a renda anual do correntista.';
  }
  if (isNaN(Number(rendaLimpa)) || Number(rendaLimpa) <= 0) {
    return 'A renda anual deve ser um número maior que zero.';
  }
  if (temCLT === null) {
    return 'Selecione se o correntista possui vínculo CLT.';
  }
  if (temDividas === null) {
    return 'Selecione se o correntista possui dívidas.';
  }
  return '';
}

// Define o percentual pela idade
function definirPercentualPorIdade(idade) {
  if (idade <= 24) {
    return 25;
  } else if (idade <= 49) {
    return 40;
  } else if (idade <= 64) {
    return 30;
  } else {
    return 15;
  }
}

// Analisa o crédito e devolve o resultado
function calcularCredito(idade, renda, temCLT, temDividas) {
  // Regra 1: dívidas
  if (temDividas) {
    return {
      aprovado: false,
      motivo: 'O cliente possui dívidas.',
      valorCredito: 0,
    };
  }

  // Regra 2: percentual inicial
  const percentualInicial = definirPercentualPorIdade(idade);

  // Regra 3: vínculo CLT
  let percentualFinal = percentualInicial;
  if (!temCLT) {
    percentualFinal = percentualInicial / 2;
  }

  // Regra 4: valor máximo
  const valorCredito = (renda * percentualFinal) / 100;

  return {
    aprovado: true,
    percentualInicial: percentualInicial,
    percentualFinal: percentualFinal,
    valorCredito: valorCredito,
  };
}

// FIM LOGICA

export default function App() {
  // Estados dos campos
  const [idade, setIdade] = useState('');
  const [rendaAnual, setRendaAnual] = useState('');
  const [temCLT, setTemCLT] = useState(null);
  const [temDividas, setTemDividas] = useState(null);

  // Estados do resultado
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');

  // Analisa o crédito
  function analisarCredito() {
    const mensagemErro = validarDados(idade, rendaAnual, temCLT, temDividas);

    if (mensagemErro !== '') {
      setErro(mensagemErro);
      setResultado(null);
      return;
    }

    const idadeNumero = Number(idade.trim());
    const rendaNumero = Number(rendaAnual.trim().replace(',', '.'));

    const analise = calcularCredito(idadeNumero, rendaNumero, temCLT, temDividas);

    setErro('');
    setResultado({
      ...analise,
      idade: idadeNumero,
      renda: rendaNumero,
      temCLT: temCLT,
      temDividas: temDividas,
    });
  }

  // Limpa o formulário
  function limparCampos() {
    setIdade('');
    setRendaAnual('');
    setTemCLT(null);
    setTemDividas(null);
    setResultado(null);
    setErro('');
  }

  // Botão Sim/Não
  function renderOpcao(texto, valor, valorAtual, aoSelecionar) {
    const selecionado = valorAtual === valor;
    return (
      <TouchableOpacity
        style={[styles.opcao, selecionado && styles.opcaoSelecionada]}
        onPress={() => aoSelecionar(valor)}
        activeOpacity={0.8}
      >
        <Text style={[styles.opcaoTexto, selecionado && styles.opcaoTextoSelecionado]}>
          {texto}
        </Text>
      </TouchableOpacity>
    );
  }

  // Área do resultado
  function renderResultado() {
    if (resultado === null) {
      return (
        <View style={styles.cardInfo}>
          <Text style={styles.infoTexto}>
            Preencha os dados do correntista e toque em ANALISAR CRÉDITO.
          </Text>
        </View>
      );
    }

    if (resultado.aprovado) {
      return (
        <View style={[styles.cardResultado, styles.cardAprovado]}>
          <Text style={[styles.status, styles.textoAprovado]}>CRÉDITO APROVADO</Text>

          <Text style={styles.linhaResultado}>Idade: {resultado.idade} anos</Text>
          <Text style={styles.linhaResultado}>
            Renda anual: {formatarMoeda(resultado.renda)}
          </Text>
          <Text style={styles.linhaResultado}>
            Vínculo CLT: {resultado.temCLT ? 'Sim' : 'Não'}
          </Text>
          <Text style={styles.linhaResultado}>
            Dívidas: {resultado.temDividas ? 'Sim' : 'Não'}
          </Text>
          <Text style={styles.linhaResultado}>
            Percentual aplicado: {formatarPercentual(resultado.percentualFinal)}
          </Text>

          <Text style={styles.rotuloValor}>Valor máximo do crédito</Text>
          <Text style={[styles.valorDestaque, styles.textoAprovado]}>
            {formatarMoeda(resultado.valorCredito)}
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.cardResultado, styles.cardReprovado]}>
        <Text style={[styles.status, styles.textoReprovado]}>CRÉDITO NÃO APROVADO</Text>
        <Text style={styles.linhaResultado}>Motivo: {resultado.motivo}</Text>

        <Text style={styles.rotuloValor}>Valor do crédito</Text>
        <Text style={[styles.valorDestaque, styles.textoReprovado]}>
          {formatarMoeda(resultado.valorCredito)}
        </Text>
      </View>
    );
  }

  // Parte visual
  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0B2F5B" />

      <ScrollView
        contentContainerStyle={styles.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        {/* Cabeçalho */}
        <View style={styles.cabecalho}>
          <Text style={styles.icone}>🏦</Text>
          <Text style={styles.titulo}>Análise de Crédito</Text>
          <Text style={styles.subtitulo}>Simulador de crédito para correntistas</Text>
        </View>

        {/* Formulário */}
        <View style={styles.card}>
          <Text style={styles.rotulo}>Idade</Text>
          <TextInput
            style={styles.campo}
            value={idade}
            onChangeText={setIdade}
            placeholder="Ex: 35"
            placeholderTextColor="#8A94A6"
            keyboardType="numeric"
            maxLength={3}
          />

          <Text style={styles.rotulo}>Renda anual (R$)</Text>
          <TextInput
            style={styles.campo}
            value={rendaAnual}
            onChangeText={setRendaAnual}
            placeholder="Ex: 80000"
            placeholderTextColor="#8A94A6"
            keyboardType="numeric"
          />

          <Text style={styles.rotulo}>Possui vínculo CLT?</Text>
          <View style={styles.linhaOpcoes}>
            {renderOpcao('Sim', true, temCLT, setTemCLT)}
            {renderOpcao('Não', false, temCLT, setTemCLT)}
          </View>

          <Text style={styles.rotulo}>Possui dívidas?</Text>
          <View style={styles.linhaOpcoes}>
            {renderOpcao('Sim', true, temDividas, setTemDividas)}
            {renderOpcao('Não', false, temDividas, setTemDividas)}
          </View>

          {erro !== '' && (
            <View style={styles.caixaErro}>
              <Text style={styles.textoErro}>{erro}</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.botaoAnalisar}
            onPress={analisarCredito}
            activeOpacity={0.8}
          >
            <Text style={styles.botaoAnalisarTexto}>ANALISAR CRÉDITO</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoLimpar}
            onPress={limparCampos}
            activeOpacity={0.8}
          >
            <Text style={styles.botaoLimparTexto}>LIMPAR CAMPOS</Text>
          </TouchableOpacity>
        </View>

        {/* Resultado */}
        {renderResultado()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: '#EEF3F9',
  },
  conteudo: {
    paddingBottom: 40,
  },
  cabecalho: {
    backgroundColor: '#0B2F5B',
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  icone: {
    fontSize: 40,
    marginBottom: 6,
  },
  titulo: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
  },
  subtitulo: {
    color: '#BBD3F0',
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 18,
    borderRadius: 16,
    elevation: 3,
  },
  rotulo: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0B2F5B',
    marginBottom: 6,
    marginTop: 14,
  },
  campo: {
    borderWidth: 1,
    borderColor: '#C5D2E3',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 50,
    fontSize: 16,
    color: '#1B1B1B',
    backgroundColor: '#F7FAFD',
  },
  linhaOpcoes: {
    flexDirection: 'row',
  },
  opcao: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#0066B3',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },
  opcaoSelecionada: {
    backgroundColor: '#0066B3',
  },
  opcaoTexto: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066B3',
  },
  opcaoTextoSelecionado: {
    color: '#FFFFFF',
  },
  caixaErro: {
    backgroundColor: '#FDECEC',
    borderLeftWidth: 4,
    borderLeftColor: '#C62828',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  textoErro: {
    color: '#C62828',
    fontSize: 14,
    fontWeight: '600',
  },
  botaoAnalisar: {
    backgroundColor: '#0066B3',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  botaoAnalisarTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  botaoLimpar: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0B2F5B',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  botaoLimparTexto: {
    color: '#0B2F5B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cardInfo: {
    backgroundColor: '#DCE8F7',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 18,
    borderRadius: 16,
  },
  infoTexto: {
    color: '#0B2F5B',
    fontSize: 15,
    textAlign: 'center',
  },
  cardResultado: {
    marginHorizontal: 16,
    marginTop: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  cardAprovado: {
    borderColor: '#2E7D32',
  },
  cardReprovado: {
    borderColor: '#C62828',
  },
  status: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 14,
  },
  textoAprovado: {
    color: '#2E7D32',
  },
  textoReprovado: {
    color: '#C62828',
  },
  linhaResultado: {
    fontSize: 15,
    color: '#333333',
    marginBottom: 6,
  },
  rotuloValor: {
    fontSize: 14,
    color: '#555555',
    textAlign: 'center',
    marginTop: 14,
  },
  valorDestaque: {
    fontSize: 34,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 4,
  },
});