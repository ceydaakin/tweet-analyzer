import { analyzeTweet } from "./api";

const result = {
  username: "@jack",
  content: "just setting up my twttr",
  sentiment: "Neutral",
  summary: "Jack is setting up his account.",
  datetime: "2026-01-01T00:00:00.000Z",
  url: "https://x.com/jack/status/20",
  saved: true,
};
const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

describe("analyzeTweet", () => {
  it("POSTs the url and text as JSON to /api/analyze", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ success: true, data: result, error: null }));

    await expect(analyzeTweet({ url: result.url, text: "hi" }, fetchImpl)).resolves.toEqual(result);

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("/api/analyze");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ url: result.url, text: "hi" });
  });

  it("throws the server's error message on failure", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse({ success: false, data: null, error: "Could not find that tweet." }, 404),
    );

    await expect(analyzeTweet({ url: "x" }, fetchImpl)).rejects.toThrow("Could not find that tweet.");
  });

  it("throws a status-based error when the body is not JSON", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("oops", { status: 500 }));

    await expect(analyzeTweet({ url: "x" }, fetchImpl)).rejects.toThrow("status 500");
  });

  it("explains when the server is unreachable", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(analyzeTweet({ url: "x" }, fetchImpl)).rejects.toThrow(/backend running/);
  });

  it("explains a timeout", async () => {
    const timeout = new DOMException("timed out", "TimeoutError");
    const fetchImpl = vi.fn().mockRejectedValue(timeout);

    await expect(analyzeTweet({ url: "x" }, fetchImpl)).rejects.toThrow(/took too long/);
  });
});
