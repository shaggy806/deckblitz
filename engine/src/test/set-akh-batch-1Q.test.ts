/**
 * Amonkhet, group Q: the aftermath split cards, the brick-counter artifacts,
 * exert, and the rechecks — the clause of each most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  toStep,
  zone,
} from "./harness.js";

/** Who may attack, as the attack is declared. */
const eligibleAttackers = (game: Game): readonly ObjectId[] => {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers" || s.result.over);
  const offer = game.legalActions(A).find((x) => x.kind === "declare-attackers");
  return offer?.kind === "declare-attackers" ? offer.eligible : [];
};

describe("Cut // Ribbons", () => {
  it("Cut deals 4, then Ribbons from the graveyard drains each opponent X and is exiled", () => {
    const { game } = table({ players: 3 });
    lands(game, "Mountain", 2);
    lands(game, "Swamp", 5);
    const bear = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Cut // Ribbons");
    cast(game, card, { face: 1, targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, card)).toBe("graveyard");
    cast(game, card, { face: 2, via: "aftermath", x: 3 });
    expect([life(game, A), life(game, B), life(game, C)]).toEqual([20, 17, 17]);
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Never // Return", () => {
  it("Return exiles any card from a graveyard and makes a Zombie", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const card = toGraveyard(game, "Never // Return");
    const theirs = toGraveyard(game, "Lightning Bolt", B);
    cast(game, card, { face: 2, via: "aftermath", targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("exile");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
  });
});

describe("Onward // Victory", () => {
  it("Onward gives +X/+0 where X is the target's power", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bear = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Onward // Victory"), { face: 1, targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 2 });
  });
});

describe("Oketra the True", () => {
  it("attacks only with three other creatures", () => {
    const { game } = table();
    const oketra = spawn(game, "Oketra the True");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    expect(eligibleAttackers(game)).not.toContain(oketra);
    const again = table();
    const oketra2 = spawn(again.game, "Oketra the True");
    spawn(again.game, "Grizzly Bears");
    spawn(again.game, "Grizzly Bears");
    spawn(again.game, "Grizzly Bears");
    expect(eligibleAttackers(again.game)).toContain(oketra2);
  });
});

describe("Pyramid of the Pantheon", () => {
  it("puts a brick counter on with each {2} mana, and makes three only with three bricks", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const pyramid = spawn(game, "Pyramid of the Pantheon");
    expect(() => activate(game, pyramid, 1)).toThrow();
    activate(game, pyramid, 0);
    expect(counters(game, pyramid, "brick")).toBe(1);
    game.state.objects[pyramid].tapped = false;
    game.state.objects[pyramid].counters.brick = 3;
    activate(game, pyramid, 1);
    expect(game.state.objects[pyramid].tapped).toBe(true);
  });
});

describe("Luxa River Shrine", () => {
  it("gains 1 and adds a brick; the 2-life ability waits for three bricks", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const shrine = spawn(game, "Luxa River Shrine");
    activate(game, shrine, 0);
    expect(life(game)).toBe(21);
    expect(counters(game, shrine, "brick")).toBe(1);
    game.state.objects[shrine].tapped = false;
    expect(() => activate(game, shrine, 1)).toThrow();
    game.state.objects[shrine].counters.brick = 3;
    activate(game, shrine, 1);
    expect(life(game)).toBe(23);
  });
});

describe("Exemplar of Strength", () => {
  it("takes three -1/-1 counters, and removes one for 1 life as it attacks", () => {
    const { game, a } = table();
    const exemplar = enter(game, "Exemplar of Strength");
    expect(counters(game, exemplar, "-1/-1")).toBe(3);
    attack(game, a, [exemplar]);
    expect(counters(game, exemplar, "-1/-1")).toBe(2);
    expect(life(game)).toBe(21);
    expect(life(game, B)).toBe(18);
  });

  it("gains nothing with no counter to remove", () => {
    const { game, a } = table();
    const bear = spawn(game, "Hill Giant");
    pickTargets(a, bear);
    const exemplar = enter(game, "Exemplar of Strength");
    // The 3/3 took all three and died.
    expect([counters(game, exemplar, "-1/-1"), zone(game, bear)]).toEqual([0, "graveyard"]);
    attack(game, a, [exemplar]);
    expect(life(game)).toBe(20);
    expect(life(game, B)).toBe(16);
  });
});

