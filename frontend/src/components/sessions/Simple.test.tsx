/** @vitest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

describe("SimpleTest", () => {
  it("renders a div", () => {
    render(<div>Hello</div>);
    expect(screen.getByText("Hello")).toBeDefined();
  });
});
