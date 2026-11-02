/**
 * Sacrifice costs of a number of permanents beyond `sacrifice-multiple-cost`'s:
 * a mana ability's "Sacrifice X Goats", which has nowhere to wait but still asks
 * which (rules 605.1a, 605.3b); a cost of several parts with a number each,
 * "this creature and any number of other…" (601.2h); "with different names";
 * and flashback's "Sacrifice X Mountains".
 */
import { describe, expect, it } from "vitest";

import type { Action, LegalAction } from "../actions.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  graveyard,
  pt,
  ref,
  life,
  named,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";

type Offer = Extract<LegalAction, { kind: "activate-ability" }>;

const offers = (game: Game, source: ObjectId, index: number): Offer[] =>
  game
    .legalActions(A)
    .filter((a): a is Offer => a.kind === "activate-ability" && a.source === source && a.abilityIndex === index);

const pool = (game: Game): readonly string[] => game.state.players[A].manaPool.map((u) => u.type);

/** `n` real tokens named `name`, their ids, oldest first (below the stacking
 * threshold, or an ability's token, each its own object). */
function tokens(game: Game, name: string, n: number): ObjectId[] {
  const before = new Set(game.state.zones.shared.battlefield);
  game.debugApplyEffect(A, { kind: "create-token", token: name, count: n });
  return game.state.zones.shared.battlefield.filter((id) => !before.has(id));
}

const goats = (game: Game, n: number): ObjectId[] => tokens(game, "Goat Token", n);

/** A token that leaves the battlefield ceases to exist (rule 704.5d). */
const on = (game: Game, id: ObjectId): boolean => game.state.zones.shared.battlefield.includes(id);

describe("a mana ability that sacrifices X permanents", () => {
  const PASTURE = 2;

  it("is offered per colour, X up to the Goats, and asks which before any mana comes", () => {
    const { game } = table();
    const pasture = spawn(game, "Springjack Pasture");
    const [g1, g2, g3] = goats(game, 3);
    const each = offers(game, pasture, PASTURE);
    expect(each.map((o) => o.manaColors)).toEqual([["W"], ["U"], ["B"], ["R"], ["G"]]);
    expect(each[0].xCost).toEqual({ maxX: 3 });
    expect(each[0].manaAbility).toBe(true);

    game.dispatch({ type: "activate-ability", player: A, source: pasture, abilityIndex: PASTURE, targets: [], xValue: 2, manaColors: ["G"] } as Action);
    // On no stack, and nothing made until the cost is paid.
    expect(game.state.zones.shared.stack.length).toBe(0);
    expect(pool(game)).toEqual([]);
    expect(life(game)).toBe(20);
    expect(game.state.awaiting).toMatchObject({ kind: "sacrifice", player: A, count: 2, eligible: [g1, g2, g3] });

    game.dispatch({ type: "sacrifice", player: A, permanents: [g1, g3] });
    expect(pool(game)).toEqual(["G", "G"]);
    expect(life(game)).toBe(22);
    expect(zone(game, g2)).toBe("battlefield");
    expect(tokensNamed(game, "Goat Token", A)).toBe(1);
    expect(game.state.zones.shared.stack.length).toBe(0);
    // The player has priority again, with the mana floating.
    expect(game.state.priority.holder).toBe(A);
    expect(game.state.awaiting).toBeNull();
  });

  it("asks nothing when X takes every Goat, and adds the mana at once", () => {
    const { game } = table();
    const pasture = spawn(game, "Springjack Pasture");
    goats(game, 2);
    game.dispatch({ type: "activate-ability", player: A, source: pasture, abilityIndex: PASTURE, targets: [], xValue: 2, manaColors: ["R"] } as Action);
    expect(game.state.awaiting).toBeNull();
    expect(pool(game)).toEqual(["R", "R"]);
    expect(tokensNamed(game, "Goat Token", A)).toBe(0);
  });

  it("X = 0 costs only the tap and adds nothing", () => {
    const { game } = table();
    const pasture = spawn(game, "Springjack Pasture");
    goats(game, 1);
    game.dispatch({ type: "activate-ability", player: A, source: pasture, abilityIndex: PASTURE, targets: [], xValue: 0, manaColors: ["R"] } as Action);
    expect(pool(game)).toEqual([]);
    expect(game.state.objects[pasture].tapped).toBe(true);
    expect(tokensNamed(game, "Goat Token", A)).toBe(1);
  });

  it("an X larger than the Goats is refused, and the auto-payer never reaches for it", () => {
    const { game } = table();
    const pasture = spawn(game, "Springjack Pasture");
    goats(game, 1);
    const tooMany = { type: "activate-ability", player: A, source: pasture, abilityIndex: PASTURE, targets: [], xValue: 2, manaColors: ["R"] } as Action;
    expect(() => game.dispatch(tooMany)).toThrow();
    // Paying a cost, it's {C} from its first ability: a {G} can't come from the
    // Goat, and a {1} leaves it alone.
    const bears = toHand(game, "Grizzly Bears");
    const ring = toHand(game, "Sol Ring");
    const casts = game.legalActions(A).filter((a) => a.kind === "cast-spell").map((a) => a.card);
    expect(casts).not.toContain(bears);
    expect(casts).toContain(ring);
    game.dispatch({ type: "cast-spell", player: A, card: ring, targets: [] } as Action);
    expect(tokensNamed(game, "Goat Token", A)).toBe(1);
    expect(game.state.objects[pasture].tapped).toBe(true);
  });

  it("Haruspex's X mana of one colour is offered per colour too", () => {
    const { game } = table();
    const haruspex = spawn(game, "Haruspex");
    game.state.objects[haruspex].counters["+1/+1"] = 2;
    const each = offers(game, haruspex, 0);
    expect(each.map((o) => o.manaColors?.[0])).toEqual(["W", "U", "B", "R", "G"]);
    expect(each[4].text).toContain("(X {G})");
  });
});

