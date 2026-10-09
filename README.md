# Finanças — Controle Financeiro

Aplicação Front-end desenvolvida em React para controle financeiro pessoal, que mostra para onde o dinheiro está indo e como o saldo deve ficar nos próximos meses.

A aplicação reúne renda, gastos, metas de economia e dívidas, calcula automaticamente o que já entrou, o que ainda vai entrar e o que sobra no mês, e apresenta uma **análise técnica do saldo** (gráfico de candles com média móvel, bandas e linha de tendência) baseada nos gastos previstos.



<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=flat-square&logo=react&logoColor=white" alt="React + Vite">
  <img src="https://img.shields.io/badge/Estilo-Tailwind%20CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Rotas-React%20Router-CA4245?style=flat-square&logo=reactrouter&logoColor=white" alt="React Router">
  <img src="https://img.shields.io/badge/Gr%C3%A1ficos-Recharts%20%2B%20SVG-22A06B?style=flat-square" alt="Recharts e SVG">
  <img src="https://img.shields.io/badge/Persist%C3%AAncia-localStorage-F7DF1E?style=flat-square&logo=javascript&logoColor=black" alt="localStorage">
</p>

[**🔗 Acessar a aplicação**](https://projeto-financas-alpha.vercel.app/)    


## Demonstração

### Painel
<img width="1916" height="871" alt="painel1" src="https://github.com/user-attachments/assets/9938bd38-dcac-4b79-953c-239930d4a1c1" />

<img width="1920" height="684" alt="painel2" src="https://github.com/user-attachments/assets/eaa801e9-7926-4dc8-bdf9-a55beb7363e6" />

<img width="1917" height="597" alt="painel3" src="https://github.com/user-attachments/assets/f0638a76-0f5b-4a24-9b6e-14a262540879" />

### Análise técnica do saldo
<img width="1920" height="578" alt="analisetecnica" src="https://github.com/user-attachments/assets/46ec4891-c5be-424e-b417-b71515e27ca1" />

### Salário e outras rendas
<img width="1917" height="953" alt="entrada" src="https://github.com/user-attachments/assets/f9130ac1-0048-46bb-9005-9e3ac6187297" />

### Gastos
<img width="1914" height="951" alt="gastos" src="https://github.com/user-attachments/assets/f05ae3b4-d60d-4559-a08b-77b55a201c7b" />

### Metas de economia
<img width="1919" height="948" alt="economia" src="https://github.com/user-attachments/assets/f14dbfe8-d40a-439e-aa5d-669f9418de61" />

---

## 🚀 Funcionalidades

### 📊 Painel

Visão geral do mês selecionado (com navegação entre meses), contendo:

- Saldo em conta e **projeção para o fim do mês**
- Renda livre prevista e gastos do mês
- Cards de **Já caiu**, **Ainda vai cair** e **Saldo livre**
- **Maiores gastos no mês**, com ícone por categoria e uma setinha para ver o que foi gasto em cada uma
- Calendário de renda do mês, com status de cada entrada (Recebido / A receber)
- Gráfico **Entrada x Saída x Investido**
- Distribuição da renda livre (parcelas, gastos e saldo livre)
- Dívidas em aberto e progresso das metas de economia

### 💵 Salário e outras rendas

Permite cadastrar cada renda uma única vez, informando o dia em que ela cai:

- Tipos: salário fixo, freelance, rendimento, vale alimentação / refeição e outros
- O sistema calcula sozinho, com base na data de hoje, o que já entrou e o que ainda vai entrar, em qualquer mês
- **Vale alimentação / refeição** fica fora da renda livre, pois só paga mercado e restaurante

### 🛒 Gastos

Módulo para registrar e acompanhar os gastos, incluindo:

- Saldo em conta informado pela pessoa
- Categorias com ícones e cores próprias (Alimentação, Moradia, Educação, Assinaturas, entre outras)
- Três formas de lançar: **Uma vez**, **Parcelado** (em quantas vezes) e **Fixo todo mês**
- Gastos fixos entram automaticamente todos os meses, e cada mês pode ser marcado como **Não saiu**
- Opção de **Encerrar** um gasto fixo a partir de determinado mês
- Gastos com data futura aparecem como **agendados**
- Aviso de possível **gasto contado duas vezes** quando o valor é igual ao de uma parcela de dívida, com opção de contar apenas em Dívidas
- Gráfico por categoria e navegação por mês

### 🏦 Metas de economia

Permite criar metas e acompanhar o quanto já foi guardado:

- Valor atual e valor da meta
- Barra de progresso e percentual concluído
- Adição de valores à meta
- Total guardado e soma das metas

### 📈 Análise técnica do saldo

Gráfico no estilo de análise técnica, com a evolução do saldo e a previsão dos próximos meses:

- **Candles** com abertura, máxima, mínima e fechamento do saldo, por **Mês** ou por **Ano**
- Média móvel, bandas e **linha de tendência** (regressão linear sobre os fechamentos)
- Candles previstos destacados em uma faixa de **Previsão**
- Previsão baseada em renda livre, parcelas das dívidas e gastos fixos, parcelados e agendados
- Opção de incluir a **média dos gastos variáveis**
- Resumo da tendência e a conta do próximo mês, com os valores detalhados
- As escolhas do gráfico (Mês/Ano e indicadores) ficam salvas no navegador

### 💳 Dívidas

Página de dívidas parceladas, disponível em `/dividas` (fora do menu lateral):

- Valor da parcela, quantidade de parcelas, dia de vencimento e mês da primeira parcela
- O app calcula sozinho em qual parcela você está em cada mês
- As parcelas entram nas contas do mês e na previsão do gráfico

---

## 🧮 Regras de cálculo

| Indicador | Como é calculado |
| --- | --- |
| Renda livre | Renda prevista do mês − vale alimentação / refeição |
| Saldo livre | Renda livre − parcelas do mês − gastos do mês |
| Projeção do fim do mês | Saldo em conta + ainda vai cair (renda livre) − parcelas pendentes − gastos agendados |
| Saída (gráfico) | Gastos do mês + parcelas do mês |
| Investido (gráfico) | Total já guardado nas metas de economia |

Observações:

- Gastos com data até hoje são considerados já descontados do saldo em conta informado.
- Gastos marcados como "Está em Dívidas" e meses marcados como "Não saiu" não entram nas somas.
- O gráfico de análise técnica parte do saldo de hoje e começa no mês atual, sem reconstruir meses anteriores.

---

## 🏗️ Arquitetura

O projeto é uma aplicação Front-end, sem Back-end. O estado fica em um contexto React e é salvo no navegador.

```text
                    ┌───────────────────┐
                    │      Usuário      │
                    └─────────┬─────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │   React + Vite    │
                    │  Páginas + Rotas  │
                    └─────────┬─────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
          ┌─────────────────┐   ┌───────────────────┐
          │ FinanceContext  │   │  utils (cálculos) │
          │ estado global   │   │ renda, gastos,    │
          │                 │   │ dívidas, análise  │
          └────────┬────────┘   └───────────────────┘
                   │
                   ▼
          ┌─────────────────┐
          │  localStorage   │
          │   do navegador  │
          └─────────────────┘
```

### Estrutura de pastas

```text
controle-financas/
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
├── docs/
│   └── screenshots/         # imagens usadas neste README
└── src/
    ├── main.jsx
    ├── App.jsx              # rotas
    ├── index.css            # estilos globais e tokens
    ├── context/
    │   └── FinanceContext.jsx   # estado global e totais do mês
    ├── hooks/
    │   └── useLocalStorage.js   # persistência no navegador
    ├── utils/
    │   ├── renda.js         # renda recorrente, recebido x a receber
    │   ├── gastos.js        # gastos fixos, parcelados e agendados
    │   ├── dividas.js       # parcelas e saldo devedor
    │   ├── resumoMes.js     # regras do mês (saldo livre e projeção)
    │   ├── analise.js       # candles, indicadores e previsão
    │   └── format.js        # moeda e datas
    ├── components/
    │   ├── layout/          # Sidebar e Layout
    │   ├── common/          # Card, StatCard, Modal, ícones de categoria
    │   └── charts/          # Recharts e gráfico de candles em SVG
    └── pages/
        ├── Dashboard/
        ├── Salario/
        ├── Gastos/
        ├── Economias/
        └── Dividas/
```

---

## ▶️ Como rodar

```bash
npm install
npm run dev
```

Acesse http://localhost:5173

## 🛠️ Tecnologias

- React 18 + Vite
- React Router
- Tailwind CSS (tokens de cor e tipografia personalizados)
- Recharts (barras e rosca)
- SVG próprio para o gráfico de candles
- localStorage para persistência dos dados


- Os dados ficam salvos **apenas no navegador** em que foram cadastrados. Trocar de navegador, de endereço (por exemplo, outra porta do `localhost`) ou limpar os dados do site apaga o que foi lançado.
- A previsão do gráfico é uma estimativa feita a partir do que está cadastrado, e não uma garantia de resultado.
