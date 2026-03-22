import { calcReadTime } from "@/lib/cms/read-time"

describe("calcReadTime", () => {
  test("returns 1 for null/undefined content", () => {
    expect(calcReadTime(null)).toBe(1)
    expect(calcReadTime(undefined)).toBe(1)
  })

  test("returns 1 for empty content", () => {
    expect(calcReadTime({ root: { children: [] } })).toBe(1)
  })

  test("calculates 1 minute for 100 words", () => {
    const words = Array(100).fill("fish").join(" ")
    const content = {
      root: {
        children: [{ type: "text", text: words }],
      },
    }
    expect(calcReadTime(content)).toBe(1)
  })

  test("calculates 2 minutes for 300 words", () => {
    const words = Array(300).fill("crap").join(" ")
    const content = {
      root: {
        children: [{ type: "text", text: words }],
      },
    }
    expect(calcReadTime(content)).toBe(2)
  })

  test("walks nested children", () => {
    const content = {
      root: {
        children: [
          {
            type: "paragraph",
            children: [
              { type: "text", text: "one two three" },
            ],
          },
        ],
      },
    }
    expect(calcReadTime(content)).toBe(1)
  })
})