describe("a sacrifice cost of parts with a number each", () => {
  it("Emrakul's Evangel: itself and any number of others, a token for each, Eldrazi left out", () => {
    const { game } = table();
    const evangel = spawn(game, "Emrakul's Evangel");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const elf = spawn(game, "Llanowar Elves");
    const [horror] = tokens(game, "Eldrazi Horror Token", 1);
    expect(offers(game, evangel, 0)[0].xCost).toEqual({ maxX: 3 });

    game.dispatch({ type: "activate-ability", player: A, source: evangel, abilityIndex: 0, targets: [], xValue: 2 } as Action);
    // The source pays its own part unasked; the others are chosen.
    expect(game.state.awaiting).toMatchObject({ kind: "sacrifice", count: 2, eligible: [bears, giant, elf] });
    expect(zone(game, evangel)).toBe("battlefield");
    game.dispatch({ type: "sacrifice", player: A, permanents: [bears, elf] });
    settle(game);
    expect(zone(game, evangel)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, elf)).toBe("graveyard");
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, horror)).toBe("battlefield");
    // Three sacrificed: three more Horrors beside the one that was there.
    expect(tokensNamed(game, "Eldrazi Horror Token", A)).toBe(4);
  });

  it("Emrakul's Evangel: X = 0 is itself alone, and an X past the others is refused", () => {
    const { game } = table();
    const evangel = spawn(game, "Emrakul's Evangel");
    spawn(game, "Grizzly Bears");
    expect(() =>
      game.dispatch({ type: "activate-ability", player: A, source: evangel, abilityIndex: 0, targets: [], xValue: 2 } as Action),
    ).toThrow();
    activate(game, evangel, 0, { x: 0 });
    expect(zone(game, evangel)).toBe("graveyard");
    expect(tokensNamed(game, "Eldrazi Horror Token", A)).toBe(1);
    expect(named(game, "Grizzly Bears", A).length).toBe(1);
  });

  it("Glass-Cast Heart: needs thirteen Blood tokens, and takes them with itself", () => {
    const { game } = table();
    const heart = spawn(game, "Glass-Cast Heart");
    for (let i = 0; i < 2; i += 1) spawn(game, "Swamp");
    tokens(game, "Blood Token", 12);
    expect(offers(game, heart, 1)).toEqual([]);
    tokens(game, "Blood Token", 1);
    expect(offers(game, heart, 1).length).toBe(1);
    activate(game, heart, 1);
    expect(zone(game, heart)).toBe("graveyard");
    expect(tokensNamed(game, "Blood Token", A)).toBe(0);
    expect(life(game, B)).toBe(7);
    expect(life(game, A)).toBe(33);
  });

  it("Glass-Cast Heart: a fourteenth Blood means choosing thirteen", () => {
    const { game } = table();
    const heart = spawn(game, "Glass-Cast Heart");
    for (let i = 0; i < 2; i += 1) spawn(game, "Swamp");
    const blood = tokens(game, "Blood Token", 14);
    game.dispatch({ type: "activate-ability", player: A, source: heart, abilityIndex: 1, targets: [] } as Action);
    expect(game.state.awaiting).toMatchObject({ kind: "sacrifice", count: 13 });
    game.dispatch({ type: "sacrifice", player: A, permanents: blood.slice(1) });
    expect(zone(game, blood[0])).toBe("battlefield");
    settle(game);
    expect(tokensNamed(game, "Blood Token", A)).toBe(1);
  });
});

