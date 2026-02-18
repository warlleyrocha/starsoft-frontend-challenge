import type { NftListQuery } from "../types/nft-query.types";

export const nftKeys = {
  // Prefixo raiz para todas as entradas de cache relacionadas a NFTs.
  all: ["nfts"] as const,
  // Chave da listagem infinita; paginação fica em pageParam interno do React Query.
  infiniteList: ({ rows, sortBy, orderBy }: Omit<NftListQuery, "page">) =>
    [...nftKeys.all, "infinite-list", rows, sortBy, orderBy] as const,
  // Chave dedicada para detalhe por id, independente da listagem paginada.
  detail: (id: string) => [...nftKeys.all, "detail", id] as const,
};
