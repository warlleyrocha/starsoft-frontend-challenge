import { apiRequest } from "@/shared/lib/http/apiClient";
import { NFT_QUERY_DEFAULTS } from "../config/queryDefaults";
import type { Nft } from "../types/nft.types";
import type { GetNftsParams } from "../types/nft-query.types";

// Types

type RawNft = {
  id: number;
  name: string;
  description: string;
  image: string;
  price: string;
  createdAt: string;
};

type RawNftResponse = {
  products: RawNft[];
  count: number;
};

export type GetNftsResult = {
  items: Nft[];
  count: number;
};

// Converte o modelo de transporte da API para o modelo de domínio/UI.
function mapNft(raw: RawNft): Nft {
  const price = Number(raw.price);
  if (Number.isNaN(price)) {
    throw new TypeError(`Invalid product price for id ${raw.id}`);
  }

  return {
    id: String(raw.id),
    name: raw.name,
    description: raw.description,
    price,
    image: raw.image,
  };
}

function normalizeNftList(payload: RawNftResponse): Nft[] {
  return payload.products.map(mapNft);
}

// O endpoint exige parâmetros de paginação/ordenação e retorna lista + total.
export async function getNfts({
  page = 1,
  rows = NFT_QUERY_DEFAULTS.rowsPerPage,
  sortBy = NFT_QUERY_DEFAULTS.sortBy,
  orderBy = NFT_QUERY_DEFAULTS.orderBy,
}: GetNftsParams = {}): Promise<GetNftsResult> {
  const query = new URLSearchParams({
    page: String(page),
    rows: String(rows),
    sortBy,
    orderBy,
  });

  const response = await apiRequest<RawNftResponse>({
    path: `/products?${query.toString()}`,
    method: "GET",
  });

  const items = normalizeNftList(response);
  return {
    items,
    count: response.count,
  };
}

// Fallback para detalhe quando a API não expõe GET /products/:id.
// Percorre páginas da coleção até encontrar o item pelo id.
export async function getNftById(id: string): Promise<Nft | null> {
  const targetId = id.trim();
  if (!targetId) return null;

  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const result = await getNfts({
      page,
      rows: NFT_QUERY_DEFAULTS.rowsPerPage,
      sortBy: NFT_QUERY_DEFAULTS.sortBy,
      orderBy: NFT_QUERY_DEFAULTS.orderBy,
    });

    const found = result.items.find((item) => item.id === targetId);
    if (found) return found;

    totalPages = Math.max(1, Math.ceil(result.count / NFT_QUERY_DEFAULTS.rowsPerPage));
    page += 1;
  }

  return null;
}
