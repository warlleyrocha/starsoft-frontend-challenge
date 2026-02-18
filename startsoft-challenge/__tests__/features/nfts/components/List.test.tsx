import { render, screen } from "@testing-library/react";
import type { Nft } from "@/features/nfts/types/nft.types";
import { List } from "@/features/nfts/components/List";
import { Card } from "@/features/nfts/components/Card/Card";

jest.mock("@/features/nfts/components/Card/Card", () => ({
  Card: jest.fn(({ nft }: { nft: Nft }) => <article data-testid="nft-card">{nft.name}</article>),
}));

const mockCard = Card as jest.Mock;

function createNft(overrides: Partial<Nft> = {}): Nft {
  return {
    id: "1",
    name: "NFT One",
    description: "NFT description",
    price: 1.5,
    image: "https://images.example.com/nft.png",
    ...overrides,
  };
}

describe("List component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders one Card per item", () => {
    const items = [createNft({ id: "1" }), createNft({ id: "2" }), createNft({ id: "3" })];

    render(<List items={items} />);

    expect(screen.getAllByTestId("nft-card")).toHaveLength(3);
  });

  it("passes each nft prop correctly to Card", () => {
    const items = [createNft({ id: "1" }), createNft({ id: "2" })];

    render(<List items={items} />);

    const receivedNfts = mockCard.mock.calls.map(([props]) => (props as { nft: Nft }).nft);

    expect(receivedNfts).toEqual(items);
  });

  it("preserves item order when rendering cards", () => {
    const items = [
      createNft({ id: "1", name: "First NFT" }),
      createNft({ id: "2", name: "Second NFT" }),
      createNft({ id: "3", name: "Third NFT" }),
    ];

    render(<List items={items} />);

    const renderedNames = screen.getAllByTestId("nft-card").map((card) => card.textContent);

    expect(renderedNames).toEqual(["First NFT", "Second NFT", "Third NFT"]);
  });

  it("renders no cards for an empty list", () => {
    render(<List items={[]} />);

    expect(screen.queryByTestId("nft-card")).not.toBeInTheDocument();
    expect(mockCard).not.toHaveBeenCalled();
  });
});
