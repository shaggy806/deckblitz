/**
 * "Destroy X target artifacts and/or creatures. For each permanent destroyed
 * this way, its controller reveals cards from the top of their library until
 * an artifact or creature card is revealed and exiles that card. Those
 * players put the exiled cards onto the battlefield, then shuffle." —
 * Indomitable Creativity: `reveal-until-count`'s `exile: "found"` (only the
 * card found is exiled, the rest stay revealed in the library) inside a
 * `for-each-player` of `choicesHeld`, every player's finds entering together
 * and then each of those libraries shuffled. Written from the Oracle text and
 * its rulings.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, cast, controller, grant, lands, ref, spawn, table, toHand, toLibrary, zone } from "./harness.js";

const library = (game: Game, player: PlayerId): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
const shuffled = (game: Game, since: number): PlayerId[] =>
  game.state.eventLog.filter((e) => e.seq >= since && e.type === "library-shuffled").map((e) => (e as { player: PlayerId }).player);
const seqNow = (game: Game): number => game.state.eventLog.at(-1)?.seq ?? 0;

describe("Indomitable Creativity", () => {
  it("each controller reveals once per permanent of theirs destroyed; the finds all enter, then those players shuffle", () => {
    const { game } = table({ deck: "Lightning Bolt" });
    lands(game, "Mountain", 6);
    const bobBears = spawn(game, "Grizzly Bears", B);
    const bobRing = spawn(game, "Sol Ring", B);
    const aliceMyr = spawn(game, "Memnite", A);
    // Bob: Shock, then Llanowar Elves, then Lightning Bolt, then Ornithopter.
    const bobOrnithopter = toLibrary(game, "Ornithopter", B);
    toLibrary(game, "Lightning Bolt", B);
    const bobElves = toLibrary(game, "Llanowar Elves", B);
    const bobShock = toLibrary(game, "Shock", B);
    // Alice: Shock, then a Sol Ring (an artifact card is found too).
    const aliceRing = toLibrary(game, "Sol Ring", A);
    const aliceShock = toLibrary(game, "Shock", A);
    const since = seqNow(game) + 1;
    cast(game, toHand(game, "Indomitable Creativity"), { x: 3, targets: [ref(bobBears), ref(bobRing), ref(aliceMyr)] });
    expect([bobBears, bobRing, aliceMyr].map((id) => zone(game, id))).toEqual(["graveyard", "graveyard", "graveyard"]);
    // Two of Bob's went: his first two artifact or creature cards.
    expect(zone(game, bobElves)).toBe("battlefield");
    expect(zone(game, bobOrnithopter)).toBe("battlefield");
    expect(controller(game, bobElves)).toBe(B);
    expect(zone(game, bobShock)).toBe("library");
    // One of Alice's: her first.
    expect(zone(game, aliceRing)).toBe("battlefield");
    expect(controller(game, aliceRing)).toBe(A);
    expect(zone(game, aliceShock)).toBe("library");
    // Each found card was exiled before it entered.
    const log = game.state.eventLog.filter((e) => e.seq >= since);
    const exiled = log.flatMap((e) =>
      e.type === "cards-put-into-exile" ? e.arrivals.filter((a) => a.from === "library").map((a) => a.object) : [],
    );
    expect([...exiled].sort()).toEqual([bobElves, bobOrnithopter, aliceRing].sort());
    // All at once: every entry after every reveal, and the shuffles after the entries.
    const lastReveal = log.findLastIndex((e) => e.type === "cards-revealed");
    const entries = log.flatMap((e, i) => (e.type === "permanent-entered-battlefield" ? [i] : []));
    const shuffles = log.flatMap((e, i) => (e.type === "library-shuffled" ? [i] : []));
    expect(entries.length).toBe(3);
    expect(Math.min(...entries)).toBeGreaterThan(lastReveal);
    expect(Math.min(...shuffles)).toBeGreaterThan(Math.max(...entries));
    expect(shuffled(game, since).sort()).toEqual([A, B].sort());
  });

  it("a target that wasn't destroyed — indestructible — gives no reveal and no shuffle", () => {
    const { game } = table({ deck: "Lightning Bolt" });
    lands(game, "Mountain", 5);
    const myr = spawn(game, "Darksteel Myr", B);
    const bears = spawn(game, "Grizzly Bears", A);
    const bobElves = toLibrary(game, "Llanowar Elves", B);
    const aliceElves = toLibrary(game, "Llanowar Elves", A);
    const since = seqNow(game) + 1;
    cast(game, toHand(game, "Indomitable Creativity"), { x: 2, targets: [ref(myr), ref(bears)] });
    expect(zone(game, myr)).toBe("battlefield");
    expect(zone(game, bobElves)).toBe("library");
    expect(library(game, B)[0]).toBe(bobElves);
    expect(zone(game, aliceElves)).toBe("battlefield");
    expect(shuffled(game, since)).toEqual([A]);
  });

  it("a permanent destroyed but exiled instead (Rest in Peace) still counts", () => {
    const { game } = table({ deck: "Lightning Bolt" });
    lands(game, "Mountain", 4);
    spawn(game, "Rest in Peace", A);
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = toLibrary(game, "Llanowar Elves", B);
    cast(game, toHand(game, "Indomitable Creativity"), { x: 1, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, elves)).toBe("battlefield");
  });

  it("with no artifact or creature card left, the whole library is revealed, nothing exiled, and it's shuffled", () => {
    const { game } = table({ deck: "Lightning Bolt" });
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const since = seqNow(game) + 1;
    const cards = library(game, B).length;
    cast(game, toHand(game, "Indomitable Creativity"), { x: 1, targets: [ref(bears)] });
    expect(library(game, B).length).toBe(cards);
    expect(library(game, B).every((id) => zone(game, id) === "library")).toBe(true);
    expect(shuffled(game, since)).toEqual([B]);
  });

  it("a player none of whose permanents went reveals nothing, at three players", () => {
    const { game } = table({ players: 3, deck: "Lightning Bolt" });
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears", C);
    spawn(game, "Grizzly Bears", B);
    const bobElves = toLibrary(game, "Llanowar Elves", B);
    const carolElves = toLibrary(game, "Llanowar Elves", C);
    const since = seqNow(game) + 1;
    cast(game, toHand(game, "Indomitable Creativity"), { x: 1, targets: [ref(bears)] });
    expect(zone(game, carolElves)).toBe("battlefield");
    expect(controller(game, carolElves)).toBe(C);
    expect(zone(game, bobElves)).toBe("library");
    expect(shuffled(game, since)).toEqual([C]);
  });

  it("a found card with an \"as this enters\" choice is asked before they all enter (Clone)", () => {
    const { game, b } = table({ deck: "Lightning Bolt" });
    lands(game, "Mountain", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    const ring = spawn(game, "Sol Ring", A);
    const goblin = spawn(game, "Raging Goblin", A);
    const clone = toLibrary(game, "Clone", B);
    const aliceElves = toLibrary(game, "Llanowar Elves", A);
    let offered: readonly ObjectId[] = [];
    b.chooseCopyFn = (_view, _source, options) => {
      offered = options;
      return goblin;
    };
    cast(game, toHand(game, "Indomitable Creativity"), { x: 2, targets: [ref(bears), ref(ring)] });
    // Alice's Elves enter with it, so aren't there yet to copy.
    expect(offered).toEqual([goblin]);
    expect(zone(game, clone)).toBe("battlefield");
    expect(game.state.objects[clone].copyOf).toBeDefined();
    expect(zone(game, aliceElves)).toBe("battlefield");
  });

  it("an indestructible target granted it is targeted but not destroyed", () => {
    const { game } = table({ deck: "Lightning Bolt" });
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    grant(game, bears, "indestructible");
    const elves = toLibrary(game, "Llanowar Elves", B);
    cast(game, toHand(game, "Indomitable Creativity"), { x: 1, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, elves)).toBe("library");
  });
});
