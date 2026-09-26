import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseTweetUrl, createTweetFetcher } from "../src/tweets.js";

describe("parseTweetUrl", () => {
  it("accepts x.com, twitter.com and mobile URLs", () => {
    for (const url of [
      "https://x.com/jack/status/20",
      "https://twitter.com/jack/status/20?s=21",
      "https://mobile.twitter.com/jack/status/20/photo/1",
      "http://www.x.com/jack/statuses/20",
    ]) {
      assert.deepEqual(parseTweetUrl(url), { handle: "jack", id: "20" }, url);
    }
  });

  it("rejects non-tweet URLs", () => {
    for (const url of [
      "not a url",
      "https://x.com/jack",
      "https://evil.com/jack/status/20",
      "https://x.com.evil.com/jack/status/20",
      "ftp://x.com/jack/status/20",
      "https://x.com/jack/status/abc",
    ]) {
      assert.equal(parseTweetUrl(url), null, url);
    }
  });
});

describe("createTweetFetcher", () => {
  const okBody = {
    code: 200,
    tweet: {
      text: "just setting up my twttr",
      created_at: "Tue Mar 21 20:50:14 +0000 2006",
      author: { screen_name: "jack" },
    },
  };

  it("fetches the tweet text and author", async () => {
    const calls = [];
    const fetchTweet = createTweetFetcher(async (url) => {
      calls.push(url);
      return Response.json(okBody);
    });

    const tweet = await fetchTweet("https://x.com/jack/status/20");

    assert.equal(calls[0], "https://api.fxtwitter.com/jack/status/20");
    assert.deepEqual(tweet, { username: "@jack", content: "just setting up my twttr" });
  });

  it("throws a 404 AppError when the tweet does not exist", async () => {
    const fetchTweet = createTweetFetcher(async () =>
      Response.json({ code: 404, tweet: null }, { status: 404 }),
    );

    await assert.rejects(fetchTweet("https://x.com/jack/status/1"), {
      status: 404,
      message: /could not find that tweet/i,
    });
  });

  it("throws a 502 AppError when the tweet service is down", async () => {
    const fetchTweet = createTweetFetcher(async () => new Response("oops", { status: 500 }));

    await assert.rejects(fetchTweet("https://x.com/jack/status/20"), {
      status: 502,
      message: /paste the tweet text/i,
    });
  });

  it("throws a 502 AppError on network failure", async () => {
    const fetchTweet = createTweetFetcher(async () => {
      throw new TypeError("fetch failed");
    });

    await assert.rejects(fetchTweet("https://x.com/jack/status/20"), { status: 502 });
  });

  it("throws a 422 AppError when the tweet has no text", async () => {
    const fetchTweet = createTweetFetcher(async () =>
      Response.json({ code: 200, tweet: { text: "", author: { screen_name: "jack" } } }),
    );

    await assert.rejects(fetchTweet("https://x.com/jack/status/20"), { status: 422 });
  });
});
