/**
 * Batch 227, group D: Urza's Destiny's rest, Starter 1999 and Mercadian
 * Masques — Spellshapers (a discard in the cost), Loyal Sentry's block,
 * Noble Purpose's and Close Quarters' combat triggers, Embargo's untap lock,
 * Foster's paid reveal and Natural Affinity's mass animation.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  destroy,
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
  toHand,
  toLibrary,
  toStep,
  types,
  zone,
} from "./harness.js";
import type { ObjectId } from "../primitives.js";

/** Activate with a discard in the cost: answer the discard with the first
 * card in hand if the engine asks, then settle. */
function activateDiscarding(
  game: Game,
  source: ObjectId,
  index: number,
  opts: { targets?: readonly ObjectId[]; x?: number } = {},
): void {
  activate(game, source, index, {
    targets: (opts.targets ?? []).map((id) => ref(id)),
    ...(opts.x !== undefined ? { x: opts.x } : {}),
    settle: false,
  });
  if (game.state.awaiting?.kind === "discard") {
    game.dispatch({ type: "discard", player: A, cards: [hand(game)[0]] });
  }
  settle(game);
}

describe("Loyal Sentry", () => {
  it("destroys the creature it blocks and itself before combat damage", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const sentry = spawn(game, "Loyal Sentry", B);
    b.declareBlockersFn = () => [{ blocker: sentry, attacker: bears }];
    attack(game, a, [bears]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, sentry)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Noble Purpose", () => {
  it("gains life equal to a creature's combat damage", () => {
    const { game, a } = table();
    spawn(game, "Noble Purpose");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });
});

describe("Close Quarters", () => {
  it("deals 1 damage to any target when a creature you control becomes blocked", () => {
    const { game, a, b } = table();
    spawn(game, "Close Quarters");
    const bears = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker, attacker: bears }];
    pickTargets(a, B);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(19);
  });
});

describe("Embargo", () => {
  it("keeps nonland permanents tapped through the untap step, and costs 2 life each upkeep", () => {
    const { game } = table();
    spawn(game, "Embargo");
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    const [land] = lands(game, "Wastes", 1);
    game.state.objects[land].tapped = true;
    toStep(game, "precombat-main");
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[land].tapped).toBe(false);
    expect(life(game, A)).toBe(18);
  });
});

describe("Foster", () => {
  it("pays {1} to reveal until a creature card: it goes to hand, the rest to the graveyard", () => {
    const { game, a } = table();
    spawn(game, "Foster");
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    const found = toLibrary(game, "Grizzly Bears");
    const w1 = toLibrary(game, "Wastes");
    const w2 = toLibrary(game, "Wastes");
    pickModes(a, 0);
    destroy(game, bears);
    settle(game);
    expect(zone(game, found)).toBe("hand");
    expect(zone(game, w1)).toBe("graveyard");
    expect(zone(game, w2)).toBe("graveyard");
  });
});

describe("Hammer Mage", () => {
  it("destroys every artifact with mana value X or less", () => {
    const { game } = table();
    const mage = spawn(game, "Hammer Mage");
    lands(game, "Mountain", 3);
    const ring = spawn(game, "Sol Ring", B);
    const stone = spawn(game, "Mind Stone");
    const powerstone = spawn(game, "Worn Powerstone", B);
    const before = graveyard(game).length;
    activateDiscarding(game, mage, 0, { x: 2 });
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, stone)).toBe("graveyard");
    expect(zone(game, powerstone)).toBe("battlefield");
    // The discarded card and Mind Stone.
    expect(graveyard(game).length).toBe(before + 2);
  });
});

describe("Overtaker", () => {
  it("untaps a creature, takes it until end of turn and gives it haste", () => {
    const { game } = table();
    const overtaker = spawn(game, "Overtaker");
    lands(game, "Island", 4);
    const theirs = spawn(game, "Grizzly Bears", B, { tapped: true, sick: true });
    activateDiscarding(game, overtaker, 0, { targets: [theirs] });
    expect(controller(game, theirs)).toBe(A);
    expect(game.state.objects[theirs].tapped).toBe(false);
    expect(keywords(game, theirs).has("haste")).toBe(true);
  });
});

describe("Toymaker", () => {
  it("animates a noncreature artifact as an X/X for its mana value", () => {
    const { game } = table();
    const toymaker = spawn(game, "Toymaker");
    lands(game, "Wastes", 1);
    const powerstone = spawn(game, "Worn Powerstone");
    activateDiscarding(game, toymaker, 0, { targets: [powerstone] });
    expect(types(game, powerstone)).toContain("creature");
    expect(pt(game, powerstone)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Trade Routes", () => {
  it("discards a land card to draw, and returns a land you control to hand", () => {
    const { game } = table();
    const routes = spawn(game, "Trade Routes");
    lands(game, "Wastes", 2);
    const [extra] = lands(game, "Wastes", 1);
    const handBefore = hand(game).length;
    const graveBefore = graveyard(game).length;
    activateDiscarding(game, routes, 1);
    expect(hand(game).length).toBe(handBefore);
    expect(graveyard(game).length).toBe(graveBefore + 1);
    activate(game, routes, 0, { targets: [ref(extra)] });
    expect(zone(game, extra)).toBe("hand");
  });
});

describe("Natural Affinity", () => {
  it("makes every land, whoever controls it, a 2/2 creature until end of turn", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const [theirs] = lands(game, "Wastes", 1, B);
    cast(game, toHand(game, "Natural Affinity"));
    expect(types(game, theirs)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});
