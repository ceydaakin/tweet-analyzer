import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { saveAnalysis } from "./lib/api";

vi.mock("./lib/api", () => ({ saveAnalysis: vi.fn() }));

describe("App", () => {
  beforeAll(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("renders the hero and an empty history", () => {
    render(<App />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/understand your tweets/i);
    expect(screen.getByText(/no analyses yet/i)).toBeInTheDocument();
  });

  it("adds a completed analysis to history and stats", async () => {
    vi.mocked(saveAnalysis).mockResolvedValue({});
    render(<App />);

    await userEvent.type(screen.getByLabelText("Tweet URL"), "https://x.com/a/status/1");
    await userEvent.click(screen.getByRole("button", { name: /analyze tweet/i }));

    await screen.findByText(/analysis complete/i);
    expect(screen.queryByText(/no analyses yet/i)).not.toBeInTheDocument();
    const stats = screen.getByText("Your Stats").closest(".card");
    expect(within(stats).getByText("Analyzed").previousSibling).toHaveTextContent("1");
    expect(within(stats).getByText("Positive").previousSibling).toHaveTextContent("1");
  });

  it("opens and closes the signup modal", async () => {
    render(<App />);

    await userEvent.click(screen.getByRole("button", { name: "Get Started" }));
    expect(screen.getByText("Create Your Account")).toBeInTheDocument();

    await userEvent.keyboard("{Escape}");
    expect(screen.queryByText("Create Your Account")).not.toBeInTheDocument();
  });

  describe("signup modal", () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it("confirms signup and closes itself", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      await user.click(screen.getByRole("button", { name: "Get Your API Key" }));
      await user.type(screen.getByPlaceholderText("you@example.com"), "me@example.com");
      await user.click(screen.getByRole("button", { name: "Create Free Account" }));

      expect(screen.getByText(/thanks for signing up/i)).toBeInTheDocument();
      await act(() => vi.advanceTimersByTimeAsync(2000));
      expect(screen.queryByText("Create Your Account")).not.toBeInTheDocument();
    });

    it("closes when clicking the backdrop or the close button", async () => {
      render(<App />);

      await userEvent.click(screen.getByRole("button", { name: "Get Started" }));
      await userEvent.click(screen.getByText("Create Your Account").closest(".modal-overlay"));
      expect(screen.queryByText("Create Your Account")).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole("button", { name: "Get Started" }));
      await userEvent.click(screen.getByRole("button", { name: "✕" }));
      expect(screen.queryByText("Create Your Account")).not.toBeInTheDocument();
    });
  });

  describe("contact modal", () => {
    it("sends a message and closes itself", async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      render(<App />);

      await user.click(screen.getByRole("button", { name: /get support/i }));
      await user.type(screen.getByPlaceholderText("Your name"), "Ada");
      await user.type(screen.getByPlaceholderText("you@example.com"), "ada@example.com");
      await user.type(screen.getByPlaceholderText("How can we help?"), "Hello");
      await user.click(screen.getByRole("button", { name: "Send Message" }));

      expect(screen.getByText(/message sent/i)).toBeInTheDocument();
      await act(() => vi.advanceTimersByTimeAsync(2000));
      expect(screen.queryByText("Contact Us")).not.toBeInTheDocument();
      vi.useRealTimers();
    });

    it("opens from the footer and closes via backdrop and close button", async () => {
      render(<App />);

      await userEvent.click(screen.getByRole("link", { name: "Contact" }));
      await userEvent.click(screen.getByText("Contact Us").closest(".modal-overlay"));
      expect(screen.queryByText("Contact Us")).not.toBeInTheDocument();

      await userEvent.click(screen.getByRole("link", { name: "Contact" }));
      await userEvent.click(screen.getByRole("button", { name: "✕" }));
      expect(screen.queryByText("Contact Us")).not.toBeInTheDocument();
    });
  });

  it("scrolls to sections from nav, quick actions and footer links", async () => {
    render(<App />);

    const targets = [
      ...screen.getAllByRole("link", { name: /features|docs|tweetanalyzer/i }),
      screen.getByRole("button", { name: /explore features/i }),
      screen.getByRole("button", { name: /view api docs/i }),
    ];
    for (const target of targets) {
      await userEvent.click(target);
    }

    expect(Element.prototype.scrollIntoView).toHaveBeenCalledTimes(targets.length);
  });

  it("copies the example request to the clipboard", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Copy" }));

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("curl -X POST"));
  });
});
