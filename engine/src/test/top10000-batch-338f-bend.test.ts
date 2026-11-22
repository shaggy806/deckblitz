/**
 * B338 (author-top-cards overnight), decisions lane, agent f: Bend or Break —
 * `separate-into-piles`' `each` with `chooser: "an-opponent"`: every player
 * separates, then each names one of their own opponents, who chooses one of
 * their piles; then the chosen piles are destroyed at once and the others
 * tapped.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, cast, lands, table, toHand, zone } from "./harness.js";

const tapped = (game: ReturnType<typeof table>["game"], id: string): boolean =>
  game.state.objects[id as keyof typeof game.state.objects]?.tapped === true;

describe("Bend or Break", () => {
  it("each player names one of their opponents to choose their pile; chosen piles destroyed, the rest tapped", () => {
    const { game, a, b, c } = table({ players: 3 });
    const aLands = lands(game, "Mountain", 4);
    const bLands = lands(game, "Island", 2, B);
    const cLands = lands(game, "Forest", 2, C);
    const order: string[] = [];
    a.separatePilesFn = (_view, offer) => {
      order.push("a separates");
      // Two opponents: which one chooses isn't known yet.
      expect(offer.anOpponentChooses).toBe(true);
      return [[aLands[0], aLands[1]], [aLands[2], aLands[3]]];
    };
    b.separatePilesFn = () => {
      order.push("b separates");
      return [[bLands[0]], [bLands[1]]];
    };
    c.separatePilesFn = () => {
      order.push("c separates");
      return [[cLands[0], cLands[1]], []];
    };
    const named: Record<string, string> = { alice: "carol", bob: "alice", carol: "bob" };
    const modeChooser = (who: string) => (_view: unknown, _min: number, _max: number, texts: readonly string[]) => {
      order.push(`${who} names`);
      const at = texts.findIndex((text) => text.includes(named[who]));
      expect(at).toBeGreaterThanOrEqual(0);
      return [at];
    };
    a.chooseModesFn = modeChooser("alice");
    b.chooseModesFn = modeChooser("bob");
    c.chooseModesFn = modeChooser("carol");
    const pileChooser = (who: string) => (_view: unknown, offer: { separator: string }) => {
      order.push(`${who} chooses ${offer.separator}'s`);
      // Nothing is destroyed while a choice is still to make.
      for (const id of [...aLands, ...bLands, ...cLands]) expect(zone(game, id)).toBe("battlefield");
      return 0;
    };
    a.choosePileFn = pileChooser("alice");
    b.choosePileFn = pileChooser("bob");
    c.choosePileFn = pileChooser("carol");
    cast(game, toHand(game, "Bend or Break"));
    expect(order).toEqual([
      "a separates",
      "b separates",
      "c separates",
      "alice names",
      `carol chooses ${A}'s`,
      "bob names",
      `alice chooses ${B}'s`,
      "carol names",
      `bob chooses ${C}'s`,
    ]);
    expect(aLands.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard", "battlefield", "battlefield"]);
    expect(zone(game, bLands[0])).toBe("graveyard");
    expect(zone(game, bLands[1])).toBe("battlefield");
    expect(tapped(game, bLands[1])).toBe(true);
    expect(cLands.map((id) => zone(game, id))).toEqual(["graveyard", "graveyard"]);
    // One destruction event for every chosen pile.
    const destroyed = game.state.eventLog.filter((e) => e.type === "permanent-destroyed");
    expect(destroyed.length).toBe(5);
  });

  it("at two players the one opponent chooses and nobody names", () => {
    const { game, a, b } = table();
    const aLands = lands(game, "Mountain", 4);
    const bLands = lands(game, "Island", 2, B);
    a.chooseModesFn = () => {
      throw new Error("nobody names an opponent at two players");
    };
    let offered: readonly string[] = [];
    a.separatePilesFn = (_view, offer) => {
      offered = offer.objects;
      expect(offer.chooser).toBe(B);
      return [[aLands[0]], aLands.slice(1)];
    };
    b.separatePilesFn = () => [bLands, []];
    b.choosePileFn = () => 1;
    a.choosePileFn = () => 1;
    cast(game, toHand(game, "Bend or Break"));
    expect([...offered].sort()).toEqual([...aLands].sort());
    expect(zone(game, aLands[0])).toBe("battlefield");
    expect(aLands.slice(1).map((id) => zone(game, id))).toEqual(["graveyard", "graveyard", "graveyard"]);
    // B's chosen pile was the empty one: both Islands tapped, none destroyed.
    expect(bLands.map((id) => zone(game, id))).toEqual(["battlefield", "battlefield"]);
    expect(bLands.every((id) => tapped(game, id))).toBe(true);
    expect(game.state.objects[aLands[0]].owner).toBe(A);
  });
});
