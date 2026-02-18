import type { NftListQuery } from "../types/nft-query.types";

export const nftKeys = {
  // Prefixo raiz para todas as entradas de cache relacionadas a NFTs.
  all: ["nfts"] as const,
  // Inclui todos os parâmetros que alteram a listagem para manter cache segmentado por consulta.
  list: ({ page, rows, sortBy, orderBy }: NftListQuery) =>
    [...nftKeys.all, "list", page, rows, sortBy, orderBy] as const,
  // Chave dedicada para detalhe por id, independente da listagem paginada.
  detail: (id: string) => [...nftKeys.all, "detail", id] as const,
};
