/**
 * R3 group E rechecks: cards once blocked on delayed-trigger extensions,
 * a token created attached, damage to a trigger object's controller and an
 * X-sized division. Each test written from the card's Oracle text and
 * rulings, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import { isGoaded } from "../goad.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  lands,
  life,
  named,
  nextTurn,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  keywords,
  zone,
} from "./harness.js";

describe("R3 group E", () => {
  it("The Rani creates Mark of the Rani attached to another creature, which pumps and goads it", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    enter(game, "The Rani");
    const [mark] = named(game, "Mark of the Rani Token");
    expect(mark).toBeDefined();
    expect(game.state.objects[mark].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(isGoaded(game.state, game.registry, bears)).toBe(true);
  });

  it("Assembled Alphas deals 3 to the creature blocking it and 3 to that creature's controller", () => {
    const { game, a, b } = table();
    const alphas = spawn(game, "Assembled Alphas");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: alphas }];
    attack(game, a, [alphas]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(20);
  });

  it("Bonus Round: the caster copies their instant", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Bonus Round"));
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
  });

  it("Dalkovan Encampment's delayed trigger makes two attacking Warriors when you attack", () => {
    const { game, a } = table();
    spawn(game, "Swamp");
    const camp = spawn(game, "Dalkovan Encampment");
    lands(game, "Plains", 3);
    activate(game, camp, 1);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(tokensNamed(game, "Red Warrior Token", A)).toBe(2);
    expect(life(game, B)).toBe(16);
  });

  it("Depthshaker Titan animates the targeted artifacts and sacrifices them at the next end step", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring");
    pickTargets(a, ring);
    enter(game, "Depthshaker Titan");
    expect(types(game, ring)).toContain("creature");
    expect(pt(game, ring)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, ring).has("haste")).toBe(true);
    toStep(game, "cleanup");
    expect(zone(game, ring)).toBe("graveyard");
  });

  it("Rite of Harmony draws when a creature you control enters this turn", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Rite of Harmony"));
    const before = hand(game).length;
    enter(game, "Grizzly Bears");
    expect(hand(game).length).toBe(before + 1);
    enter(game, "Grizzly Bears", B);
    expect(hand(game).length).toBe(before + 1);
  });

  it("Summon: Leviathan's chapter I returns each creature that isn't a sea type", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const looter = spawn(game, "Merfolk Looter", B);
    const leviathan = enter(game, "Summon: Leviathan");
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, looter)).toBe("battlefield");
    expect(zone(game, leviathan)).toBe("battlefield");
  });

  it("Tamiyo Meets the Story Circle: until your next turn, attackers get -2/-0", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    enter(game, "Tamiyo Meets the Story Circle");
    nextTurn(game);
    b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
    toStep(game, "declare-blockers", B);
    expect(pt(game, bears)).toEqual({ power: 0, toughness: 2 });
  });

  it("Tamiyo's chapter II investigates twice per card discarded", () => {
    const { game, a } = table();
    const saga = enter(game, "Tamiyo Meets the Story Circle");
    a.chooseDiscardsFn = (cards) => cards.slice(0, 2).map((c) => c.id);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "lore", amount: 1 }, [ref(saga)]);
    settle(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(4);
  });

  it("Waltz of Rage: the creature deals its power to each other creature, and your deaths impulse-draw", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    toLibrary(game, "Shock");
    lands(game, "Mountain", 5);
    pickTargets(a, giant);
    cast(game, toHand(game, "Waltz of Rage"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(game.state.zones.shared.exile.length).toBe(1);
  });

  it("Grove's Bounty distributes X counters among its targets", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    lands(game, "Forest", 4);
    const otter = toHand(game, "Elusive Otter");
    cast(game, otter, { face: 1, x: 3, targets: [ref(bears), ref(elves)], division: [2, 1] });
    expect(counters(game, bears)).toBe(2);
    expect(counters(game, elves)).toBe(1);
    expect(zone(game, otter)).toBe("exile");
  });
});
