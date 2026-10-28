/**
 * Recheck list R4, group A (batch B238): the cards authored from it, each
 * test written from the card's Oracle text and rulings.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  C,
  activate,
  controller,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  nextTurn,
  pickTargets,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toStep,
  types,
  zone,
} from "./harness.js";

describe("Rhino, Terrible Trampler", () => {
  it("destroys the artifact or land, divides three counters among the other targets, and gives them trample", () => {
    const { game } = table();
    const forest = spawn(game, "Forest", B);
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    const rhino = enter(game, "Rhino, Terrible Trampler", A, { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-targets" || s.zones.shared.stack.length === 0);
    expect(game.state.awaiting?.kind).toBe("choose-targets");
    game.dispatch({ type: "choose-targets", player: A, targets: [ref(forest), ref(bears), ref(elves)], division: [2, 1] });
    settle(game);
    expect(zone(game, forest)).toBe("graveyard");
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, elves)).toBe(1);
    expect(counters(game, rhino)).toBe(0);
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(keywords(game, elves).has("trample")).toBe(true);
  });
});

describe("Origin of Iron Man", () => {
  it("chapter I's creature stays tapped only while the Saga remains", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const saga = enter(game, "Origin of Iron Man");
    expect(game.state.objects[bears].tapped).toBe(true);
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(true);
    game.debugMove(saga, "graveyard");
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Olivia Voldaren", () => {
  it("pings another creature, makes it a Vampire and grows, then steals Vampires while you control her", () => {
    const { game } = table();
    const olivia = spawn(game, "Olivia Voldaren");
    lands(game, "Mountain", 2);
    lands(game, "Swamp", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, olivia, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(subtypes(game, bears)).toContain("Vampire");
    expect(counters(game, olivia)).toBe(1);
    activate(game, olivia, 1, { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    game.debugMove(olivia, "graveyard");
    settle(game);
    expect(controller(game, bears)).toBe(B);
  });
});

describe("Extraction Specialist", () => {
  it("returns a small creature that can't attack or block while you control it", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears);
    const specialist = enter(game, "Extraction Specialist");
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.characteristics(bears).restrictions.has("cant-attack")).toBe(true);
    expect(game.characteristics(bears).restrictions.has("cant-block")).toBe(true);
    game.debugMove(specialist, "graveyard");
    settle(game);
    expect(game.characteristics(bears).restrictions.has("cant-attack")).toBe(false);
  });

  it("puts no restriction on it if the Specialist left before the trigger resolved", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears);
    const specialist = enter(game, "Extraction Specialist", A, { settle: false });
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    game.debugMove(specialist, "graveyard");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.characteristics(bears).restrictions.has("cant-attack")).toBe(false);
  });
});

describe("Tale of Tinúviel", () => {
  it("chapter I's indestructible lasts only while you control the Saga", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    const saga = enter(game, "Tale of Tinúviel");
    expect(keywords(game, bears).has("indestructible")).toBe(true);
    game.debugMove(saga, "graveyard");
    settle(game);
    expect(keywords(game, bears).has("indestructible")).toBe(false);
  });
});

describe("Vault 87: Forced Evolution", () => {
  it("chapter I steals a non-Mutant creature for as long as you control the Saga", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const saga = enter(game, "Vault 87: Forced Evolution");
    expect(controller(game, bears)).toBe(A);
    game.debugMove(saga, "graveyard");
    settle(game);
    expect(controller(game, bears)).toBe(B);
  });
});

describe("Chandra, Spark Hunter", () => {
  it("animates a Vehicle you control with haste at the beginning of combat", () => {
    const { game, a } = table();
    const chandra = enter(game, "Chandra, Spark Hunter");
    loyalty(game, chandra, 0);
    const [vehicle] = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Vehicle Token");
    expect(vehicle).toBeDefined();
    expect(types(game, vehicle)).not.toContain("creature");
    pickTargets(a, vehicle);
    toStep(game, "begin-combat");
    settle(game);
    expect(types(game, vehicle)).toContain("creature");
    expect(keywords(game, vehicle).has("haste")).toBe(true);
  });
});

describe("Liliana, Waker of the Dead", () => {
  it("+1: each player discards; each opponent who can't loses 3 life", () => {
    const { game } = table({ players: 3 });
    game.debugApplyEffect(C, { kind: "discard-hand", who: "you" });
    const mine = hand(game, A).length;
    const bobs = hand(game, B).length;
    const liliana = enter(game, "Liliana, Waker of the Dead");
    loyalty(game, liliana, 1);
    expect(hand(game, A).length).toBe(mine - 1);
    expect(hand(game, B).length).toBe(bobs - 1);
    expect(life(game, B)).toBe(20);
    expect(life(game, C)).toBe(17);
    expect(life(game, A)).toBe(20);
    expect(graveyard(game, A).length).toBeGreaterThan(0);
  });
});
