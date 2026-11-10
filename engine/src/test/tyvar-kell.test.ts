/**
 * Tyvar Kell, on existing machinery: the emblem's "it gains haste until end of
 * turn" is Judith, Carnage Connoisseur's keyword grant to the spell just cast,
 * which the permanent it becomes keeps (rule 400.7a).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { poolCounts } from "../mana.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  activate,
  cast,
  counters,
  hand,
  keywords,
  lands,
  loyalty,
  named,
  nextTurn,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

const pool = (game: Game, p: PlayerId = A) => poolCounts(game.state.players[p].manaPool);

/** A real token (`spawn` makes the name's card, not a token). */
function token(game: Game, name: string, p: PlayerId = A): ObjectId {
  const before = new Set(named(game, name, p));
  game.debugApplyEffect(p, { kind: "create-token", token: name, count: 1 }, []);
  settle(game);
  return named(game, name, p).find((id) => !before.has(id)) as ObjectId;
}

describe("Tyvar Kell", () => {
  it("Elves you control tap for {B}; Tyvar and an opponent's Elf don't", () => {
    const { game } = table();
    const tyvar = spawn(game, "Tyvar Kell");
    const elf = token(game, "Elf Warrior Token");
    const theirs = token(game, "Elf Warrior Token", B);
    game.state.objects[elf].summoningSick = false;
    // The offers for a permanent's abilities, by index: the Elf's granted one
    // is its only ability; Tyvar has his three loyalty abilities and no more.
    const offered = (id: ObjectId) =>
      game
        .legalActions(A)
        .flatMap((o) => (o.kind === "activate-ability" && o.source === id ? [o.abilityIndex] : []))
        .sort();
    expect(offered(elf)).toEqual([0]);
    expect(offered(tyvar).every((index) => index < 3)).toBe(true);
    expect(offered(tyvar).length).toBeGreaterThan(0);
    activate(game, elf, 0);
    expect(pool(game).B).toBe(1);
    expect(game.state.objects[elf].tapped).toBe(true);
    game.state.objects[theirs].summoningSick = false;
    expect(() => activate(game, theirs, 0, { player: B })).toThrow();
  });

  it("+1: a counter on up to one target Elf, untapped, deathtouch until end of turn", () => {
    const { game } = table();
    const tyvar = spawn(game, "Tyvar Kell");
    const elf = spawn(game, "Llanowar Elves", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears");
    expect(() => loyalty(game, tyvar, 1, { targets: [ref(bears)] })).toThrow();
    loyalty(game, tyvar, 1, { targets: [ref(elf)] });
    expect(counters(game, elf)).toBe(1);
    expect(game.state.objects[elf].tapped).toBe(false);
    expect(keywords(game, elf).has("deathtouch")).toBe(true);
    expect(counters(game, tyvar, "loyalty")).toBe(4);
    nextTurn(game);
    expect(keywords(game, elf).has("deathtouch")).toBe(false);
    expect(counters(game, elf)).toBe(1);
  });

  it("+1 with no target only adds loyalty; 0 makes a 1/1 green Elf Warrior", () => {
    const { game } = table();
    const tyvar = spawn(game, "Tyvar Kell");
    loyalty(game, tyvar, 1, { targets: [null] });
    expect(counters(game, tyvar, "loyalty")).toBe(4);
    nextTurn(game);
    nextTurn(game);
    loyalty(game, tyvar, 0);
    expect(tokensNamed(game, "Elf Warrior Token", A)).toBe(1);
    const elf = named(game, "Elf Warrior Token", A)[0];
    expect(pt(game, elf)).toEqual({ power: 1, toughness: 1 });
  });

  it("−6: the emblem gives an Elf spell haste, kept by the permanent until end of turn, and draws two", () => {
    const { game } = table();
    const tyvar = spawn(game, "Tyvar Kell");
    lands(game, "Forest", 4);
    loyalty(game, tyvar, -6, { atLeast: 6 });
    expect(zone(game, tyvar)).toBe("graveyard");

    const elf = toHand(game, "Llanowar Elves");
    const held = hand(game).length;
    cast(game, elf);
    expect(zone(game, elf)).toBe("battlefield");
    expect(keywords(game, elf).has("haste")).toBe(true);
    // The Elf left the hand, two cards came.
    expect(hand(game).length).toBe(held + 1);
    // Haste lets it tap for mana the turn it came.
    activate(game, elf, 0);
    expect(pool(game).G).toBe(1);

    // Not an Elf: nothing.
    const bears = toHand(game, "Grizzly Bears");
    const then = hand(game).length;
    cast(game, bears);
    expect(keywords(game, bears).has("haste")).toBe(false);
    expect(hand(game).length).toBe(then - 1);

    nextTurn(game);
    expect(keywords(game, elf).has("haste")).toBe(false);
  });

  it("the emblem's trigger resolves before the spell: haste is on the spell on the stack", () => {
    const { game } = table();
    const tyvar = spawn(game, "Tyvar Kell");
    lands(game, "Forest", 1);
    loyalty(game, tyvar, -6, { atLeast: 6 });
    const elf = toHand(game, "Llanowar Elves");
    cast(game, elf, { settle: false });
    expect(zone(game, elf)).toBe("stack");
    expect(keywords(game, elf).has("haste")).toBe(false);
    game.advanceUntil((s) => s.zones.shared.stack.length === 1 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(zone(game, elf)).toBe("stack");
    expect(keywords(game, elf).has("haste")).toBe(true);
  });
});
