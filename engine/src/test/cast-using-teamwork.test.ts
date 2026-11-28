/**
 * "Whenever you cast a spell using teamwork" (Virtual Assistant): the
 * `castUsing` filter, a spell whose teamwork cost was paid as it was cast
 * (rule 702.194b). Written from the Oracle text.
 */
import { describe, expect, it } from "vitest";

import { cast, lands, spawn, table, toHand, tokensNamed } from "./harness.js";

const ROBOT = "1/1 Robot Hero Token";

describe("Virtual Assistant", () => {
  it("makes a Robot Hero when you cast a spell using teamwork", () => {
    const { game } = table();
    spawn(game, "Virtual Assistant");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Island", 8);
    cast(game, toHand(game, "Timeline Inquiry"), { kicked: true, tap: [bears] });
    expect(tokensNamed(game, ROBOT)).toBe(1);
  });

  it("makes none for the same spell cast without its teamwork cost", () => {
    const { game } = table();
    spawn(game, "Virtual Assistant");
    spawn(game, "Grizzly Bears");
    lands(game, "Island", 8);
    cast(game, toHand(game, "Timeline Inquiry"));
    expect(tokensNamed(game, ROBOT)).toBe(0);
  });

  it("makes none for a spell kicked with an ordinary kicker", () => {
    const { game } = table();
    spawn(game, "Virtual Assistant");
    lands(game, "Island", 4);
    cast(game, toHand(game, "Roost of Drakes"), { kicked: true });
    expect(tokensNamed(game, "Drake Token")).toBe(1);
    expect(tokensNamed(game, ROBOT)).toBe(0);
  });
});
