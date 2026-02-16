import { apiRequest } from "@/shared/lib/http/apiClient";
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
  rows = 8,
  sortBy = "name",
  orderBy = "ASC",
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
