import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import App from "@/pages/_app";
import { hydrateCart } from "@/features/cart/store/cartSlice";
import { loadCartItems, saveCartItems } from "@/features/cart/store/cartStorage";

jest.mock("next/font/google", () => ({
  Poppins: () => ({
    className: "mock-font-class",
  }),
}));

jest.mock("react-redux", () => ({
  Provider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

jest.mock("@tanstack/react-query", () => ({
  QueryClientProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

jest.mock("@tanstack/react-query-devtools", () => ({
  ReactQueryDevtools: () => null,
}));

jest.mock("@/shared/store", () => {
  let cartItems: unknown[] = [];
  let listener: (() => void) | null = null;
  const unsubscribe = jest.fn(() => {
    listener = null;
  });

  const store = {
    dispatch: jest.fn(),
    getState: jest.fn(() => ({
      cart: {
        items: cartItems,
      },
    })),
    subscribe: jest.fn((nextListener: () => void) => {
      listener = nextListener;
      return unsubscribe;
    }),
  };

  return {
    store,
    __setCartItems: (items: unknown[]) => {
      cartItems = items;
    },
    __emitStoreChange: () => {
      listener?.();
    },
    __getUnsubscribeMock: () => unsubscribe,
    __resetStoreMock: () => {
      cartItems = [];
      listener = null;
      unsubscribe.mockClear();
      store.dispatch.mockClear();
      store.getState.mockClear();
      store.subscribe.mockClear();
    },
  };
});

jest.mock("@/shared/lib/react-query/queryClient", () => ({
  makeQueryClient: jest.fn(() => ({ __mockedQueryClient: true })),
}));

jest.mock("@/features/cart/store/cartStorage", () => ({
  loadCartItems: jest.fn(),
  saveCartItems: jest.fn(),
}));

const mockLoadCartItems = loadCartItems as jest.MockedFunction<typeof loadCartItems>;
const mockSaveCartItems = saveCartItems as jest.MockedFunction<typeof saveCartItems>;

type SharedStoreMockModule = {
  store: {
    dispatch: jest.Mock;
    getState: jest.Mock;
    subscribe: jest.Mock;
  };
  __setCartItems: (items: unknown[]) => void;
  __emitStoreChange: () => void;
  __getUnsubscribeMock: () => jest.Mock;
  __resetStoreMock: () => void;
};

const sharedStoreMock = jest.requireMock("@/shared/store") as SharedStoreMockModule;

function renderApp() {
  const TestPage = () => <div>Test Page</div>;

  return render(<App Component={TestPage as never} pageProps={{}} router={{} as never} />);
}

describe("_app page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sharedStoreMock.__resetStoreMock();
    sharedStoreMock.__setCartItems([]);
    mockLoadCartItems.mockReturnValue([]);
  });

  it("hydrates cart when persisted items exist", () => {
    const persistedItems = [
      {
        id: "item-1",
        name: "Dragon Relic",
        description: "Ancient artifact",
        price: 2.5,
        image: "https://images.example.com/dragon-relic.png",
        quantity: 1,
      },
    ];
    mockLoadCartItems.mockReturnValue(persistedItems);

    renderApp();

    expect(screen.getByText("Test Page")).toBeInTheDocument();
    expect(mockLoadCartItems).toHaveBeenCalledTimes(1);
    expect(sharedStoreMock.store.dispatch).toHaveBeenCalledWith(hydrateCart(persistedItems));
  });

  it("does not dispatch hydrateCart when persisted list is empty", () => {
    mockLoadCartItems.mockReturnValue([]);

    renderApp();

    expect(sharedStoreMock.store.dispatch).not.toHaveBeenCalled();
  });

  it("saves cart items when store state changes", () => {
    sharedStoreMock.__setCartItems([]);
    renderApp();

    const nextItems = [
      {
        id: "item-2",
        name: "Phoenix Feather",
        description: "Mystic item",
        price: 4,
        image: "https://images.example.com/phoenix-feather.png",
        quantity: 2,
      },
    ];

    sharedStoreMock.__setCartItems(nextItems);
    sharedStoreMock.__emitStoreChange();

    expect(mockSaveCartItems).toHaveBeenCalledWith(nextItems);
  });

  it("does not save cart items when serialized state did not change", () => {
    const initialItems = [
      {
        id: "item-1",
        name: "Dragon Relic",
        description: "Ancient artifact",
        price: 2.5,
        image: "https://images.example.com/dragon-relic.png",
        quantity: 1,
      },
    ];
    sharedStoreMock.__setCartItems(initialItems);

    renderApp();

    sharedStoreMock.__emitStoreChange();

    expect(mockSaveCartItems).not.toHaveBeenCalled();
  });

  it("unsubscribes from store updates on unmount", () => {
    const { unmount } = renderApp();

    unmount();

    expect(sharedStoreMock.store.subscribe).toHaveBeenCalledTimes(1);
    expect(sharedStoreMock.__getUnsubscribeMock()).toHaveBeenCalledTimes(1);
  });
});