describe("Hazoret's Favor", () => {
  it("pumps and hastes the target, then sacrifices it at the next end step", () => {
    const { game, a } = table();
    spawn(game, "Hazoret's Favor");
    const bear = spawn(game, "Grizzly Bears", A, { sick: true });
    pickModes(a, 0);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, bear).has("haste")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bear)).toBe("graveyard");
  });
});

describe("Dread Wanderer", () => {
  it("returns from the graveyard only with one or fewer cards in hand, tapped", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const wanderer = toGraveyard(game, "Dread Wanderer");
    expect(hand(game).length).toBeGreaterThan(1);
    expect(() => activate(game, wanderer, 0)).toThrow();
    game.debugApplyEffect(A, { kind: "discard-hand", who: "you" }, []);
    settle(game);
    activate(game, wanderer, 0);
    expect(zone(game, wanderer)).toBe("battlefield");
    expect(game.state.objects[wanderer].tapped).toBe(true);
  });
});

describe("Battlefield Scavenger", () => {
  it("exerting it rummages", () => {
    const { game, a } = table();
    const scavenger = spawn(game, "Battlefield Scavenger");
    const before = { hand: hand(game).length, graveyard: graveyard(game).length };
    pickModes(a, 0);
    attack(game, a, [scavenger]);
    expect(game.state.objects[scavenger].exertedBy).toBe(A);
    expect(hand(game).length).toBe(before.hand);
    expect(graveyard(game).length).toBe(before.graveyard + 1);
  });
});

describe("Watchful Naga", () => {
  it("draws when exerted", () => {
    const { game, a } = table();
    const naga = spawn(game, "Watchful Naga");
    const before = hand(game).length;
    pickModes(a, 0);
    attack(game, a, [naga]);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Basri, Tomorrow's Champion", () => {
  it("exerts for a lifelink Cat", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const basri = spawn(game, "Basri, Tomorrow's Champion");
    activate(game, basri, 0);
    expect(tokensNamed(game, "Lifelink Cat Token", A)).toBe(1);
    expect(game.state.objects[basri].exertedBy).toBe(A);
  });

  it("cycled, gives Cats you control hexproof and indestructible", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const cat = spawn(game, "Lifelink Cat Token");
    const bear = spawn(game, "Grizzly Bears");
    game.dispatch({ type: "cycle", player: A, card: toHand(game, "Basri, Tomorrow's Champion") });
    settle(game);
    expect(keywords(game, cat).has("hexproof")).toBe(true);
    expect(keywords(game, cat).has("indestructible")).toBe(true);
    expect(keywords(game, bear).has("hexproof")).toBe(false);
  });
});

describe("Feldon's Cane", () => {
  it("shuffles your graveyard into your library", () => {
    const { game } = table();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Lightning Bolt");
    const cane = spawn(game, "Feldon's Cane");
    activate(game, cane, 0);
    expect(graveyard(game)).toHaveLength(0);
    expect(zone(game, cane)).toBe("exile");
  });
});

describe("Djeru's Resolve", () => {
  it("untaps the creature and prevents all damage to it this turn", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const bear = spawn(game, "Grizzly Bears", A, { tapped: true });
    cast(game, toHand(game, "Djeru's Resolve"), { targets: [ref(bear)] });
    expect(game.state.objects[bear].tapped).toBe(false);
    game.debugApplyEffect(B, { kind: "damage", amount: 5, target: 0 }, [ref(bear)]);
    settle(game);
    expect(zone(game, bear)).toBe("battlefield");
  });
});
