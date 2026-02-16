import { useQuery } from "@tanstack/react-query";
import { getNfts } from "../api/nftApi";
import { nftKeys } from "../api/nftKeys";
import type { NftListQuery } from "../types/nft-query.types";
import type { GetNftsResult } from "../api/nftApi";

type UseNftsQueryOptions = {
  initialData?: GetNftsResult;
};

export function useNftsQuery(params: NftListQuery, options: UseNftsQueryOptions = {}) {
  const { page, rows, sortBy, orderBy } = params;

  return useQuery({
    queryKey: nftKeys.list({ page, rows, sortBy, orderBy }),
    queryFn: () => getNfts({ page, rows, sortBy, orderBy }),
    initialData: options.initialData,
  });
}
