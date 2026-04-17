/** @vitest-environment jsdom */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FinalPDF from "./FinalPDF";

describe("FinalPDF", () => {
  const sessionId = "test-session-id";

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock global fetch
    global.fetch = vi.fn();
    
    // Mock window.URL
    window.URL.createObjectURL = vi.fn(() => "mock-url");
    window.URL.revokeObjectURL = vi.fn();
    
    // Instead of mocking createElement, we mock appendChild which is less intrusive
    vi.spyOn(document.body, "appendChild").mockImplementation((node) => node);
    vi.spyOn(document.body, "removeChild").mockImplementation((node) => node);
  });

  it("renders correctly with initial state", async () => {
    const { container } = render(<div>Basic Test Button</div>);
    console.log("Container innerHTML:", container.innerHTML);
    expect(screen.getByText("Basic Test Button")).toBeDefined();
  });

  it("handles successful PDF download", async () => {
    const mockBlob = new Blob(["test"], { type: "application/pdf" });
    const mockResponse = {
      ok: true,
      blob: () => Promise.resolve(mockBlob),
      headers: new Map([['Content-Disposition', 'attachment; filename="bill.pdf"']]),
    };
    
    (global.fetch as any).mockResolvedValueOnce(mockResponse);

    render(<FinalPDF sessionId={sessionId} />);
    const button = await screen.findByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText("بننزلها...")).toBeDefined();
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining(`/api/sessions/${sessionId}/export/pdf`)
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/نزل الحسبة/)).toBeDefined();
      expect(button).not.toBeDisabled();
    }, { timeout: 3000 });
  });

  it("handles download failure", async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error("Network Error"));
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    render(<FinalPDF sessionId={sessionId} />);
    const button = await screen.findByRole("button");
    fireEvent.click(button);

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining("مشكلة"));
      expect(screen.getByText(/نزل الحسبة/)).toBeDefined();
      expect(button).not.toBeDisabled();
    });
  });
});
