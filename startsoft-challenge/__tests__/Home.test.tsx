import { fireEvent, render, screen } from "@testing-library/react";
import { getNfts, type GetNftsResult } from "@/features/nfts/api/nftApi";
import type { Nft } from "@/features/nfts/types/nft.types";
import { useNftsInfiniteQuery } from "@/features/nfts/hooks/useNftsInfiniteQuery";
import { useAppSelector } from "@/shared/store/hooks";
import { NFT_QUERY_DEFAULTS } from "@/features/nfts/config/queryDefaults";
import Home, { getServerSideProps } from "@/pages/index";

jest.mock("@/shared/store/hooks", () => ({
  useAppSelector: jest.fn(),
}));

jest.mock("@/features/nfts/hooks/useNftsInfiniteQuery", () => ({
  useNftsInfiniteQuery: jest.fn(),
}));

jest.mock("@/features/nfts/api/nftApi", () => ({
  getNfts: jest.fn(),
}));

jest.mock("@/shared/components/Header", () => ({
  Header: ({
    cartCount = 0,
    onCartButtonClick,
  }: {
    cartCount?: number;
    onCartButtonClick?: () => void;
  }) => (
    <header>
      <span data-testid="header-cart-count">{cartCount}</span>
      <button type="button" onClick={onCartButtonClick}>
        Abrir carrinho
      </button>
    </header>
  ),
}));

jest.mock("@/shared/components/Footer", () => ({
  Footer: () => <footer>Footer</footer>,
}));

