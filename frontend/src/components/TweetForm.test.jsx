import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TweetForm from "./TweetForm";
import { analyzeTweet } from "../lib/api";
import { sampleResult } from "../test/fixtures";

vi.mock("../lib/api", () => ({ analyzeTweet: vi.fn() }));

const TWEET_URL = "https://x.com/jack/status/20";
const submit = () => userEvent.click(screen.getByRole("button", { name: /analyze tweet/i }));

describe("TweetForm", () => {
  beforeEach(() => {
    vi.mocked(analyzeTweet).mockReset();
  });

  it("asks for a URL or text when submitted empty", async () => {
    render(<TweetForm />);

    await submit();

    expect(screen.getByRole("alert")).toHaveTextContent("Enter a tweet URL or paste the tweet text");
    expect(analyzeTweet).not.toHaveBeenCalled();
  });

  it("analyzes a URL, shows Claude's result and reports it to the parent", async () => {
    vi.mocked(analyzeTweet).mockResolvedValue(sampleResult);
    const onAnalysisComplete = vi.fn();
    render(<TweetForm onAnalysisComplete={onAnalysisComplete} />);

    await userEvent.type(screen.getByLabelText("Tweet URL"), TWEET_URL);
    await submit();

    expect(await screen.findByRole("heading", { name: "Analysis Results" })).toBeInTheDocument();
    expect(analyzeTweet).toHaveBeenCalledWith({ url: TWEET_URL, text: undefined });
    expect(screen.getByText(sampleResult.summary)).toBeInTheDocument();
    expect(screen.getByText(sampleResult.content)).toBeInTheDocument();
    expect(screen.getByText("Saved to Airtable")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view post/i })).toHaveAttribute("href", sampleResult.url);
    expect(onAnalysisComplete).toHaveBeenCalledWith(sampleResult);
    expect(screen.getByLabelText("Tweet URL")).toHaveValue("");
  });

  it("reveals the text field and sends pasted text", async () => {
    vi.mocked(analyzeTweet).mockResolvedValue({ ...sampleResult, saved: false, url: null });
    render(<TweetForm />);

    expect(screen.queryByLabelText(/tweet text/i)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /paste the text instead/i }));
    await userEvent.type(screen.getByLabelText(/tweet text/i), "  Great game tonight!  ");
    await submit();

    await screen.findByRole("heading", { name: "Analysis Results" });
    expect(analyzeTweet).toHaveBeenCalledWith({ url: undefined, text: "Great game tonight!" });
    expect(screen.queryByText("Saved to Airtable")).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /view post/i })).not.toBeInTheDocument();
  });

  it("shows a loading state while waiting", async () => {
    let resolve;
    vi.mocked(analyzeTweet).mockReturnValue(new Promise((r) => (resolve = r)));
    render(<TweetForm />);

    await userEvent.type(screen.getByLabelText("Tweet URL"), TWEET_URL);
    await submit();

    expect(screen.getByRole("status")).toHaveTextContent(/claude is reading/i);
    expect(screen.getByRole("button", { name: /analyzing/i })).toBeDisabled();
    resolve(sampleResult);
    await screen.findByRole("heading", { name: "Analysis Results" });
  });

  it("shows the server's error message when analysis fails", async () => {
    vi.mocked(analyzeTweet).mockRejectedValue(new Error("Could not find that tweet."));
    render(<TweetForm />);

    await userEvent.type(screen.getByLabelText("Tweet URL"), TWEET_URL);
    await submit();

    expect(await screen.findByRole("alert")).toHaveTextContent("Could not find that tweet.");
    expect(screen.queryByRole("heading", { name: "Analysis Results" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Tweet URL")).toHaveValue(TWEET_URL);
  });
});
