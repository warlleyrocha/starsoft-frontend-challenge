import {
  addItem,
  cartReducer,
  clearCart,
  decreaseQuantity,
  hydrateCart,
  increaseQuantity,
  removeItem,
  type CartItem,
} from "@/features/cart/store/cartSlice";

type CartState = ReturnType<typeof cartReducer>;

function createAddItemPayload(overrides: Partial<Omit<CartItem, "quantity">> = {}) {
  return {
    id: "item-1",
    name: "Dragon Relic",
    description: "Ancient artifact",
    price: 2.5,
    image: "https://images.example.com/dragon-relic.png",
    ...overrides,
  };
}

function getInitialState(): CartState {
  return cartReducer(undefined, { type: "@@INIT" });
}

describe("cartSlice", () => {
  it("adds a new item with default quantity 1", () => {
    const next = cartReducer(getInitialState(), addItem(createAddItemPayload()));

    expect(next.items).toEqual([
      {
        id: "item-1",
        name: "Dragon Relic",
        description: "Ancient artifact",
        price: 2.5,
        image: "https://images.example.com/dragon-relic.png",
        quantity: 1,
      },
    ]);
  });

  it("increments quantity when adding an existing item", () => {
    const stateWithItem = cartReducer(
      getInitialState(),
      addItem({ ...createAddItemPayload(), quantity: 2 }),
    );
    const next = cartReducer(stateWithItem, addItem({ ...createAddItemPayload(), quantity: 3 }));

    expect(next.items).toHaveLength(1);
    expect(next.items[0].quantity).toBe(5);
  });

  it("ignores addItem when id or price is invalid", () => {
    const withValidItem = cartReducer(getInitialState(), addItem(createAddItemPayload()));
    const withInvalidId = cartReducer(
      withValidItem,
      addItem({ ...createAddItemPayload({ id: "   " }), quantity: 2 }),
    );
    const withInvalidPrice = cartReducer(
      withInvalidId,
      addItem({
        ...createAddItemPayload({ id: "item-2" }),
        price: -1,
      }),
    );

    expect(withInvalidPrice.items).toHaveLength(1);
    expect(withInvalidPrice.items[0].id).toBe("item-1");
  });

  it("removes item by id and ignores invalid remove payload", () => {
    const withTwoItems = cartReducer(
      cartReducer(getInitialState(), addItem(createAddItemPayload({ id: "item-1" }))),
      addItem(createAddItemPayload({ id: "item-2" })),
    );
    const removed = cartReducer(withTwoItems, removeItem({ id: "item-1" }));
    const unchanged = cartReducer(removed, removeItem({ id: "   " }));

    expect(removed.items.map((item) => item.id)).toEqual(["item-2"]);
    expect(unchanged.items.map((item) => item.id)).toEqual(["item-2"]);
  });

  it("increases quantity for existing item and ignores unknown id", () => {
    const withItem = cartReducer(getInitialState(), addItem(createAddItemPayload()));
    const increased = cartReducer(withItem, increaseQuantity({ id: "item-1" }));
    const unchanged = cartReducer(increased, increaseQuantity({ id: "missing-id" }));

    expect(increased.items[0].quantity).toBe(2);
    expect(unchanged.items[0].quantity).toBe(2);
  });

  it("decreases quantity and removes item when quantity reaches 0/1", () => {
    const withQtyThree = cartReducer(
      getInitialState(),
      addItem({ ...createAddItemPayload({ id: "item-1" }), quantity: 3 }),
    );
    const decreased = cartReducer(withQtyThree, decreaseQuantity({ id: "item-1" }));

    expect(decreased.items[0].quantity).toBe(2);

    const withQtyOne = cartReducer(
      getInitialState(),
      addItem({ ...createAddItemPayload({ id: "item-2" }), quantity: 1 }),
    );
    const removed = cartReducer(withQtyOne, decreaseQuantity({ id: "item-2" }));

    expect(removed.items).toHaveLength(0);
  });

  it("clears all cart items", () => {
    const withItems = cartReducer(
      cartReducer(getInitialState(), addItem(createAddItemPayload({ id: "item-1" }))),
      addItem(createAddItemPayload({ id: "item-2" })),
    );
    const cleared = cartReducer(withItems, clearCart());

    expect(cleared.items).toEqual([]);
  });

  it("hydrates and sanitizes incoming cart items", () => {
    const payload = [
      null,
      { id: "   ", price: 10 },
      {
        id: "item-1",
        name: 123,
        description: null,
        image: 456,
        price: "2.7",
        quantity: "3.9",
      },
      {
        id: "item-2",
        name: "Invalid price",
        description: "x",
        image: "img",
        price: -1,
        quantity: 2,
      },
      {
        id: "item-3",
        name: "Quantity fallback",
        description: "desc",
        image: "img",
        price: "4",
        quantity: 0,
      },
    ];

    const hydrated = cartReducer(getInitialState(), hydrateCart(payload));

    expect(hydrated.items).toEqual([
      {
        id: "item-1",
        name: "",
        description: "",
        image: "",
        price: 2.7,
        quantity: 3,
      },
      {
        id: "item-3",
        name: "Quantity fallback",
        description: "desc",
        image: "img",
        price: 4,
        quantity: 1,
      },
    ]);
  });

  it("hydrates as empty list for non-array payload", () => {
    const hydrated = cartReducer(getInitialState(), hydrateCart({ items: [] }));

    expect(hydrated.items).toEqual([]);
  });
});
