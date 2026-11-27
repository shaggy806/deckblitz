/**
 * `choose-random-card` with `count` and `show: "reveal"`: X different cards
 * picked at random from a hand and revealed together (rule 701.20a), a
 * `for-each-target` `only` then reading them — Nebuchadnezzar's "target
 * opponent reveals X cards at random from their hand. Then that player
 * discards all cards with that name revealed this way."
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { B, activate, lands, ref, spawn, table, toHand, zone } from "./harness.js";

const reveals = (game: Game): number[] =>
  game.state.eventLog.flatMap((e) => (e.type === "cards-revealed" && e.from === "hand" ? [e.objects.length] : []));

function setup(): { game: Game; a: ReturnType<typeof table>["a"]; neb: ReturnType<typeof spawn>; shocks: ObjectId[]; div: ObjectId } {
  const { game, a } = table({ openingHandSize: 0 });
  const neb = spawn(game, "Nebuchadnezzar");
  lands(game, "Island", 4);
  const shocks = [toHand(game, "Shock", B), toHand(game, "Shock", B), toHand(game, "Shock", B)];
  const div = toHand(game, "Divination", B);
  return { game, a, neb, shocks, div };
}

describe("Nebuchadnezzar", () => {
  it("with X covering the hand, reveals it all and discards every card of the name", () => {
    const { game, a, neb, shocks, div } = setup();
    a.chooseCardNameFn = () => "Shock";
    activate(game, neb, 0, { targets: [ref(B)], x: 4 });
    expect(shocks.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard", "graveyard"]);
    expect(zone(game, div)).toBe("hand");
    expect(reveals(game)).toEqual([4]);
  });

  it("reveals exactly X cards together, and discards only named ones among them", () => {
    const { game, a, neb, shocks, div } = setup();
    a.chooseCardNameFn = () => "Shock";
    activate(game, neb, 0, { targets: [ref(B)], x: 2 });
    expect(reveals(game)).toEqual([2]);
    const discarded = shocks.filter((id) => zone(game, id) === "graveyard").length;
    expect(discarded).toBeGreaterThanOrEqual(1); // two of four, at most one is the Divination
    expect(discarded).toBeLessThanOrEqual(2);
    expect(zone(game, div)).toBe("hand");
  });

  it("with X = 0, reveals nothing and discards nothing", () => {
    const { game, a, neb, shocks } = setup();
    a.chooseCardNameFn = () => "Shock";
    activate(game, neb, 0, { targets: [ref(B)], x: 0 });
    expect(reveals(game)).toEqual([]);
    expect(shocks.every((id) => zone(game, id) === "hand")).toBe(true);
  });
});