describe("a sacrifice cost with different names", () => {
  const font = (game: Game): ObjectId => {
    const id = spawn(game, "Transmutation Font");
    for (let i = 0; i < 3; i += 1) spawn(game, "Wastes");
    return id;
  };

  it("needs three names, however many tokens", () => {
    const { game } = table();
    const source = font(game);
    tokens(game, "Clue Token", 2);
    tokens(game, "Food Token", 1);
    expect(offers(game, source, 1)).toEqual([]);
    tokens(game, "Blood Token", 1);
    expect(offers(game, source, 1).length).toBe(1);
  });

  it("offers only names not yet chosen, one at a time, then sacrifices them together", () => {
    const { game } = table();
    const source = font(game);
    const clues = tokens(game, "Clue Token", 2);
    const [food] = tokens(game, "Food Token", 1);
    const [blood] = tokens(game, "Blood Token", 1);
    const target = toLibrary(game, "Sol Ring");
    game.dispatch({ type: "activate-ability", player: A, source, abilityIndex: 1, targets: [] } as Action);
    expect(game.state.awaiting).toMatchObject({ kind: "sacrifice", count: 1, eligible: [...clues, food, blood] });
    game.dispatch({ type: "sacrifice", player: A, permanents: [food] });
    // Food is gone from the offer, and nothing has been sacrificed yet.
    expect(game.state.awaiting).toMatchObject({ kind: "sacrifice", count: 1, eligible: [...clues, blood] });
    expect(on(game, food)).toBe(true);
    game.dispatch({ type: "sacrifice", player: A, permanents: [clues[0]] });
    // One name left and one to take: no question, and the other Clue stays.
    expect(game.state.awaiting?.kind).not.toBe("sacrifice");
    expect(on(game, clues[0])).toBe(false);
    expect(on(game, blood)).toBe(false);
    expect(on(game, food)).toBe(false);
    expect(on(game, clues[1])).toBe(true);
    expect(zone(game, target)).toBe("library");
  });

  it("choosing a duplicate name's token can leave no choice at all", () => {
    const { game } = table();
    const source = font(game);
    const clues = tokens(game, "Clue Token", 2);
    const [food] = tokens(game, "Food Token", 1);
    const [blood] = tokens(game, "Blood Token", 1);
    game.dispatch({ type: "activate-ability", player: A, source, abilityIndex: 1, targets: [] } as Action);
    game.dispatch({ type: "sacrifice", player: A, permanents: [clues[1]] });
    expect(game.state.awaiting?.kind).not.toBe("sacrifice");
    expect(on(game, food)).toBe(false);
    expect(on(game, blood)).toBe(false);
    expect(on(game, clues[0])).toBe(true);
  });
});

