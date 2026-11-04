/**
 * Seize the Spotlight: "each opponent chooses fame or fortune" (a `choose`
 * vote, rule 101.4, not a vote under 701.38), each fame a creature of that
 * player's, chosen as it resolves, stolen until end of turn; each fortune a
 * card and a Treasure.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  D,
  cast,
  controller,
  hand,
  keywords,
  lands,
  nextTurn,
  spawn,
  table,
  toHand,
  tokensNamed,
} from "./harness.js";

const FAME = 0;
const FORTUNE = 1;

function seize(players: 2 | 4) {
  const t = table({ players, deck: "Mountain" });
  lands(t.game, "Mountain", 3);
  const spell = toHand(t.game, "Seize the Spotlight");
  return { ...t, spell };
}

describe("Seize the Spotlight", () => {
  it("each opponent answers on its own, and each answer is read for that player", () => {
    const { game, a, b, c, d, spell } = seize(4);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    const otherBears = spawn(game, "Hill Giant", B);
    const carols = spawn(game, "Grizzly Bears", C);
    const daves = spawn(game, "Serra Angel", D, { tapped: true });
    b.chooseModesFn = () => [FAME];
    c.chooseModesFn = () => [FORTUNE];
    d.chooseModesFn = () => [FAME];
    const offers: (readonly ObjectId[])[] = [];
    a.choosePermanentsFn = (_view, eligible) => {
      offers.push(eligible);
      return [eligible.includes(bears) ? bears : daves];
    };
    const handBefore = hand(game, A).length;
    cast(game, spell);

    // Asked once for each fame, among that player's creatures alone.
    expect(offers).toHaveLength(2);
    expect([...offers[0]].sort()).toEqual([bears, otherBears].sort());
    expect(offers[1]).toEqual([daves]);

    for (const stolen of [bears, daves]) {
      expect(controller(game, stolen)).toBe(A);
      expect(game.state.objects[stolen].tapped).toBe(false);
      expect(keywords(game, stolen).has("haste")).toBe(true);
    }
    expect(controller(game, otherBears)).toBe(B);
    expect(controller(game, carols)).toBe(C);

    // Carol's fortune is one card and one Treasure, for the caster alone.
    expect(hand(game, A).length).toBe(handBefore - 1 + 1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(tokensNamed(game, "Treasure Token", C)).toBe(0);
  });

  it("fame gives the creature back at end of turn, and haste goes with it", () => {
    const { game, a, b, spell } = seize(2);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    b.chooseModesFn = () => [FAME];
    a.choosePermanentsFn = (_view, eligible) => [eligible[0]];
    cast(game, spell);
    expect(controller(game, bears)).toBe(A);
    nextTurn(game);
    expect(controller(game, bears)).toBe(B);
    expect(keywords(game, bears).has("haste")).toBe(false);
  });

  it("a creature with hexproof can be chosen: it isn't targeted", () => {
    const { game, a, b, spell } = seize(2);
    const troll = spawn(game, "Gladecover Scout", B);
    b.chooseModesFn = () => [FAME];
    a.choosePermanentsFn = (_view, eligible) => [eligible[0]];
    cast(game, spell);
    expect(controller(game, troll)).toBe(A);
  });

  it("fame against a player with no creatures does nothing, and nobody is asked", () => {
    const { game, a, b, spell } = seize(2);
    b.chooseModesFn = () => [FAME];
    let asked = 0;
    a.choosePermanentsFn = () => {
      asked += 1;
      return [];
    };
    const handBefore = hand(game, A).length;
    cast(game, spell);
    expect(asked).toBe(0);
    expect(hand(game, A).length).toBe(handBefore - 1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });

  it("fortune from every opponent is that many cards and Treasures", () => {
    const { game, b, c, d, spell } = seize(4);
    for (const seat of [b, c, d]) seat.chooseModesFn = () => [FORTUNE];
    const handBefore = hand(game, A).length;
    cast(game, spell);
    expect(hand(game, A).length).toBe(handBefore - 1 + 3);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(3);
  });

  it("isn't a vote: \"whenever players finish voting\" doesn't see it (rule 701.38)", () => {
    const { game, b, spell } = seize(2);
    spawn(game, "Erestor of the Council");
    const handBefore = hand(game, A).length;
    b.chooseModesFn = () => [FORTUNE];
    cast(game, spell);
    // Only the spell's own card: Erestor's trigger would draw another.
    expect(hand(game, A).length).toBe(handBefore - 1 + 1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    const finished = game.state.eventLog.find((e) => e.type === "votes-finished");
    expect(finished?.type === "votes-finished" && finished.choice).toBe(true);
  });
});
