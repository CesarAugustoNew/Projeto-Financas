# Finanças — Controle de Finanças

Aplicação React para controle financeiro pessoal, com painel geral, salário/renda, economias e dívidas.

## Estrutura de pastas

```
controle-financas/
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── src/
    ├── main.jsx                 # ponto de entrada
    ├── App.jsx                  # rotas da aplicação
    ├── index.css                # estilos globais + tokens
    ├── context/
    │   └── FinanceContext.jsx   # estado global (salário, economias, dívidas) + totais
    ├── hooks/
    │   └── useLocalStorage.js   # persistência no navegador
    ├── utils/
    │   └── format.js            # formatação de moeda e datas
    ├── components/
    │   ├── layout/               # Sidebar e Layout
    │   ├── common/                # Card, StatCard, Modal, EmptyState
    │   └── charts/                 # gráficos (Recharts)
    └── pages/
        ├── Dashboard/           # painel geral com métricas e gráficos
        ├── Salario/             # cadastro de rendas
        ├── Economias/           # metas de economia com progresso
        └── Dividas/             # dívidas com controle de pagamento
```

## Como rodar

```bash
npm install
npm run dev
```

Acesse http://localhost:5173

## Como funciona

- Os dados (salários, economias e dívidas) ficam salvos no `localStorage` do navegador — não há backend.
- O Painel calcula automaticamente: renda total, total economizado, dívidas restantes e saldo livre (renda − dívidas − economias).
- Cada página (Salário, Economias, Dívidas) tem seu próprio formulário de cadastro em modal.
- As metas de economia e as dívidas mostram barras de progresso.

## Tecnologias

- React 18 + Vite
- React Router
- Tailwind CSS (tokens de cor/tipografia personalizados)
- Recharts (gráficos)

## Próximos passos sugeridos

- Autenticação e sincronização em nuvem (ex: Supabase/Firebase)
- Histórico mensal e comparação entre meses
- Exportação de relatórios em PDF
