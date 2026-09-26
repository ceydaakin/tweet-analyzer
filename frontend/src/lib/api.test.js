import { saveAnalysis } from "./api";

const analysis = { username: "@a", content: "c", sentiment: "Neutral", summary: "s", datetime: "2026-01-01T00:00:00.000Z" };
const jsonResponse = (body, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

describe("saveAnalysis", () => {
  it("POSTs the analysis as JSON to /api/analyze", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ success: true, data: analysis, error: null }, 201));

    await expect(saveAnalysis(analysis, fetchImpl)).resolves.toEqual(analysis);

    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe("/api/analyze");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual(analysis);
  });

  it("throws the server's error message on failure", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(jsonResponse({ success: false, data: null, error: "bad input" }, 400));

    await expect(saveAnalysis(analysis, fetchImpl)).rejects.toThrow("bad input");
  });

  it("throws a status-based error when the body is not JSON", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response("oops", { status: 500 }));

    await expect(saveAnalysis(analysis, fetchImpl)).rejects.toThrow("status 500");
  });
});
