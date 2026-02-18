// Centraliza o contrato de query da listagem de NFTs (paginação e ordenação).
// `GetNftsParams` é a versão parcial para a camada de API, permitindo defaults internos (ex.: page=1, rows=8, sortBy=name, orderBy=ASC) sem duplicar tipos.

export type NftListQuery = {
  page: number;
  rows: number;
  sortBy: string;
  orderBy: "ASC" | "DESC";
};

export type GetNftsParams = Partial<NftListQuery>;
