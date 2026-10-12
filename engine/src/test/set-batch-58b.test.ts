/**
 * The set walk, batch 58, part b (2026-10-11): Marvel Super Heroes. Written
 * on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

const stackAbilities = (game: ReturnType<typeof table>["game"]): ObjectId[] =>
  game.state.zones.shared.stack.filter((id) => game.state.objects[id].kind === "ability");

describe("Agent Phil Coulson", () => {
  it("puts a +1/+1 counter on each other Hero you control, not on itself, a non-Hero or an opponent's Hero", () => {
    const { game } = table();
    const phil = spawn(game, "Agent Phil Coulson");
    const hero = spawn(game, "Iron Lad, Diverging Destiny");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Echo, Perceptive Prodigy", B);
    activate(game, phil);
    expect(counters(game, hero)).toBe(1);
    expect(counters(game, phil)).toBe(0);
    expect(counters(game, bears)).toBe(0);
    expect(counters(game, theirs)).toBe(0);
  });
});

describe("Training Regimen", () => {
  it("puts a counter on target creature you control as combat begins, and creatures with +1/+1 counters have trample", () => {
    const { game, a } = table();
    spawn(game, "Training Regimen");
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.state.objects[theirs].counters["+1/+1"] = 1;
    expect(keywords(game, bears).has("trample")).toBe(false);
    pickTargets(a, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(keywords(game, other).has("trample")).toBe(false);
    expect(keywords(game, theirs).has("trample")).toBe(false);
  });
});

describe("Ares, God of War", () => {
  it("returns an attacking creature you control that dies to its owner's hand — Ares too — but not one that wasn't attacking", () => {
    const { game, a, b } = table();
    const ares = spawn(game, "Ares, God of War");
    const bears = spawn(game, "Grizzly Bears");
    const home = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const rats = spawn(game, "Typhoid Rats", B);
    b.declareBlockersFn = () => [
      { blocker: giant, attacker: bears },
      { blocker: rats, attacker: ares },
    ];
    attack(game, a, [ares, bears]);
    settle(game);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, ares)).toBe("hand");

    // A second Ares, not attacking: a creature that dies outside combat stays.
    spawn(game, "Ares, God of War");
    destroy(game, home);
    expect(zone(game, home)).toBe("graveyard");
  });
});

describe("Echo, Perceptive Prodigy", () => {
  it("copies an ability you control from a creature source, never one from an artifact", () => {
    const { game, a } = table();
    const echo = spawn(game, "Echo, Perceptive Prodigy");
    const rod = spawn(game, "Rod of Ruin");
    const sorcerer = spawn(game, "Prodigal Sorcerer");
    lands(game, "Wastes", 5);
    activate(game, rod, 0, { targets: [ref(B)], settle: false });
    const rodAbility = stackAbilities(game)[0];
    expect(() => activate(game, echo, 0, { targets: [ref(rodAbility)], settle: false })).toThrow();
    settle(game);
    expect(life(game, B)).toBe(19);

    activate(game, sorcerer, 0, { targets: [ref(B)], settle: false });
    const pinger = stackAbilities(game)[0];
    pickTargets(a, B);
    activate(game, echo, 0, { targets: [ref(pinger)] });
    expect(life(game, B)).toBe(17);
  });
});

describe("The Mighty Thor, Jane Foster", () => {
  it("flickers up to one target nontoken artifact or creature tapped as she attacks, and draws when an Equipment enters", () => {
    const { game, a } = table();
    const thor = spawn(game, "The Mighty Thor, Jane Foster");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 1 });
    const [token] = named(game, "Soldier Token", B);
    const stint = game.state.objects[theirs].zoneChangeCount ?? 0;
    const seen = watchTargets(a, () => [theirs]);
    attack(game, a, [thor]);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(theirs);
    expect(seen.offered[0]).not.toContain(token);
    // Exiled and back (a new stint: out to exile and in again), tapped, under
    // its owner's control.
    expect(zone(game, theirs)).toBe("battlefield");
    expect(game.state.objects[theirs].zoneChangeCount ?? 0).toBeGreaterThan(stint);
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(game.state.objects[theirs].controller).toBe(B);
    expect(game.eventsOfType("permanent-left-battlefield").some((e) => e.object === theirs)).toBe(true);

    const before = hand(game).length;
    enter(game, "Bonesplitter");
    expect(hand(game).length).toBe(before + 1);
    enter(game, "Bonesplitter", B);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Iron Lad, Diverging Destiny", () => {
  it("reveals the top card and draws only if it's an artifact card", () => {
    const { game } = table();
    const lad = spawn(game, "Iron Lad, Diverging Destiny");
    const before = hand(game).length;
    activate(game, lad);
    expect(hand(game).length).toBe(before);
    game.state.objects[lad].tapped = false;
    const thopter = toLibrary(game, "Ornithopter");
    activate(game, lad);
    expect(hand(game)).toContain(thopter);
  });
});

describe("Iron Man, Master of Machines", () => {
  it("gets +1/+0 for each other artifact, and draws on attack only if an artifact entered under your control this turn", () => {
    const { game, a } = table();
    const ironMan = spawn(game, "Iron Man, Master of Machines");
    expect(pt(game, ironMan)).toEqual({ power: 1, toughness: 4 });
    spawn(game, "Ornithopter");
    spawn(game, "Ornithopter", B);
    expect(pt(game, ironMan)).toEqual({ power: 2, toughness: 4 });

    // Alice's next turn: nothing has entered.
    toStep(game, "precombat-main");
    const before = hand(game).length;
    attack(game, a, [ironMan]);
    expect(hand(game).length).toBe(before);

    // The turn after: an artifact enters under her control first.
    toStep(game, "precombat-main");
    enter(game, "Memnite");
    const then = hand(game).length;
    attack(game, a, [ironMan]);
    expect(hand(game).length).toBe(then + 1);
  });

  it("doesn't count an artifact entering under an opponent's control", () => {
    const { game, a } = table();
    const ironMan = spawn(game, "Iron Man, Master of Machines");
    toStep(game, "precombat-main");
    enter(game, "Memnite", B);
    const before = hand(game).length;
    attack(game, a, [ironMan]);
    expect(hand(game).length).toBe(before);
  });
});

describe("Restorative Technique", () => {
  it("has the target player gain 2 life and put a basic land from their library onto the battlefield tapped, and counters up to one creature", () => {
    const { game, a, b } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    const forest = toLibrary(game, "Forest", B);
    pickFromZone(b, forest);
    pickTargets(a, B, bears);
    cast(game, toHand(game, "Restorative Technique"), { targets: [ref(B), ref(bears)] });
    expect(life(game, B)).toBe(22);
    expect(life(game, A)).toBe(20);
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].controller).toBe(B);
    expect(game.state.objects[forest].tapped).toBe(true);
    expect(counters(game, bears)).toBe(1);
  });

  it("can be cast with no creature target", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Restorative Technique"), { targets: [ref(A), null] });
    expect(life(game, A)).toBe(22);
  });
});

describe("Captain America, Wings of Freedom", () => {
  it("gives each other Hero you control +X/+X as he attacks, X his toughness then", () => {
    const { game, a } = table();
    const cap = spawn(game, "Captain America, Wings of Freedom");
    game.state.objects[cap].counters["+1/+1"] = 2; // a 5/3
    const hero = spawn(game, "Iron Lad, Diverging Destiny");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Echo, Perceptive Prodigy", B);
    attack(game, a, [cap]);
    expect(pt(game, hero)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, cap)).toEqual({ power: 5, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 4 });
  });
});
