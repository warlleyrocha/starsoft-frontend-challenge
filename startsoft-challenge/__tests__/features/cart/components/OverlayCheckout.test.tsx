import type { ImgHTMLAttributes, ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { OverlayCheckout } from "@/features/cart/components/OverlayCheckout";
import {
  decreaseQuantity,
  increaseQuantity,
  removeItem,
  type CartItem,
} from "@/features/cart/store/cartSlice";
import { selectCartItems, selectCartTotalEth } from "@/features/cart/store/cartSelectors";
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks";

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => <img {...props} />,
}));

jest.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & { children?: ReactNode }) => (
      <div {...props}>{children}</div>
    ),
    aside: ({
      children,
      ...props
    }: React.HTMLAttributes<HTMLElement> & { children?: ReactNode }) => (
      <aside {...props}>{children}</aside>
    ),
  },
}));

jest.mock("@/shared/store/hooks", () => ({
  useAppDispatch: jest.fn(),
  useAppSelector: jest.fn(),
}));

const mockUseAppDispatch = useAppDispatch as jest.Mock;
const mockUseAppSelector = useAppSelector as jest.Mock;
const mockDispatch = jest.fn();

function createCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: "item-1",
    name: "Dragon Relic",
    description: "Ancient artifact",
    price: 2,
    image: "https://images.example.com/dragon-relic.png",
    quantity: 2,
    ...overrides,
  };
}

function setupSelectors(items: CartItem[], totalEth: number) {
  mockUseAppSelector.mockImplementation((selector: unknown) => {
    if (selector === selectCartItems) return items;
    if (selector === selectCartTotalEth) return totalEth;
    return undefined;
  });
}

function renderOverlay({
  isOpen = true,
  items = [],
  totalEth = 0,
  onClose = jest.fn(),
}: {
  isOpen?: boolean;
  items?: CartItem[];
  totalEth?: number;
  onClose?: jest.Mock;
}) {
  setupSelectors(items, totalEth);
  const view = render(<OverlayCheckout isOpen={isOpen} onClose={onClose} />);
  return { ...view, onClose };
}

describe("OverlayCheckout component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppDispatch.mockReturnValue(mockDispatch);
    document.body.style.overflow = "";
  });

  it("does not render dialog when closed", () => {
    renderOverlay({ isOpen: false });

    expect(
      screen.queryByRole("dialog", { name: "Mochila de Compras", hidden: true }),
    ).not.toBeInTheDocument();
  });

  it("renders dialog when open", () => {
    renderOverlay({ isOpen: true });

    expect(screen.getByRole("dialog", { name: "Mochila de Compras", hidden: true })).toBeInTheDocument();
  });

  it("calls onClose when clicking backdrop", () => {
    const { onClose } = renderOverlay({ isOpen: true });
    const dialog = screen.getByRole("dialog", { name: "Mochila de Compras", hidden: true });
    const overlay = dialog.parentElement as HTMLElement;

    fireEvent.mouseDown(overlay);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close when clicking inside the drawer", () => {
    const { onClose } = renderOverlay({ isOpen: true });
    const dialog = screen.getByRole("dialog", { name: "Mochila de Compras", hidden: true });

    fireEvent.mouseDown(dialog);

    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose when clicking close button", () => {
    const { onClose } = renderOverlay({ isOpen: true });

    fireEvent.click(screen.getByRole("button", { name: "Fechar carrinho", hidden: true }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape is pressed", () => {
    const { onClose } = renderOverlay({ isOpen: true });

    fireEvent.keyDown(window, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("locks body scroll when open and restores it when closed", () => {
    document.body.style.overflow = "scroll";
    setupSelectors([], 0);
    const onClose = jest.fn();
    const { rerender } = render(<OverlayCheckout isOpen onClose={onClose} />);

    expect(document.body.style.overflow).toBe("hidden");

    rerender(<OverlayCheckout isOpen={false} onClose={onClose} />);

    expect(document.body.style.overflow).toBe("scroll");
  });

  it("shows empty state and disables checkout when cart has no items", () => {
    renderOverlay({ isOpen: true, items: [], totalEth: 0 });

    expect(screen.getByText("Seu carrinho está vazio.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Finalizar Compra", hidden: true })).toBeDisabled();
  });

  it("renders cart items and total, enabling checkout when there are items", () => {
    const items = [createCartItem()];
    renderOverlay({ isOpen: true, items, totalEth: 4 });

    expect(screen.getByText("Dragon Relic")).toBeInTheDocument();
    expect(screen.getByText("Ancient artifact")).toBeInTheDocument();
    expect(screen.getByText("2 ETH")).toBeInTheDocument();
    expect(screen.getByText("4 ETH")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Finalizar Compra", hidden: true })).toBeEnabled();
  });

  it("dispatches quantity and remove actions for item controls", () => {
    const item = createCartItem({ id: "item-42", name: "Phoenix Feather" });
    renderOverlay({ isOpen: true, items: [item], totalEth: 2 });

    fireEvent.click(
      screen.getByRole("button", { name: "Diminuir quantidade de Phoenix Feather", hidden: true }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Aumentar quantidade de Phoenix Feather", hidden: true }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Remover Phoenix Feather do carrinho", hidden: true }),
    );

    expect(mockDispatch).toHaveBeenNthCalledWith(1, decreaseQuantity({ id: "item-42" }));
    expect(mockDispatch).toHaveBeenNthCalledWith(2, increaseQuantity({ id: "item-42" }));
    expect(mockDispatch).toHaveBeenNthCalledWith(3, removeItem({ id: "item-42" }));
  });
});
