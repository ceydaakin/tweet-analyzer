import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TweetForm from "./TweetForm";
import { analyzeTweet } from "../lib/api";
import { sampleResult } from "../test/fixtures";

vi.mock("../lib/api", () => ({ analyzeTweet: vi.fn() }));

const TWEET_URL = "https://x.com/jack/status/20";

describe("TweetForm", () => {
  beforeEach(() => {
    vi.mocked(analyzeTweet).mockReset();
  });

  it("asks for a URL or text when submitted empty", async () => {
    render(<TweetForm />);

    await userEvent.click(screen.getByRole("button", { name: /analyze tweet/i }));

    expect(screen.getByText("Enter a tweet URL or paste the tweet text")).toBeInTheDocument();
    expect(analyzeTweet).not.toHaveBeenCalled();
  });

  it("analyzes a URL, shows Claude's results and reports them to the parent", async () => {
    vi.mocked(analyzeTweet).mockResolvedValue(sampleResult);
    const onAnalysisComplete = vi.fn();
    render(<TweetForm onAnalysisComplete={onAnalysisComplete} />);

    await userEvent.type(screen.getByLabelText("Tweet URL"), TWEET_URL);
    await userEvent.click(screen.getByRole("button", { name: /analyze tweet/i }));

    expect(await screen.findByText("Analysis complete! Saved to Airtable.")).toBeInTheDocument();
    expect(analyzeTweet).toHaveBeenCalledWith({ url: TWEET_URL, text: undefined });
    expect(screen.getByText(sampleResult.summary)).toBeInTheDocument();
    expect(screen.getByText(sampleResult.content)).toBeInTheDocument();
    expect(screen.getByText("@jack")).toBeInTheDocument();
    expect(onAnalysisComplete).toHaveBeenCalledWith(sampleResult);
    expect(screen.getByLabelText("Tweet URL")).toHaveValue("");
  });

  it("sends pasted text and omits the save note when not saved", async () => {
    vi.mocked(analyzeTweet).mockResolvedValue({ ...sampleResult, saved: false });
    render(<TweetForm />);

    await userEvent.type(screen.getByLabelText(/tweet text/i), "  Great game tonight!  ");
    await userEvent.click(screen.getByRole("button", { name: /analyze tweet/i }));

    expect(await screen.findByText("Analysis complete!")).toBeInTheDocument();
    expect(analyzeTweet).toHaveBeenCalledWith({ url: undefined, text: "Great game tonight!" });
    expect(screen.getByLabelText(/tweet text/i)).toHaveValue("");
  });

  it("shows the server's error message when analysis fails", async () => {
    vi.mocked(analyzeTweet).mockRejectedValue(new Error("Could not find that tweet."));
    render(<TweetForm />);

    await userEvent.type(screen.getByLabelText("Tweet URL"), TWEET_URL);
    await userEvent.click(screen.getByRole("button", { name: /analyze tweet/i }));

    expect(await screen.findByText("Could not find that tweet.")).toBeInTheDocument();
    expect(screen.queryByText("Analysis Results")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Tweet URL")).toHaveValue(TWEET_URL);
  });
});
