import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TweetForm from "./TweetForm";
import { saveAnalysis } from "../lib/api";

vi.mock("../lib/api", () => ({ saveAnalysis: vi.fn() }));

describe("TweetForm", () => {
  beforeEach(() => {
    vi.mocked(saveAnalysis).mockReset();
  });

  it("asks for a URL when submitted empty", async () => {
    render(<TweetForm />);

    await userEvent.click(screen.getByRole("button", { name: /analyze tweet/i }));

    expect(screen.getByText("Please enter a tweet URL")).toBeInTheDocument();
    expect(saveAnalysis).not.toHaveBeenCalled();
  });

  it("saves the analysis, shows results and reports it to the parent", async () => {
    vi.mocked(saveAnalysis).mockResolvedValue({});
    const onAnalysisComplete = vi.fn();
    render(<TweetForm onAnalysisComplete={onAnalysisComplete} />);

    await userEvent.type(screen.getByLabelText("Tweet URL"), "https://x.com/a/status/1");
    await userEvent.click(screen.getByRole("button", { name: /analyze tweet/i }));

    expect(await screen.findByText(/analysis complete/i)).toBeInTheDocument();
    expect(screen.getByText("Analysis Results")).toBeInTheDocument();
    expect(saveAnalysis).toHaveBeenCalledWith(expect.objectContaining({ sentiment: "Positive", username: "@dummy_user" }));
    expect(onAnalysisComplete).toHaveBeenCalledOnce();
    expect(screen.getByLabelText("Tweet URL")).toHaveValue("");
  });

  it("shows an error when saving fails", async () => {
    vi.mocked(saveAnalysis).mockRejectedValue(new Error("network down"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<TweetForm />);

    await userEvent.type(screen.getByLabelText("Tweet URL"), "https://x.com/a/status/1");
    await userEvent.click(screen.getByRole("button", { name: /analyze tweet/i }));

    expect(await screen.findByText(/failed to save analysis/i)).toBeInTheDocument();
    expect(screen.queryByText("Analysis Results")).not.toBeInTheDocument();
  });
});
