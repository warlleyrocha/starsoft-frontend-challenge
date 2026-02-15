# Starsoft Frontend Challenge

Implementação da interface de um Marketplace de NFTs utilizando **Next.js**, seguindo o design fornecido no Figma e os requisitos do desafio técnico.

---

## 🚀 Tecnologias Utilizadas

- Next.js (Pages Router)
- TypeScript
- SASS (SCSS Modules)
- Redux Toolkit (estrutura preparada)
- React Query (dependência instalada, integração com API pendente)
- Framer Motion (animação do carrinho)
- ESLint + Prettier
- Docker + Docker Compose

---

## 📦 Status Atual do Projeto

O projeto atualmente inclui:

- Lista de NFTs e componente de Card (utilizando mock de dados)
- Grid responsivo (desktop, tablet e mobile)
- Drawer de carrinho com animação lateral
- Tokens globais de design (cores, espaçamentos e tipografia)
- Componente Button reutilizável
- Configuração completa de ambiente com Docker

> A integração com a API oficial e o gerenciamento global de estado do carrinho com Redux serão implementados na próxima etapa.

---

## 🖥 Como Rodar Localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Iniciar servidor de desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em:

```
http://localhost:3000
```

---

## 🐳 Como Rodar com Docker

### 1. Buildar e iniciar o container

```bash
docker-compose up --build
```

A aplicação estará disponível em:

```
http://localhost:3000
```

Para encerrar:

```bash
docker-compose down
```

---

## 🧹 Lint e Formatação

Executar ESLint:

```bash
npm run lint
```

Executar Prettier:

```bash
npm run format
```

---

## 📁 Estrutura do Projeto (Arquitetura Feature-Based)

```
src/
 ├─ features/
 │   ├─ nfts/
 │   └─ cart/
 ├─ shared/
 │   └─ components/
 ├─ styles/
 └─ pages/
```

Essa abordagem facilita escalabilidade, organização por domínio e manutenção do projeto.

---

## 🎨 Fidelidade ao Design

A interface foi implementada buscando máxima fidelidade ao Figma:

- Espaçamentos alinhados
- Breakpoints responsivos definidos manualmente
- Tokens de design centralizados
- Componentização reutilizável

---

## 🧠 Decisões Arquiteturais

- Utilização de **SASS Modules** para escopo isolado de estilos
- Arquitetura orientada a features
- Framer Motion para animações suaves do drawer
- Configuração Docker para ambiente reprodutível

---

## 📌 Próximos Passos

- Integração com a API oficial do desafio
- Implementação do estado global do carrinho com Redux
- Testes unitários e de integração (Jest + React Testing Library)
- Estratégia de SSR/SSG para otimização de performance

---

## 📄 Convenção de Commits

Este projeto segue o padrão Conventional Commits:

```
feat(scope): descrição
refactor(scope): descrição
style(scope): descrição
chore(scope): descrição
```

---

## 👨‍💻 Autor

Warlley Rocha
