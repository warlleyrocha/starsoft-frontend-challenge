import { loadCartItems, saveCartItems } from "@/features/cart/store/cartStorage";
import type { CartItem } from "@/features/cart/store/cartSlice";

const CART_STORAGE_KEY = "starsoft_cart_v1";

function createCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: "item-1",
    name: "Dragon Relic",
    description: "Ancient artifact",
    price: 2.5,
    image: "https://images.example.com/dragon-relic.png",
    quantity: 1,
    ...overrides,
  };
}

describe("cartStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it("returns empty array when key is missing", () => {
    expect(loadCartItems()).toEqual([]);
  });

  it("returns empty array for invalid or incompatible payloads", () => {
    localStorage.setItem(CART_STORAGE_KEY, "{invalid-json");
    expect(loadCartItems()).toEqual([]);

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(null));
    expect(loadCartItems()).toEqual([]);

    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items: "not-an-array" }));
    expect(loadCartItems()).toEqual([]);
  });

  it("returns stored items when payload shape is valid", () => {
    const items = [createCartItem(), createCartItem({ id: "item-2" })];
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items }));

    expect(loadCartItems()).toEqual(items);
  });

  it("serializes items using storage key when saving", () => {
    const items = [createCartItem({ id: "item-1" }), createCartItem({ id: "item-2" })];
    const setItemSpy = jest.spyOn(Storage.prototype, "setItem");

    saveCartItems(items);

    expect(setItemSpy).toHaveBeenCalledWith(CART_STORAGE_KEY, JSON.stringify({ items }));
  });

  it("swallows getItem errors and returns empty array", () => {
    jest.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("storage blocked");
    });

    expect(() => loadCartItems()).not.toThrow();
    expect(loadCartItems()).toEqual([]);
  });

  it("swallows setItem errors when saving", () => {
    const items = [createCartItem()];
    jest.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota exceeded");
    });

    expect(() => saveCartItems(items)).not.toThrow();
  });
});
