import { fireEvent, render, screen } from "@testing-library/react";
import { LoadMore } from "@/features/nfts/components/LoadMore";

function getProgressFill(container: HTMLElement) {
  return container.querySelector("div[style]") as HTMLDivElement | null;
}

describe("LoadMore component", () => {
  it("calls onClick when button is pressed", () => {
    const handleClick = jest.fn();

    render(<LoadMore label="Carregar mais" progress={20} onClick={handleClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Carregar mais" }));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("disables button while loading", () => {
    const handleClick = jest.fn();

    render(<LoadMore label="Carregar mais" progress={20} onClick={handleClick} isLoading />);

    const button = screen.getByRole("button", { name: "Carregar mais" });
    expect(button).toBeDisabled();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("clamps progress below 0 to 0%", () => {
    const { container } = render(
      <LoadMore label="Carregar mais" progress={-10} onClick={jest.fn()} />,
    );

    expect(getProgressFill(container)).toHaveStyle({ width: "0%" });
  });

  it("clamps progress above 100 to 100%", () => {
    const { container } = render(
      <LoadMore label="Carregar mais" progress={140} onClick={jest.fn()} />,
    );

    expect(getProgressFill(container)).toHaveStyle({ width: "100%" });
  });
});
