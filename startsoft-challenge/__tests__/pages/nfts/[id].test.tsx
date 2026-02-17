import type { AnchorHTMLAttributes, ImgHTMLAttributes, ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { getNftById } from "@/features/nfts/api/nftApi";
import { useAppSelector } from "@/shared/store/hooks";
import NftDetailPage, { getServerSideProps } from "@/pages/nfts/[id]";
import type { Nft } from "@/features/nfts/types/nft.types";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
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
});
