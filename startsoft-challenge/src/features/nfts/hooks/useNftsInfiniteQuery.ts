import { useInfiniteQuery } from "@tanstack/react-query";
import { getNfts, type GetNftsResult } from "../api/nftApi";
import { nftKeys } from "../api/nftKeys";
import type { NftListQuery } from "../types/nft-query.types";

type NftsInfiniteQueryParams = Omit<NftListQuery, "page">;

type UseNftsInfiniteQueryOptions = {
  initialData?: GetNftsResult;
};

export function useNftsInfiniteQuery(
  params: NftsInfiniteQueryParams,
  options: UseNftsInfiniteQueryOptions = {},
) {
  const { rows, sortBy, orderBy } = params;

  return useInfiniteQuery({
    queryKey: nftKeys.infiniteList({ rows, sortBy, orderBy }),
    queryFn: ({ pageParam }) => getNfts({ page: pageParam, rows, sortBy, orderBy }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalPages = Math.max(1, Math.ceil(lastPage.count / rows));
      const nextPage = allPages.length + 1;

      return nextPage <= totalPages ? nextPage : undefined;
    },
    initialData: options.initialData
      ? {
          pages: [options.initialData],
          pageParams: [1],
        }
      : undefined,
  });
}
