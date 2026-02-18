import type { AnchorHTMLAttributes, ImgHTMLAttributes, ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { addItem } from "@/features/cart/store/cartSlice";
import { Card } from "@/features/nfts/components/Card";
import type { Nft } from "@/features/nfts/types/nft.types";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";

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
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

const mockUseAppDispatch = useAppDispatch as jest.Mock;
const mockUseAppSelector = useAppSelector as jest.Mock;

const mockDispatch = jest.fn();

function createNft(overrides: Partial<Nft> = {}): Nft {
  return {
    id: "123",
    name: "Dragon Relic",
    description: "An ancient relic",
    price: 3.75,
    image: "https://images.example.com/dragon-relic.png",
    ...overrides,
  };
}

describe("Card component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppDispatch.mockReturnValue(mockDispatch);
    mockUseAppSelector.mockReturnValue(undefined);
  });

  it("renders nft content and details link", () => {
    const nft = createNft();

    render(<Card nft={nft} />);

    expect(screen.getByRole("heading", { name: "Dragon Relic" })).toBeInTheDocument();
    expect(screen.getByText("An ancient relic")).toBeInTheDocument();
    expect(screen.getByText("3.75 ETH")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver detalhes" })).toHaveAttribute("href", "/nfts/123");
  });

  it("shows 'Comprar' when nft is not in cart", () => {
    render(<Card nft={createNft()} />);

    expect(screen.getByRole("button", { name: "Comprar" })).toBeInTheDocument();
  });

  it("shows 'Adicionado ao carrinho' when nft is already in cart", () => {
    mockUseAppSelector.mockReturnValue({
      id: "123",
      name: "Dragon Relic",
      description: "An ancient relic",
      price: 3.75,
      image: "https://images.example.com/dragon-relic.png",
      quantity: 1,
    });

    render(<Card nft={createNft()} />);

    expect(screen.getByRole("button", { name: "Adicionado ao carrinho" })).toBeInTheDocument();
  });

  it("dispatches addItem with nft payload when buy button is clicked", () => {
    const nft = createNft();

    render(<Card nft={nft} />);

    fireEvent.click(screen.getByRole("button", { name: "Comprar" }));

    expect(mockDispatch).toHaveBeenCalledTimes(1);
    expect(mockDispatch).toHaveBeenCalledWith(
      addItem({
        id: nft.id,
        name: nft.name,
        description: nft.description,
        price: nft.price,
        image: nft.image,
      }),
    );
  });
});
