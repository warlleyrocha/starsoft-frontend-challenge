import type { NftListQuery } from "../types/nft-query.types";

export const nftKeys = {
  all: ["nfts"] as const,
  list: ({ page, rows, sortBy, orderBy }: NftListQuery) =>
    [...nftKeys.all, "list", page, rows, sortBy, orderBy] as const,
  detail: (id: string) => [...nftKeys.all, "detail", id] as const,
};
