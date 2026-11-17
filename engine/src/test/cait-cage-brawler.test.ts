import { describe, expect, it } from "vitest";
import type { ObjectId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { B, attack, counters, keywords, nextTurn, spawn, table, toLibrary, zone } from "./harness.js";

/**
 * Cait, Cage Brawler: "Whenever Cait attacks, you and defending player each
 * draw a card, then discard a card. Put two +1/+1 counters on Cait if you
 * discarded the card with the greatest mana value among those cards or tied
 * for greatest." — no engine code: a `draw` and a `discard` of `{ youAnd:
 * "trigger-player" }`, then Scythe Specter's comparison over what was
 * discarded this way.
 */

function attackWith(alicesDraw: string, bobsDraw: string): { game: ReturnType<typeof table>["game"]; cait: ObjectId; drawn: [ObjectId, ObjectId] } {
  const { game, a, b } = table();
  const cait = spawn(game, "Cait, Cage Brawler");
  const mine = toLibrary(game, alicesDraw);
  const theirs = toLibrary(game, bobsDraw, B);
  // Each discards the card they drew.
  a.chooseDiscardsFn = () => [mine];
  b.chooseDiscardsFn = () => [theirs];
  attack(game, a, [cait]);
  return { game, cait, drawn: [mine, theirs] };
}

describe("Cait, Cage Brawler", () => {
  it("you discarded the greater mana value: two +1/+1 counters", () => {
    const { game, cait, drawn } = attackWith("Thragtusk", "Llanowar Elves");
    expect(zone(game, drawn[0])).toBe("graveyard");
    expect(zone(game, drawn[1])).toBe("graveyard");
    expect(counters(game, cait)).toBe(2);
  });

  it("defending player discarded the greater mana value: no counters", () => {
    const { game, cait, drawn } = attackWith("Llanowar Elves", "Thragtusk");
    expect(zone(game, drawn[0])).toBe("graveyard");
    expect(zone(game, drawn[1])).toBe("graveyard");
    expect(counters(game, cait)).toBe(0);
  });

  it("tied for greatest: two +1/+1 counters", () => {
    const { game, cait } = attackWith("Grizzly Bears", "Grizzly Bears");
    expect(counters(game, cait)).toBe(2);
  });

  it("has indestructible during your turn only", () => {
    const { game } = table();
    const cait = spawn(game, "Cait, Cage Brawler");
    expect(keywords(game, cait).has("indestructible")).toBe(true);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    expect(keywords(game, cait).has("indestructible")).toBe(false);
  });
});
