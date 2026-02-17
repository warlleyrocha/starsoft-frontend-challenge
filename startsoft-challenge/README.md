# Starsoft Frontend Challenge

Marketplace de NFTs construído com Next.js (Pages Router), com listagem paginada, página de detalhes, carrinho global com Redux Toolkit e busca de dados da API oficial com React Query.

## Tecnologias

- Next.js 16 (Pages Router)
- React 19 + TypeScript
- Sass (SCSS Modules)
- Redux Toolkit + React Redux
- TanStack React Query
- Framer Motion
- ESLint + Prettier
- Docker + Docker Compose

## Funcionalidades Atuais

- Listagem de NFTs com paginação e botão "Carregar mais"
- Pré-carregamento SSR da primeira página da listagem (`getServerSideProps`)
- Cache e sincronização de dados com React Query
- Página de detalhe por NFT (`/nfts/[id]`) com SSR
- Carrinho global com Redux Toolkit (adicionar, remover, aumentar/diminuir quantidade, total de itens e total em ETH por seletores)
- Persistência do carrinho no `localStorage`
- Drawer de checkout animado com Framer Motion
- Estados de UI para loading, erro e lista vazia

## Integração com API

Base URL via variável de ambiente:

```env
NEXT_PUBLIC_API_BASE_URL=https://api-challenge.starsoft.games/api/v1
```

Endpoint utilizado para listagem:

- `GET /products?page={page}&rows={rows}&sortBy={sortBy}&orderBy={orderBy}`

Mapeamento de dados:

- `price` é convertido para `number`
- payload da API é normalizado para o tipo de domínio `Nft`

Regra de detalhe:

- como não há endpoint dedicado `/products/:id`, o app faz fallback iterando páginas da coleção até encontrar o `id`

## Regras de Estado e Dados

React Query:

- `staleTime`: 30s
- `gcTime`: 5min
- retry de query: até 2 tentativas (sem retry para erros HTTP 4xx)
- `refetchOnWindowFocus`: `false`

Redux Cart:

- estado em `src/features/cart/store/cartSlice.ts`
- hidratação inicial via `hydrateCart(loadCartItems())`
- persistência automática a cada mudança de `cart.items`
- sanitização defensiva dos itens vindos do storage

## Estrutura do Projeto

```text
src/
  features/
    cart/
      components/OverlayCheckout/
      store/
        cartSelectors.ts
        cartSlice.ts
        cartStorage.ts
    nfts/
      api/
        nftApi.ts
        nftKeys.ts
      components/
        Card/
        List/
        LoadMore/
      config/
        queryDefaults.ts
      hooks/
        useNftsQuery.ts
      types/
  pages/
    _app.tsx
    _document.tsx
    index.tsx
    nfts/[id].tsx
  shared/
    components/
      Button/
      EmptyState/
      Footer/
      Header/
    lib/
      http/apiClient.ts
      react-query/queryClient.ts
    store/
      hooks.ts
      index.ts
  styles/
    _tokens.scss
    globals.scss
```

## Como Rodar

### Local

1. Instale as dependências:

```bash
npm install
```

2. Crie seu `.env.local`:

```bash
cp .env.example .env.local
```

3. Rode o projeto:

```bash
npm run dev
```

4. Acesse:

```text
http://localhost:3000
```

### Docker

```bash
docker-compose up --build
```

Para parar:

```bash
docker-compose down
```

## Scripts

- `npm run dev`: desenvolvimento
- `npm run build`: build de produção
- `npm run start`: sobe build de produção
- `npm run lint`: validação com ESLint
- `npm run format`: formatação com Prettier

## Padrões e Convenções

- Arquitetura por features/domínio (`features/cart`, `features/nfts`)
- Alias de import `@/*` apontando para `src/*`
- Estilo com SCSS Modules + tokens globais em `src/styles/_tokens.scss`
- `reactStrictMode: true` no Next.js
- `next/image` liberado para hosts remotos HTTPS via `remotePatterns`
- Conventional Commits: `type(scope): descrição`

## Pontos de Atenção

- Ainda não há suíte de testes.
- O fallback de detalhe por varredura de páginas funciona, mas pode aumentar latência conforme o volume de itens na API.

## Autor

Warlley Rocha