jest.mock("@/features/nfts/components/List", () => ({
  List: ({ items }: { items: Array<{ id: string; name: string }> }) => (
    <ul data-testid="nft-list">
      {items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  ),
}));

jest.mock("@/features/nfts/components/LoadMore", () => ({
  LoadMore: ({
    label,
    progress,
    onClick,
    isLoading = false,
  }: {
    label: string;
    progress: number;
    onClick: () => void;
    isLoading?: boolean;
  }) => (
    <div>
      <span data-testid="load-more-progress">{progress}</span>
      <button type="button" onClick={onClick} disabled={isLoading}>
        {label}
      </button>
    </div>
  ),
}));

jest.mock("@/features/cart/components/OverlayCheckout", () => ({
  OverlayCheckout: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? (
      <div data-testid="overlay-checkout">
        <button type="button" onClick={onClose}>
          Fechar carrinho
        </button>
      </div>
    ) : null,
}));

const mockUseNftsInfiniteQuery = useNftsInfiniteQuery as jest.MockedFunction<
  typeof useNftsInfiniteQuery
>;
const mockUseAppSelector = useAppSelector as jest.Mock;
const mockGetNfts = getNfts as jest.MockedFunction<typeof getNfts>;

function createNft(overrides: Partial<Nft> = {}): Nft {
  return {
    id: "1",
    name: "NFT One",
    description: "NFT description",
    price: 1.25,
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

describe("Home page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppSelector.mockReturnValue(0);
    mockUseNftsInfiniteQuery.mockReturnValue(
      createInfiniteQueryResult(undefined, { hasNextPage: false }),
    );
  });

  it("shows loading state on first render without items", () => {
    mockUseNftsInfiniteQuery.mockReturnValue(
      createInfiniteQueryResult(undefined, { isLoading: true, hasNextPage: false }),
    );

    render(<Home initialNfts={null} />);

    expect(screen.getByText("Carregando NFTs...")).toBeInTheDocument();
  });

  it("shows empty state when query succeeds with no items", () => {
    mockUseNftsInfiniteQuery.mockReturnValue(
      createInfiniteQueryResult([{ items: [], count: 0 }], { hasNextPage: false }),
    );

    render(<Home initialNfts={null} />);

    expect(screen.getByText("Nenhum NFT encontrado")).toBeInTheDocument();
    expect(
      screen.getByText("Ainda não existem itens para exibir nesta listagem."),
    ).toBeInTheDocument();
  });

  it("opens cart overlay when cart button is clicked", async () => {
    mockUseNftsInfiniteQuery.mockReturnValue(
      createInfiniteQueryResult([{ items: [], count: 0 }], { hasNextPage: false }),
    );

    render(<Home initialNfts={null} />);

    expect(screen.queryByTestId("overlay-checkout")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Abrir carrinho" }));

    expect(await screen.findByTestId("overlay-checkout")).toBeInTheDocument();
  });

  it("closes cart overlay when close handler is triggered", () => {
    mockUseNftsInfiniteQuery.mockReturnValue(
      createInfiniteQueryResult([{ items: [], count: 0 }], { hasNextPage: false }),
    );

    render(<Home initialNfts={null} />);

    fireEvent.click(screen.getByRole("button", { name: "Abrir carrinho" }));
    expect(screen.getByTestId("overlay-checkout")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Fechar carrinho" }));
    expect(screen.queryByTestId("overlay-checkout")).not.toBeInTheDocument();
  });

  it("merges paginated pages without duplicated ids", () => {
    const firstPage: GetNftsResult = {
      items: [createNft({ id: "1", name: "NFT One" })],
      count: 2,
    };
    const secondPage: GetNftsResult = {
      items: [
        createNft({ id: "1", name: "Duplicate name should not appear" }),
        createNft({ id: "2", name: "NFT Two" }),
      ],
      count: 2,
    };

    mockUseNftsInfiniteQuery.mockReturnValue(
      createInfiniteQueryResult([firstPage, secondPage], { hasNextPage: false }),
    );

    render(<Home initialNfts={firstPage} />);

    expect(screen.getByText("NFT One")).toBeInTheDocument();
    expect(screen.getByText("NFT Two")).toBeInTheDocument();
    expect(screen.queryAllByText("NFT One")).toHaveLength(1);
    expect(screen.queryByText("Duplicate name should not appear")).not.toBeInTheDocument();
  });

  it("requests next page when load more is clicked", () => {
    const firstPage: GetNftsResult = {
      items: [createNft({ id: "1", name: "NFT One" })],
      count: 2,
    };
    const fetchNextPage = jest.fn().mockResolvedValue(undefined);

    mockUseNftsInfiniteQuery.mockReturnValue(
      createInfiniteQueryResult([firstPage], { hasNextPage: true, fetchNextPage }),
    );

    render(<Home initialNfts={firstPage} />);

    fireEvent.click(screen.getByRole("button", { name: "Carregar mais" }));

    expect(fetchNextPage).toHaveBeenCalledTimes(1);
  });

  it("disables load more button while loading next page", () => {
    const firstPage: GetNftsResult = {
      items: [createNft({ id: "1", name: "NFT One" })],
      count: 2,
    };

    mockUseNftsInfiniteQuery.mockReturnValue(
      createInfiniteQueryResult([firstPage], { isFetchingNextPage: true }),
    );

    render(<Home initialNfts={firstPage} />);

    expect(screen.getByRole("button", { name: "Carregar mais" })).toBeDisabled();
  });

  it("shows query error when no item is visible", () => {
    mockUseNftsInfiniteQuery.mockReturnValue(
      createInfiniteQueryResult(undefined, {
        isError: true,
        error: new Error("Falha ao consultar API"),
        hasNextPage: false,
      }),
    );

    render(<Home initialNfts={null} />);

    expect(screen.getByText("Falha ao consultar API")).toBeInTheDocument();
    expect(screen.queryByTestId("nft-list")).not.toBeInTheDocument();
  });

  it("keeps rendered items and shows query error when there are visible items", () => {
    const firstPage: GetNftsResult = {
      items: [createNft({ id: "1", name: "NFT One" })],
      count: 1,
    };

    mockUseNftsInfiniteQuery.mockReturnValue(
      createInfiniteQueryResult([firstPage], {
        isError: true,
        error: new Error("Falha ao atualizar"),
        hasNextPage: false,
      }),
    );

    render(<Home initialNfts={firstPage} />);

    expect(screen.getByText("NFT One")).toBeInTheDocument();
    expect(screen.getByText("Falha ao atualizar")).toBeInTheDocument();
  });

  it("does not advance page when all NFTs are already visible", () => {
    const fullPage: GetNftsResult = {
      items: [createNft({ id: "1", name: "NFT One" })],
      count: 1,
    };
    const fetchNextPage = jest.fn().mockResolvedValue(undefined);

    mockUseNftsInfiniteQuery.mockReturnValue(
      createInfiniteQueryResult([fullPage], { hasNextPage: false, fetchNextPage }),
    );

    render(<Home initialNfts={fullPage} />);

    fireEvent.click(screen.getByRole("button", { name: "Você já visualizou tudo" }));

    expect(fetchNextPage).not.toHaveBeenCalled();
  });
});

describe("Home getServerSideProps", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns initial nfts when API call succeeds", async () => {
    const serverResult: GetNftsResult = {
      items: [createNft({ id: "1", name: "NFT SSR" })],
      count: 1,
    };
    mockGetNfts.mockResolvedValue(serverResult);

    const result = await getServerSideProps({} as never);

    expect(mockGetNfts).toHaveBeenCalledWith({
      page: 1,
      rows: NFT_QUERY_DEFAULTS.rowsPerPage,
      sortBy: NFT_QUERY_DEFAULTS.sortBy,
      orderBy: NFT_QUERY_DEFAULTS.orderBy,
    });
    expect(result).toEqual({
      props: {
        initialNfts: serverResult,
      },
    });
  });

  it("returns null initial data when API call fails", async () => {
    mockGetNfts.mockRejectedValue(new Error("network down"));

    const result = await getServerSideProps({} as never);

    expect(result).toEqual({
      props: {
        initialNfts: null,
      },
    });
  });
});
