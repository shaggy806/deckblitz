/**
 * `separate-into-piles` into three piles, one chosen at random — Whims of the
 * Fates: "Starting with you, each player separates all permanents they
 * control into three piles. Then each player chooses one of their piles at
 * random and sacrifices those permanents. (Piles can be empty.)" The
 * `pileCount`, `atRandom` and `startingWithYou` of the `each` shape (rules
 * 700.3a, 700.3d; the rulings: each pile equally likely).
 */
import { describe, expect, it } from "vitest";

import type { SeparatePilesOffer } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { A, B, C, cast, lands, spawn, table, toHand, zone } from "./harness.js";

/** The pile each `pile-chosen` event names, by its player. */
const randomPicks = (game: Game): { player: PlayerId; pile: number; objects: readonly ObjectId[] }[] =>
  game.state.eventLog.flatMap((e) =>
    e.type === "pile-chosen" && e.atRandom === true ? [{ player: e.player, pile: e.pile, objects: e.objects }] : [],
  );

describe("Whims of the Fates", () => {
  it("each player makes three piles, one of each is picked at random, and those are sacrificed together", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 6);
    const bears = spawn(game, "Grizzly Bears", A);
    const elves = spawn(game, "Llanowar Elves", A);
    const giant = spawn(game, "Hill Giant", B);
    const angel = spawn(game, "Serra Angel", B);
    const island = spawn(game, "Island", B);
    const order: string[] = [];
    let mine: readonly (readonly ObjectId[])[] = [];
    let theirs: readonly (readonly ObjectId[])[] = [];
    a.separatePilesFn = (_view, offer: SeparatePilesOffer) => {
      order.push("a");
      expect(offer.pileCount).toBe(3);
      expect(offer.atRandom).toBe(true);
      expect(offer.chooser).toBe(A);
      expect(offer.fates).toEqual({ chosen: "lose" });
      // Mana spent on the spell: the Mountains are alice's permanents too.
      expect(offer.objects).toEqual(expect.arrayContaining([bears, elves]));
      const rest = offer.objects.filter((id) => id !== bears && id !== elves);
      mine = [[bears], [elves], rest];
      return mine;
    };
    b.separatePilesFn = (_view, offer) => {
      order.push("b");
      expect([...offer.objects].sort()).toEqual([giant, angel, island].sort());
      expect(offer.chooser).toBe(B);
      theirs = [[giant, angel], [], [island]];
      return theirs;
    };
    b.choosePileFn = () => {
      throw new Error("nobody chooses: it's at random");
    };
    cast(game, toHand(game, "Whims of the Fates"));
    expect(order).toEqual(["a", "b"]);
    const picks = randomPicks(game);
    expect(picks.map((p) => p.player)).toEqual([A, B]);
    for (const [player, piles] of [
      [A, mine],
      [B, theirs],
    ] as const) {
      const pick = picks.find((p) => p.player === player);
      expect(pick).toBeDefined();
      const pile = piles[pick?.pile ?? -1];
      expect(pick?.objects).toEqual(pile);
      // That pile is gone, the other two stay.
      for (const id of pile) expect(zone(game, id)).toBe("graveyard");
      for (const id of piles.flatMap((p, i) => (i === pick?.pile ? [] : p))) expect(zone(game, id)).toBe("battlefield");
    }
  });

  it("refuses two piles: it must be three, any of them empty", () => {
    const { game, b } = table();
    lands(game, "Mountain", 6);
    const giant = spawn(game, "Hill Giant", B);
    const angel = spawn(game, "Serra Angel", B);
    b.separatePilesFn = () => {
      throw new Error("asked");
    };
    cast(game, toHand(game, "Whims of the Fates"), { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "separate-piles" && s.awaiting.player === B);
    expect(game.canDispatch({ type: "separate-piles", player: B, piles: [[giant], [angel]] })).toMatch(/3 piles/);
    expect(game.canDispatch({ type: "separate-piles", player: B, piles: [[], [], [giant, angel]] })).toBeNull();
  });

  it("all in one pile: each pile equally likely, so everything or nothing goes", () => {
    const counts = [0, 0, 0];
    for (let seed = 1; seed <= 24; seed += 1) {
      const { game, a, b } = table({ seed });
      lands(game, "Mountain", 6);
      const giant = spawn(game, "Hill Giant", B);
      const angel = spawn(game, "Serra Angel", B);
      a.separatePilesFn = (_view, offer) => [[], [], [...offer.objects]];
      b.separatePilesFn = (_view, offer) => [[...offer.objects], [], []];
      cast(game, toHand(game, "Whims of the Fates"));
      const pick = randomPicks(game).find((p) => p.player === B);
      counts[pick?.pile ?? 0] += 1;
      const gone = pick?.pile === 0;
      expect(zone(game, giant)).toBe(gone ? "graveyard" : "battlefield");
      expect(zone(game, angel)).toBe(gone ? "graveyard" : "battlefield");
    }
    // Every pile, empty ones included, comes up.
    expect(counts.every((n) => n > 0)).toBe(true);
  });

  it("starting with you: cast on another player's turn, the caster separates first, then turn order from them", () => {
    const { game, a, b, c } = table({ players: 3 });
    spawn(game, "Vedalken Orrery", B);
    lands(game, "Mountain", 6, B);
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Llanowar Elves", C);
    const order: PlayerId[] = [];
    for (const [seat, player] of [
      [a, A],
      [b, B],
      [c, C],
    ] as const) {
      seat.separatePilesFn = (_view, offer) => {
        order.push(player);
        return [[], [], [...offer.objects]];
      };
    }
    const whims = toHand(game, "Whims of the Fates", B);
    game.advanceUntil((s) => activePlayerOf(s) === A && s.priority.holder === B);
    cast(game, whims, { player: B });
    expect(order).toEqual([B, C, A]);
  });

  it("a player who controls nothing isn't asked, and nothing is picked for them", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 6);
    a.separatePilesFn = (_view, offer) => [[], [], [...offer.objects]];
    b.separatePilesFn = () => {
      throw new Error("bob has nothing to separate");
    };
    cast(game, toHand(game, "Whims of the Fates"));
    expect(randomPicks(game).map((p) => p.player)).toEqual([A]);
  });

  it("the bots split evenly into three", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const mine = ["Grizzly Bears", "Llanowar Elves", "Hill Giant"].map((name) => spawn(game, name, B));
    cast(game, toHand(game, "Whims of the Fates"));
    // An even split loses one of the three, never all.
    const left = mine.filter((id) => zone(game, id) === "battlefield");
    expect(left.length).toBe(2);
  });
});
