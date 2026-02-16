import { useQuery } from "@tanstack/react-query";
import { getNfts } from "../api/nftApi";
import { nftKeys } from "../api/nftKeys";
import type { NftListQuery } from "../types/nft-query.types";

export function useNftsQuery(params: NftListQuery) {
  const { page, rows, sortBy, orderBy } = params;

  return useQuery({
    queryKey: nftKeys.list({ page, rows, sortBy, orderBy }),
    queryFn: () => getNfts({ page, rows, sortBy, orderBy }),
  });
}
