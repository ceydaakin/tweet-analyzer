import { analyzeTweet, SAMPLE_TWEET_CONTENT } from "./analyze";

describe("analyzeTweet", () => {
  const now = new Date("2026-01-01T10:00:00.000Z");

  it("marks content containing 'great' as Positive", () => {
    expect(analyzeTweet("What a GREAT day", now).sentiment).toBe("Positive");
  });

  it("marks other content as Neutral", () => {
    expect(analyzeTweet("It is Tuesday", now).sentiment).toBe("Neutral");
  });

  it("truncates long content into the summary", () => {
    const { summary } = analyzeTweet(SAMPLE_TWEET_CONTENT, now);
    expect(summary).toBe(`${SAMPLE_TWEET_CONTENT.slice(0, 50)}...`);
  });

  it("keeps short content as-is", () => {
    expect(analyzeTweet("Short", now).summary).toBe("Short");
  });

  it("stamps the analysis time and username", () => {
    expect(analyzeTweet("x", now)).toMatchObject({
      datetime: "2026-01-01T10:00:00.000Z",
      username: "@dummy_user",
    });
  });
});