describe("Mossbridge Troll", () => {
  it("taps others with total power 10, never itself, for +20/+20", () => {
    const { game } = table();
    const troll = spawn(game, "Mossbridge Troll");
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    // 5 of its own doesn't count, and 3 + 2 is short.
    expect(offers(game, troll, 0)).toEqual([]);
    const another = [spawn(game, "Hill Giant"), spawn(game, "Grizzly Bears")];
    const offer = offers(game, troll, 0)[0];
    expect(offer.tapCost?.totalPower).toBe(10);
    expect(offer.tapCost?.choices).not.toContain(troll);
    const picks = [giant, bears, ...another];
    game.dispatch({ type: "activate-ability", player: A, source: troll, abilityIndex: 0, targets: [], tap: picks } as Action);
    settle(game);
    for (const id of picks) expect(game.state.objects[id].tapped).toBe(true);
    expect(game.state.objects[troll].tapped).toBe(false);
    expect(pt(game, troll)).toEqual({ power: 25, toughness: 25 });
  });

  it("regenerates each time it would be destroyed, no shield used (rule 701.19b)", () => {
    const { game } = table();
    const troll = spawn(game, "Mossbridge Troll");
    for (let i = 0; i < 2; i += 1) {
      game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(troll)]);
      expect(zone(game, troll)).toBe("battlefield");
      expect(game.state.objects[troll].tapped).toBe(true);
      game.state.objects[troll].tapped = false;
    }
  });

  it("is still destroyed if it can't be regenerated (rule 701.19c), and a sacrifice isn't destruction", () => {
    const { game } = table();
    const troll = spawn(game, "Mossbridge Troll");
    game.state.objects[troll].cantBeRegeneratedTurn = game.state.turn.number;
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(troll)]);
    expect(zone(game, troll)).toBe("graveyard");
  });
});

describe("flashback's sacrifice of X", () => {
  const blitzOffer = (game: Game, card: ObjectId): Extract<LegalAction, { kind: "cast-spell" }> | undefined =>
    game
      .legalActions(A)
      .find((a): a is Extract<LegalAction, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === card && a.via === "flashback");

  it("X up to the Mountains left after the mana, and the spell reads it", () => {
    const { game } = table();
    const blitz = toGraveyard(game, "Firecat Blitz");
    const mountains = Array.from({ length: 5 }, () => spawn(game, "Mountain"));
    // Two tap for {R}{R}, and tapped ones can still be sacrificed: all five.
    expect(blitzOffer(game, blitz)?.xCost?.maxX).toBe(5);
    game.dispatch({ type: "cast-spell", player: A, card: blitz, targets: [], via: "flashback", xValue: 2 } as Action);
    expect(game.state.awaiting).toMatchObject({ kind: "sacrifice", count: 2 });
    game.dispatch({ type: "sacrifice", player: A, permanents: [mountains[0], mountains[1]] });
    settle(game);
    expect(tokensNamed(game, "Elemental Cat Token", A)).toBe(2);
    expect(zone(game, blitz)).toBe("exile");
    expect(graveyard(game).length).toBe(2);
  });

  it("cast from a hand, X is paid in mana and nothing is sacrificed", () => {
    const { game } = table();
    const blitz = game.debugSpawn("Firecat Blitz", A, "hand");
    for (let i = 0; i < 4; i += 1) spawn(game, "Mountain");
    game.dispatch({ type: "cast-spell", player: A, card: blitz, targets: [], xValue: 2 } as Action);
    settle(game);
    expect(tokensNamed(game, "Elemental Cat Token", A)).toBe(2);
    expect(named(game, "Mountain", A).length).toBe(4);
  });
});
