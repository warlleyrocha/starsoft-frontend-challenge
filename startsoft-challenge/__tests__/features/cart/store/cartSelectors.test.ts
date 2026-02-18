import type { RootState } from "@/shared/store";
import {
  selectCartCount,
  selectCartItemById,
  selectCartItems,
  selectCartTotalEth,
} from "@/features/cart/store/cartSelectors";
import type { CartItem } from "@/features/cart/store/cartSlice";

function createCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: "item-1",
    name: "Dragon Relic",
    description: "Ancient artifact",
    price: 2,
    image: "https://images.example.com/dragon-relic.png",
    quantity: 1,
    ...overrides,
  };
}

function createState(items: CartItem[]): RootState {
  return {
    cart: {
      items,
    },
  } as RootState;
}

describe("cartSelectors", () => {
  it("selectCartItems returns cart item list", () => {
    const items = [createCartItem({ id: "item-1" }), createCartItem({ id: "item-2" })];
    const state = createState(items);

    expect(selectCartItems(state)).toEqual(items);
  });

  it("selectCartCount returns sum of quantities", () => {
    const state = createState([
      createCartItem({ id: "item-1", quantity: 2 }),
      createCartItem({ id: "item-2", quantity: 3 }),
    ]);

    expect(selectCartCount(state)).toBe(5);
  });

  it("selectCartTotalEth returns sum of price * quantity", () => {
    const state = createState([
      createCartItem({ id: "item-1", price: 1.5, quantity: 2 }),
      createCartItem({ id: "item-2", price: 2, quantity: 3 }),
    ]);

    expect(selectCartTotalEth(state)).toBe(9);
  });

  it("selectCartItemById returns matching item or undefined", () => {
    const state = createState([createCartItem({ id: "item-1" })]);

    expect(selectCartItemById("item-1")(state)).toEqual(createCartItem({ id: "item-1" }));
    expect(selectCartItemById("missing-id")(state)).toBeUndefined();
  });
});
