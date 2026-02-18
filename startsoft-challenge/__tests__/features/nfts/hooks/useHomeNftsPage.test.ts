import { act, renderHook } from "@testing-library/react";
import type { GetNftsResult } from "@/features/nfts/api/nftApi";
import { useHomeNftsPage } from "@/features/nfts/hooks/useHomeNftsPage";
import { useNftsInfiniteQuery } from "@/features/nfts/hooks/useNftsInfiniteQuery";
import type { Nft } from "@/features/nfts/types/nft.types";

jest.mock("@/features/nfts/hooks/useNftsInfiniteQuery", () => ({
  useNftsInfiniteQuery: jest.fn(),
}));

const mockUseNftsInfiniteQuery = useNftsInfiniteQuery as jest.MockedFunction<
  typeof useNftsInfiniteQuery
>;

function createNft(overrides: Partial<Nft> = {}): Nft {
  return {
    id: "1",
    name: "NFT One",
    description: "NFT description",
    price: 1.2,
    image: "https://images.example.com/nft.png",
    ...overrides,
  };
}

function createInfiniteQueryResult(
  pages: GetNftsResult[] | undefined,
  overrides: Partial<{
    isLoading: boolean;
    isFetchingNextPage: boolean;
    isError: boolean;
    error: unknown;
    hasNextPage: boolean;
    fetchNextPage: jest.Mock;
  }> = {},
) {
  return {
    data: pages
      ? {
          pages,
          pageParams: pages.map((_, index) => index + 1),
        }
      : undefined,
    isLoading: false,
    isFetchingNextPage: false,
    isError: false,
    error: null,
    hasNextPage: true,
    fetchNextPage: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as ReturnType<typeof useNftsInfiniteQuery>;
}

describe("useHomeNftsPage (P0)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNftsInfiniteQuery.mockReturnValue(
      createInfiniteQueryResult(undefined, { hasNextPage: false }),
    );
  });

  it("shows initial loading when there are no visible items", () => {
    mockUseNftsInfiniteQuery.mockReturnValue(
      createInfiniteQueryResult(undefined, { isLoading: true, hasNextPage: false }),
    );

    const { result } = renderHook(() => useHomeNftsPage(null));

    expect(result.current.isInitialLoading).toBe(true);
    expect(result.current.isEmptySuccess).toBe(false);
    expect(result.current.visibleItems).toEqual([]);
  });

  it("requests the next page when load more is clicked and pagination can continue", () => {
    const fetchNextPage = jest.fn().mockResolvedValue(undefined);
    const firstPage: GetNftsResult = {
      items: [createNft({ id: "1", name: "NFT One" })],
      count: 2,
    };

    mockUseNftsInfiniteQuery.mockReturnValue(
      createInfiniteQueryResult([firstPage], { hasNextPage: true, fetchNextPage }),
    );

    const { result } = renderHook(() => useHomeNftsPage(firstPage));

    expect(result.current.loadMoreLabel).toBe("Carregar mais");

    act(() => {
      result.current.handleLoadMore();
    });

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it("does not request next page when all NFTs are already visible", () => {
    const fetchNextPage = jest.fn().mockResolvedValue(undefined);
    const fullPage: GetNftsResult = {
      items: [createNft({ id: "1", name: "NFT One" })],
      count: 1,
    };

    mockUseNftsInfiniteQuery.mockReturnValue(
      createInfiniteQueryResult([fullPage], { hasNextPage: false, fetchNextPage }),
    );

    const { result } = renderHook(() => useHomeNftsPage(fullPage));

    expect(result.current.loadMoreLabel).toBe("Você já visualizou tudo");

    act(() => {
      result.current.handleLoadMore();
    });

    expect(fetchNextPage).not.toHaveBeenCalled();
  });

  it("merges duplicated items across pages and computes progress", () => {
    const firstPage: GetNftsResult = {
      items: [createNft({ id: "1", name: "NFT One" })],
      count: 2,
    };
    const secondPage: GetNftsResult = {
      items: [
        createNft({ id: "1", name: "NFT One duplicated" }),
        createNft({ id: "2", name: "NFT Two" }),
      ],
      count: 2,
    };

    mockUseNftsInfiniteQuery.mockReturnValue(
      createInfiniteQueryResult([firstPage, secondPage], { hasNextPage: false }),
    );

    const { result } = renderHook(() => useHomeNftsPage(firstPage));

    expect(result.current.visibleItems).toHaveLength(2);
    expect(result.current.visibleItems.map((item) => item.id)).toEqual(["1", "2"]);
    expect(result.current.progress).toBe(100);
  });
});
