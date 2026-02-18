import type { AnchorHTMLAttributes, ImgHTMLAttributes, ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { useQueryClient } from "@tanstack/react-query";
import { getNftById } from "@/features/nfts/api/nftApi";
import { useAppSelector } from "@/shared/store/hooks";
import NftDetailPage, { getServerSideProps } from "@/pages/nfts/[id]";
import type { Nft } from "@/features/nfts/types/nft.types";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt ?? ""} />,
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...rest
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

jest.mock("@tanstack/react-query", () => ({
  useQueryClient: jest.fn(),
}));

jest.mock("@/shared/store/hooks", () => ({
  useAppSelector: jest.fn(),
}));

jest.mock("@/features/nfts/api/nftApi", () => ({
  getNftById: jest.fn(),
}));

jest.mock("@/shared/components/Header", () => ({
  Header: ({ cartCount = 0 }: { cartCount?: number }) => (
    <header data-testid="header-cart-count">{cartCount}</header>
  ),
}));

jest.mock("@/shared/components/Footer", () => ({
  Footer: () => <footer>Footer</footer>,
}));

const mockUseAppSelector = useAppSelector as jest.Mock;
const mockGetNftById = getNftById as jest.MockedFunction<typeof getNftById>;
const mockUseQueryClient = useQueryClient as jest.MockedFunction<typeof useQueryClient>;

function createNft(overrides: Partial<Nft> = {}): Nft {
  return {
    id: "123",
    name: "Dragon Relic",
    description: "Ancient artifact",
    price: 3.5,
    image: "https://images.example.com/dragon-relic.png",
    ...overrides,
  };
}

describe("NftDetailPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppSelector.mockReturnValue(0);
    mockUseQueryClient.mockReturnValue({
      getQueryData: jest.fn().mockReturnValue(undefined),
    } as never);
  });

  it("renders nft details and back link", () => {
    const nft = createNft();
    mockUseAppSelector.mockReturnValue(4);

    render(<NftDetailPage nft={nft} />);

    expect(screen.getByTestId("header-cart-count")).toHaveTextContent("4");
    expect(screen.getByRole("heading", { name: "Dragon Relic" })).toBeInTheDocument();
    expect(screen.getByText("Ancient artifact")).toBeInTheDocument();
    expect(screen.getByText("ID: 123")).toBeInTheDocument();
    expect(screen.getByText("3.5 ETH")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar para a listagem" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders graceful error state when detail data is unavailable", () => {
    mockUseAppSelector.mockReturnValue(1);

    render(
      <NftDetailPage
        nft={null}
        hasError
        errorMessage="Nao foi possivel carregar os detalhes deste NFT no momento."
        requestedId="123"
      />,
    );

    expect(screen.getByTestId("header-cart-count")).toHaveTextContent("1");
    expect(screen.getByText("Nao foi possivel carregar este NFT")).toBeInTheDocument();
    expect(
      screen.getByText("Nao foi possivel carregar os detalhes deste NFT no momento."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar para a listagem" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("uses cached list data to render detail when SSR fallback has no nft", () => {
    const cachedNft = createNft({ id: "3", name: "Cached Dragon" });
    mockUseQueryClient.mockReturnValue({
      getQueryData: jest.fn().mockReturnValue({
        pages: [{ items: [cachedNft], count: 1 }],
        pageParams: [1],
      }),
    } as never);

    render(<NftDetailPage nft={null} hasError errorMessage="fetch failed" requestedId="3" />);

    expect(screen.getByRole("heading", { name: "Cached Dragon" })).toBeInTheDocument();
    expect(screen.getByText("ID: 3")).toBeInTheDocument();
    expect(screen.queryByText("Nao foi possivel carregar este NFT")).not.toBeInTheDocument();
  });
});

describe("NftDetailPage getServerSideProps", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns props with nft when id is found", async () => {
    const nft = createNft({ id: "42", name: "Found NFT" });
    mockGetNftById.mockResolvedValue(nft);

    const result = await getServerSideProps({
      params: { id: "42" },
    } as never);

    expect(mockGetNftById).toHaveBeenCalledWith("42");
    expect(result).toEqual({
      props: {
        nft,
      },
    });
  });

  it("returns notFound when nft is missing", async () => {
    mockGetNftById.mockResolvedValue(null);

    const result = await getServerSideProps({
      params: { id: "missing-id" },
    } as never);

    expect(mockGetNftById).toHaveBeenCalledWith("missing-id");
    expect(result).toEqual({
      notFound: true,
    });
  });

  it("treats non-string route param as empty id", async () => {
    mockGetNftById.mockResolvedValue(null);

    const result = await getServerSideProps({
      params: { id: ["42"] },
    } as never);

    expect(mockGetNftById).toHaveBeenCalledWith("");
    expect(result).toEqual({
      notFound: true,
    });
  });

  it("returns fallback props when API request fails", async () => {
    mockGetNftById.mockRejectedValue(new Error("API indisponivel"));

    const result = await getServerSideProps({
      params: { id: "500" },
    } as never);

    expect(mockGetNftById).toHaveBeenCalledWith("500");
    expect(result).toEqual({
      props: {
        nft: null,
        hasError: true,
        errorMessage: "API indisponivel",
        requestedId: "500",
      },
    });
  });

  it("maps network fetch error to a user-friendly message", async () => {
    mockGetNftById.mockRejectedValue(new Error("fetch failed"));

    const result = await getServerSideProps({
      params: { id: "501" },
    } as never);

    expect(result).toEqual({
      props: {
        nft: null,
        hasError: true,
        errorMessage:
          "Nao foi possivel conectar com a API no momento. Tente novamente em instantes.",
        requestedId: "501",
      },
    });
  });
});
