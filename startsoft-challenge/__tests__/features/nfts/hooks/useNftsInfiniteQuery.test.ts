import { useInfiniteQuery } from "@tanstack/react-query";
import { getNfts, type GetNftsResult } from "@/features/nfts/api/nftApi";
import { nftKeys } from "@/features/nfts/api/nftKeys";
import { useNftsInfiniteQuery } from "@/features/nfts/hooks/useNftsInfiniteQuery";

jest.mock("@tanstack/react-query", () => ({
  useInfiniteQuery: jest.fn(),
}));

jest.mock("@/features/nfts/api/nftApi", () => ({
  getNfts: jest.fn(),
}));

const mockUseInfiniteQuery = useInfiniteQuery as jest.Mock;
const mockGetNfts = getNfts as jest.MockedFunction<typeof getNfts>;

const queryParams = {
  rows: 8,
  sortBy: "name" as const,
  orderBy: "ASC" as const,
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
  count: 17,
};

describe("useNftsInfiniteQuery", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseInfiniteQuery.mockReturnValue({ data: undefined });
  });

  it("configures useInfiniteQuery with stable key and mapped initialData", () => {
    useNftsInfiniteQuery(queryParams, { initialData });

    expect(mockUseInfiniteQuery).toHaveBeenCalledTimes(1);
    const options = mockUseInfiniteQuery.mock.calls[0][0] as {
      queryKey: unknown;
      initialPageParam: number;
      getNextPageParam: (lastPage: GetNftsResult, allPages: GetNftsResult[]) => number | undefined;
      initialData?: {
        pages: GetNftsResult[];
        pageParams: number[];
      };
    };

    expect(options.queryKey).toEqual(nftKeys.infiniteList(queryParams));
    expect(options.initialPageParam).toBe(1);
    expect(options.initialData).toEqual({
      pages: [initialData],
      pageParams: [1],
    });
    expect(options.getNextPageParam(initialData, [initialData])).toBe(2);
    expect(options.getNextPageParam(initialData, [initialData, initialData, initialData])).toBe(
      undefined,
    );
  });

  it("uses queryFn that calls getNfts with pageParam merged into params", async () => {
    mockGetNfts.mockResolvedValue(initialData);

    useNftsInfiniteQuery(queryParams);

    const options = mockUseInfiniteQuery.mock.calls[0][0] as {
      queryFn: ({ pageParam }: { pageParam: number }) => Promise<GetNftsResult>;
    };
    const result = await options.queryFn({ pageParam: 3 });

    expect(mockGetNfts).toHaveBeenCalledWith({
      page: 3,
      ...queryParams,
    });
    expect(result).toEqual(initialData);
  });
});
