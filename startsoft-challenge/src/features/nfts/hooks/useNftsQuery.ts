import { useQuery } from "@tanstack/react-query";
import { getNfts } from "../api/nftApi";
import { nftKeys } from "../api/nftKeys";
import type { NftListQuery } from "../types/nft-query.types";
import type { GetNftsResult } from "../api/nftApi";

type UseNftsQueryOptions = {
  initialData?: GetNftsResult;
};

export function useNftsQuery(params: NftListQuery, options: UseNftsQueryOptions = {}) {
  // Explicita os parâmetros para compor queryKey determinística e evitar variações de referência.
  const { page, rows, sortBy, orderBy } = params;

  return useQuery({
    // Segmenta cache por combinação de paginação e ordenação.
    queryKey: nftKeys.list({ page, rows, sortBy, orderBy }),
    // Mantém queryFn alinhada ao mesmo conjunto de parâmetros da queryKey.
    queryFn: () => getNfts({ page, rows, sortBy, orderBy }),
    // Permite hidratação inicial (SSR) sem disparar loading vazio na primeira pintura.
    initialData: options.initialData,
  });
}
