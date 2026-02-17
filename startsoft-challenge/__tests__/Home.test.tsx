import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { getNfts, type GetNftsResult } from "@/features/nfts/api/nftApi";
import type { Nft } from "@/features/nfts/types/nft.types";
import { useNftsQuery } from "@/features/nfts/hooks/useNftsQuery";
import { useAppSelector } from "@/shared/store/hooks";
import { NFT_QUERY_DEFAULTS } from "@/features/nfts/config/queryDefaults";
import Home, { getServerSideProps } from "@/pages/index";

jest.mock("@/shared/store/hooks", () => ({
  useAppSelector: jest.fn(),
}));

jest.mock("@/features/nfts/hooks/useNftsQuery", () => ({
  useNftsQuery: jest.fn(),
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

const mockUseNftsQuery = useNftsQuery as jest.MockedFunction<typeof useNftsQuery>;
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

function createQueryResult(
  data: GetNftsResult | undefined,
  overrides: Partial<{
    isLoading: boolean;
    isFetching: boolean;
    isError: boolean;
    error: unknown;
  }> = {},
) {
  return {
    data,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
    ...overrides,
  } as ReturnType<typeof useNftsQuery>;
}

describe("Home page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppSelector.mockReturnValue(0);
    mockUseNftsQuery.mockReturnValue(createQueryResult(undefined));
  });

  it("shows loading state on first render without items", () => {
    mockUseNftsQuery.mockReturnValue(createQueryResult(undefined, { isLoading: true }));

    render(<Home initialNfts={null} />);

    expect(screen.getByText("Carregando NFTs...")).toBeInTheDocument();
  });

  it("shows empty state when query succeeds with no items", () => {
    mockUseNftsQuery.mockReturnValue(createQueryResult({ items: [], count: 0 }));

    render(<Home initialNfts={null} />);

    expect(screen.getByText("Nenhum NFT encontrado")).toBeInTheDocument();
    expect(
      screen.getByText("Ainda não existem itens para exibir nesta listagem."),
    ).toBeInTheDocument();
  });

  it("opens cart overlay when cart button is clicked", () => {
    mockUseNftsQuery.mockReturnValue(createQueryResult({ items: [], count: 0 }));

    render(<Home initialNfts={null} />);

    expect(screen.queryByTestId("overlay-checkout")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Abrir carrinho" }));

    expect(screen.getByTestId("overlay-checkout")).toBeInTheDocument();
  });

  it("closes cart overlay when close handler is triggered", () => {
    mockUseNftsQuery.mockReturnValue(createQueryResult({ items: [], count: 0 }));

    render(<Home initialNfts={null} />);

    fireEvent.click(screen.getByRole("button", { name: "Abrir carrinho" }));
    expect(screen.getByTestId("overlay-checkout")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Fechar carrinho" }));
    expect(screen.queryByTestId("overlay-checkout")).not.toBeInTheDocument();
  });

  it("loads next page and merges items without duplicated ids", async () => {
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

    mockUseNftsQuery.mockImplementation(({ page }) => {
      if (page === 2) return createQueryResult(secondPage);
      return createQueryResult(firstPage);
    });

    render(<Home initialNfts={firstPage} />);

    expect(screen.getByText("NFT One")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Carregar mais" }));

    await waitFor(() => {
      expect(screen.getByText("NFT Two")).toBeInTheDocument();
    });

    expect(screen.queryAllByText("NFT One")).toHaveLength(1);
    expect(screen.queryByText("Duplicate name should not appear")).not.toBeInTheDocument();
    expect(mockUseNftsQuery.mock.calls.some(([params]) => params.page === 2)).toBe(true);
  });

  it("disables load more button while loading next page", () => {
    const firstPage: GetNftsResult = {
      items: [createNft({ id: "1", name: "NFT One" })],
      count: 2,
    };

    mockUseNftsQuery.mockReturnValue(createQueryResult(firstPage, { isFetching: true }));

    render(<Home initialNfts={firstPage} />);

    expect(screen.getByRole("button", { name: "Carregar mais" })).toBeDisabled();
  });

  it("shows query error when no item is visible", () => {
    mockUseNftsQuery.mockReturnValue(
      createQueryResult(undefined, { isError: true, error: new Error("Falha ao consultar API") }),
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

    mockUseNftsQuery.mockReturnValue(
      createQueryResult(firstPage, { isError: true, error: new Error("Falha ao atualizar") }),
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

    mockUseNftsQuery.mockImplementation(() => createQueryResult(fullPage));

    render(<Home initialNfts={fullPage} />);

    fireEvent.click(screen.getByRole("button", { name: "Você já visualizou tudo" }));

    expect(mockUseNftsQuery.mock.calls.some(([params]) => params.page === 2)).toBe(false);
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
