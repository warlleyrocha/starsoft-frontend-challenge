import { useQuery } from "@tanstack/react-query";
import { getNfts, type GetNftsResult } from "@/features/nfts/api/nftApi";
import { nftKeys } from "@/features/nfts/api/nftKeys";
import { useNftsQuery } from "@/features/nfts/hooks/useNftsQuery";
import type { NftListQuery } from "@/features/nfts/types/nft-query.types";

jest.mock("@tanstack/react-query", () => ({
  useQuery: jest.fn(),
}));

jest.mock("@/features/nfts/api/nftApi", () => ({
  getNfts: jest.fn(),
}));

const mockUseQuery = useQuery as jest.Mock;
const mockGetNfts = getNfts as jest.MockedFunction<typeof getNfts>;

const queryParams: NftListQuery = {
  page: 2,
  rows: 8,
  sortBy: "name",
  orderBy: "ASC",
};

const initialData: GetNftsResult = {
  items: [
    {
      id: "1",
      name: "NFT One",
      description: "NFT description",
      price: 1.2,
      image: "https://images.example.com/nft.png",
    },
  ],
  count: 1,
};

describe("useNftsQuery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQuery.mockReturnValue({ data: undefined });
  });

  it("configures useQuery with stable key and provided initialData", () => {
    useNftsQuery(queryParams, { initialData });

    expect(mockUseQuery).toHaveBeenCalledTimes(1);
    const options = mockUseQuery.mock.calls[0][0] as {
      queryKey: unknown;
      queryFn: () => Promise<unknown>;
      initialData?: GetNftsResult;
    };

    expect(options.queryKey).toEqual(nftKeys.list(queryParams));
    expect(options.initialData).toEqual(initialData);
    expect(typeof options.queryFn).toBe("function");
  });

  it("uses queryFn that calls getNfts with current params", async () => {
    mockGetNfts.mockResolvedValue(initialData);

    useNftsQuery(queryParams, { initialData });

    const options = mockUseQuery.mock.calls[0][0] as {
      queryFn: () => Promise<GetNftsResult>;
    };
    const result = await options.queryFn();

    expect(mockGetNfts).toHaveBeenCalledWith(queryParams);
    expect(result).toEqual(initialData);
  });
});
