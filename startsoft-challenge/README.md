# Starsoft Frontend Challenge

Aplicação de marketplace de NFTs construída com Next.js, com listagem, detalhe de item, carrinho de compras e animações.

## 1. Como configurar e executar

### Pré-requisitos

- Node.js 20+
- npm 10+
- Docker e Docker Compose (opcional, para execução containerizada)

### Execução local

1. Instale dependências:

```bash
npm install
```

2. Configure variáveis de ambiente:

```bash
cp .env.example .env.local
```

3. Execute em desenvolvimento:

```bash
npm run dev
```

4. Acesse:

```text
http://localhost:3000
```

### Execução com Docker

```bash
docker-compose up --build
```

Aplicação disponível em `http://localhost:3000`.

Para encerrar:

```bash
docker-compose down
```

### Qualidade e testes

```bash
npm run lint
npm test
```

## 2. Funcionalidades implementadas

- Listagem de NFTs com paginação incremental em botão "Carregar mais"
- Busca de dados com TanStack React Query (`useInfiniteQuery`)
- Lógica da Home extraída para custom hook (`useHomeNftsPage`) para separar regra de negócio da renderização
- SSR da primeira carga da Home via `getServerSideProps`
- Página de detalhe com rota dinâmica (`/nfts/[id]`) e SSR
- Fallback de detalhe por varredura paginada quando o backend não possui endpoint dedicado por ID
- Tratamento robusto no detalhe: retorna notFound quando o item não existe e, em indisponibilidade da API, mantém a rota navegável com mensagem amigável e fallback por cache quando disponível.
- Deduplicação de itens entre páginas na listagem incremental para evitar repetição de NFTs
- Carrinho global com Redux Toolkit (adicionar, remover, aumentar/diminuir quantidade e calcular total de itens/ETH)
- Persistência de carrinho em `localStorage` com hidratação no cliente
- Tratamento de estados de UI (carregamento, erro e lista vazia)
- Animações com Framer Motion (transição entre páginas, drawer do carrinho e interação no card)
- Otimizações de Next.js (`next/image`, importação dinâmica do overlay de checkout e metadados com `next/head`)
- React Query Devtools habilitado apenas em ambiente de desenvolvimento
- Testes unitários/integrados com Jest + React Testing Library para fluxos críticos

## 3. Tecnologias e justificativas técnicas

| Tecnologia                   | Justificativa                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------------- |
| Next.js (Pages Router)       | Framework principal do desafio, com SSR, roteamento dinâmico e otimizações nativas. |
| React + TypeScript           | Tipagem estática para reduzir regressões e facilitar manutenção/refactor.           |
| TanStack React Query         | Cache e sincronização de dados remotos com suporte robusto a paginação infinita.    |
| Redux Toolkit + React Redux  | Estado global previsível para o carrinho, com reducers e seletores simples.         |
| Sass (SCSS Modules)          | Estilização modular com escopo local por componente.                                |
| Framer Motion                | Animações declarativas e transições suaves de interface.                            |
| Jest + React Testing Library | Testes de comportamento de componentes, hooks e regras críticas de negócio.         |
| ESLint + Prettier            | Consistência de estilo e qualidade estática de código.                              |
| Docker + Docker Compose      | Ambiente reproduzível com comando único de inicialização.                           |

## 4. Decisão técnica relevante (React Query x SSR no detalhe)

- A listagem da Home usa React Query (`useInfiniteQuery`) porque é o fluxo com maior benefício de cache, sincronização e paginação incremental no cliente.
- O detalhe (`/nfts/[id]`) foi implementado com `getServerSideProps` para garantir renderização inicial pronta e manter comportamento consistente mesmo sem endpoint dedicado de detalhe no backend.
- Como a API atual não possui `GET /products/:id`, a resolução do item é feita por fallback paginado no servidor. Isso evita duplicar a mesma varredura no cliente e mantém a tela funcional.
- Essa combinação atende ao desafio ao utilizar React Query para busca/sincronização da listagem e Data Fetching nativo do Next.js para SSR do detalhe.

## 5. Estrutura principal

```text
src/
  features/
    cart/
      components/OverlayCheckout/
      store/
    nfts/
      api/
      components/
      config/
      hooks/
        useHomeNftsPage.ts
        useNftsInfiniteQuery.ts
      types/
  pages/
    _app.tsx
    _document.tsx
    index.tsx
    nfts/[id].tsx
  shared/
    components/
    lib/
    store/
  styles/
```

## 6. Scripts

- `npm run dev`: modo desenvolvimento
- `npm run build`: build de produção
- `npm run start`: execução da build de produção
- `npm run lint`: validação estática
- `npm run format`: formatação com Prettier
- `npm run test`: suíte de testes

## 7. Limitações atuais

- A API não disponibiliza endpoint dedicado de detalhe (`GET /products/:id`).
- Por isso, o detalhe faz fallback percorrendo páginas da listagem até encontrar o item.
- O tempo de resposta do detalhe pode crescer conforme o volume total de produtos.
- Há warnings de teste relacionados a mocks de componentes dinâmicos (`next/dynamic`) e `next/image`, sem falha na suíte.

## 8. Melhorias futuras

- Adotar endpoint de detalhe dedicado quando disponível no backend.
- Aumentar cobertura de acessibilidade (axe, keyboard flow, landmarks e ARIA).
- Expandir testes E2E (ex.: Playwright) para fluxos completos de navegação e carrinho.
- Publicar pipeline de CI com lint, test e build em pull requests.

## 9. Variáveis de ambiente

Arquivo `.env.example`:

```env
NODE_ENV=development
NEXT_PUBLIC_API_BASE_URL=https://api-challenge.starsoft.games/api/v1
```

## 10. Padrões e Convenções

- Arquitetura por features/domínio (`features/cart`, `features/nfts`)
- Alias de import `@/*` apontando para `src/*`
- Conventional Commits: `type(scope): descrição`

## Autor

Warlley Rocha
