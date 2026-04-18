/**
 * Generic FunCode quest test runner — identical across ALL quests.
 *
 * It reads `cases.json` and calls `solution(input)` for each case,
 * asserting against `expectedOutput`.
 *
 * Never edit this file. To add / change test cases, edit `cases.json`.
 */
import { describe, it, expect } from "vitest";
import cases from "./cases.json";
import { solution } from "../src/index";

describe("Quest", () => {
  cases.forEach(({ description, input, expectedOutput }) => {
    it(description, () => {
      expect(solution(input)).toEqual(expectedOutput);
    });
  });
});
