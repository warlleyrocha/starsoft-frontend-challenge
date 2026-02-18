import { NFT_QUERY_DEFAULTS } from "@/features/nfts/config/queryDefaults";
import { getNftById, getNfts } from "@/features/nfts/api/nftApi";
import { apiRequest } from "@/shared/lib/http/apiClient";

jest.mock("@/shared/lib/http/apiClient", () => ({
  apiRequest: jest.fn(),
}));

const mockApiRequest = apiRequest as jest.MockedFunction<typeof apiRequest>;

type RawNft = {
  id: number;
  name: string;
  description: string;
  image: string;
  price: string;
  createdAt: string;
};

function createRawNft(overrides: Partial<RawNft> = {}): RawNft {
  return {
    id: 1,
    name: "NFT One",
    description: "NFT description",
    image: "https://images.example.com/nft.png",
    price: "1.25",
    createdAt: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

function createRawResponse(products: RawNft[], count = products.length) {
  return {
    products,
    count,
  };
}

function getQueryParamFromLastCall(param: string): string | null {
  const call = mockApiRequest.mock.calls.at(-1);
  const options = call?.[0] as { path?: string } | undefined;
  const search = options?.path?.split("?")[1] ?? "";
  return new URLSearchParams(search).get(param);
}

describe("nftApi", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getNfts", () => {
    it("uses default query params and maps API payload to domain model", async () => {
      mockApiRequest.mockResolvedValue(
        createRawResponse([createRawNft({ id: 10, name: "Default NFT", price: "2.5" })], 33),
      );

      const result = await getNfts();

      expect(result).toEqual({
        items: [
          {
            id: "10",
            name: "Default NFT",
            description: "NFT description",
            image: "https://images.example.com/nft.png",
            price: 2.5,
          },
        ],
        count: 33,
      });
      expect(mockApiRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          method: "GET",
          path: expect.stringContaining("/products?"),
        }),
      );
      expect(getQueryParamFromLastCall("page")).toBe("1");
      expect(getQueryParamFromLastCall("rows")).toBe(String(NFT_QUERY_DEFAULTS.rowsPerPage));
      expect(getQueryParamFromLastCall("sortBy")).toBe(NFT_QUERY_DEFAULTS.sortBy);
      expect(getQueryParamFromLastCall("orderBy")).toBe(NFT_QUERY_DEFAULTS.orderBy);
    });

    it("uses provided query params when custom values are passed", async () => {
      mockApiRequest.mockResolvedValue(createRawResponse([createRawNft({ id: 2 })], 1));

      await getNfts({
        page: 3,
        rows: 4,
        sortBy: "createdAt",
        orderBy: "DESC",
      });

      expect(getQueryParamFromLastCall("page")).toBe("3");
      expect(getQueryParamFromLastCall("rows")).toBe("4");
      expect(getQueryParamFromLastCall("sortBy")).toBe("createdAt");
      expect(getQueryParamFromLastCall("orderBy")).toBe("DESC");
    });

    it("throws TypeError when API returns an invalid price", async () => {
      mockApiRequest.mockResolvedValue(
        createRawResponse([createRawNft({ id: 99, price: "invalid-price" })], 1),
      );

      try {
        await getNfts();
        throw new Error("Expected getNfts to throw for invalid price");
      } catch (error) {
        expect(error).toBeInstanceOf(TypeError);
        expect((error as Error).message).toBe("Invalid product price for id 99");
      }
    });
  });

  describe("getNftById", () => {
    it("returns null for blank ids and does not hit the API", async () => {
      const result = await getNftById("   ");

      expect(result).toBeNull();
      expect(mockApiRequest).not.toHaveBeenCalled();
    });

    it("returns the NFT when found on the first page", async () => {
      mockApiRequest.mockResolvedValue(
        createRawResponse([createRawNft({ id: 11, name: "Found on first page" })], 20),
      );

      const result = await getNftById("11");

      expect(result).toEqual({
        id: "11",
        name: "Found on first page",
        description: "NFT description",
        image: "https://images.example.com/nft.png",
        price: 1.25,
      });
      expect(mockApiRequest).toHaveBeenCalledTimes(1);
      expect(getQueryParamFromLastCall("page")).toBe("1");
    });

    it("keeps paging until finding the requested id", async () => {
      mockApiRequest
        .mockResolvedValueOnce(createRawResponse([createRawNft({ id: 1 })], 16))
        .mockResolvedValueOnce(
          createRawResponse([createRawNft({ id: 42, name: "Found on page 2" })], 16),
        );

      const result = await getNftById("42");

      expect(result?.id).toBe("42");
      expect(result?.name).toBe("Found on page 2");
      expect(mockApiRequest).toHaveBeenCalledTimes(2);
      const firstCallPath = (mockApiRequest.mock.calls[0][0] as { path?: string }).path ?? "";
      const secondCallPath = (mockApiRequest.mock.calls[1][0] as { path?: string }).path ?? "";
      expect(new URLSearchParams(firstCallPath.split("?")[1]).get("page")).toBe("1");
      expect(new URLSearchParams(secondCallPath.split("?")[1]).get("page")).toBe("2");
    });

    it("returns null after scanning all available pages", async () => {
      mockApiRequest
        .mockResolvedValueOnce(createRawResponse([createRawNft({ id: 1 })], 16))
        .mockResolvedValueOnce(createRawResponse([createRawNft({ id: 2 })], 16));

      const result = await getNftById("999");

      expect(result).toBeNull();
      expect(mockApiRequest).toHaveBeenCalledTimes(2);
    });

    it("propagates request errors while scanning pages", async () => {
      mockApiRequest.mockRejectedValue(new Error("HTTP 500: upstream failure"));

      await expect(getNftById("10")).rejects.toThrow("HTTP 500: upstream failure");
    });
  });
});
