import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { analyzeTweet } from "./lib/api";
import { sampleResult } from "./test/fixtures";

vi.mock("./lib/api", () => ({ analyzeTweet: vi.fn() }));

const historySection = () => screen.getByRole("region", { name: "Recent Analyses" });

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  it("renders the hero, sections and an empty history", () => {
    render(<App />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/understand any tweet/i);
    for (const name of [/three steps/i, /everything you need/i, /one endpoint/i]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeInTheDocument();
    }
    expect(within(historySection()).getByText(/no analyses yet/i)).toBeInTheDocument();
  });

  it("adds a completed analysis to history and stats, and persists it", async () => {
    vi.mocked(analyzeTweet).mockResolvedValue(sampleResult);
    const { unmount } = render(<App />);

    await userEvent.type(screen.getByLabelText("Tweet URL"), sampleResult.url);
    await userEvent.click(screen.getByRole("button", { name: /analyze tweet/i }));
    await screen.findByRole("heading", { name: "Analysis Results" });

    const history = historySection();
    expect(within(history).getByText("1", { selector: ".stats-number" })).toBeInTheDocument();
    expect(within(history).getByText("Just now")).toBeInTheDocument();

    unmount();
    render(<App />);
    expect(within(historySection()).getByText(sampleResult.summary)).toBeInTheDocument();
  });

  it("clears the history", async () => {
    localStorage.setItem("tweet-analyzer:history", JSON.stringify([sampleResult]));
    render(<App />);

    await userEvent.click(within(historySection()).getByRole("button", { name: /clear/i }));

    expect(within(historySection()).getByText(/no analyses yet/i)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("tweet-analyzer:history"))).toEqual([]);
  });

  it("toggles and remembers the theme", async () => {
    render(<App />);
    expect(document.documentElement.dataset.theme).toBe("dark");

    await userEvent.click(screen.getByRole("button", { name: /switch to light theme/i }));

    expect(document.documentElement.dataset.theme).toBe("light");
    expect(JSON.parse(localStorage.getItem("tweet-analyzer:theme"))).toBe("light");
    expect(screen.getByRole("button", { name: /switch to dark theme/i })).toBeInTheDocument();
  });

  it("copies the example API request", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /copy request/i }));

    expect(writeText).toHaveBeenCalledWith(expect.stringContaining("curl -X POST"));
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });
});
