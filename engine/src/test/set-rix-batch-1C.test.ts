/**
 * Rivals of Ixalan, group C: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** Pass priority far enough for a state-based check (the city's blessing). */
const check = (game: Game): void => toStep(game, "begin-combat");
const loyaltyOf = (game: Game, id: ObjectId): number => game.state.objects[id].counters.loyalty ?? 0;

describe("Golden Guardian // Gold-Forge Garrison", () => {
  it("fights your own creature; dying this turn, it returns transformed", () => {
    const { game, a } = table();
    const guardian = spawn(game, "Golden Guardian");
    const wurm = spawn(game, "Colossal Dreadmaw");
    lands(game, "Wastes", 2);
    pickTargets(a, wurm);
    activate(game, guardian, 0, { targets: [ref(wurm)] });
    const back = game.battlefield.filter((id) => game.state.objects[id].cardName === "Golden Guardian");
    expect(back.length).toBe(1);
    expect(game.state.objects[back[0]].face).toBe(1);
    expect(game.state.objects[back[0]].controller).toBe(A);
    expect(zone(game, wurm)).toBe("battlefield");
  });

  it("a fight it survives sets nothing off later", () => {
    const { game, a } = table();
    const guardian = spawn(game, "Golden Guardian");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 2);
    pickTargets(a, bears);
    activate(game, guardian, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[guardian].face ?? 0).toBe(0);
  });
});

describe("Trapjaw Tyrant", () => {
  it("exiles until it leaves; dealt lethal damage, its trigger exiles nothing", () => {
    const { game, a } = table();
    const tyrant = spawn(game, "Trapjaw Tyrant");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(tyrant)]);
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    const other = spawn(game, "Grizzly Bears", B);
    pickTargets(a, other);
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(tyrant)]);
    settle(game);
    expect(zone(game, tyrant)).toBe("graveyard");
    // The first one came back as the Tyrant left; the second trigger found
    // its source gone and exiled nothing.
    expect(zone(game, other)).toBe("battlefield");
    const returned = game.battlefield.filter((id) => game.state.objects[id].cardName === "Grizzly Bears");
    expect(returned.length).toBe(2);
  });
});

describe("Huatli, Radiant Champion", () => {
  it("+1 adds a loyalty counter for each creature you control, on top of its cost", () => {
    const { game } = table();
    const huatli = spawn(game, "Huatli, Radiant Champion");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    loyalty(game, huatli, 1, { atLeast: 3 });
    expect(loyaltyOf(game, huatli)).toBe(6);
  });
});

describe("Tetzimoc, Primal Death", () => {
  it("marks prey from the hand during your turn only, then destroys only opponents' prey", () => {
    const { game } = table();
    const tetzimoc = toHand(game, "Tetzimoc, Primal Death");
    lands(game, "Swamp", 2);
    const theirs = spawn(game, "Grizzly Bears", B);
    const theirOther = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    activate(game, tetzimoc, 0, { targets: [ref(theirs)] });
    activate(game, tetzimoc, 0, { targets: [ref(mine)] });
    expect(zone(game, tetzimoc)).toBe("hand");
    expect(counters(game, theirs, "prey")).toBe(1);
    expect(counters(game, mine, "prey")).toBe(1);
    enter(game, "Tetzimoc, Primal Death");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, theirOther)).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
  });

  it("can't be activated on an opponent's turn", () => {
    const { game } = table();
    const tetzimoc = toHand(game, "Tetzimoc, Primal Death");
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    toStep(game, "upkeep", B);
    expect(() => activate(game, tetzimoc, 0, { player: A, targets: [ref(bears)] })).toThrow();
  });
});

describe("Admiral's Order", () => {
  it("costs {U} only once you've attacked this turn", () => {
    const { game, a } = table();
    const corsair = spawn(game, "Kitesail Corsair");
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    const order = toHand(game, "Admiral's Order");
    cast(game, bears, { settle: false });
    const [island] = lands(game, "Island", 1);
    expect(() => cast(game, order, { targets: [ref(bears)], altCost: true, settle: false })).toThrow();
    settle(game);
    a.declareAttackersFn = () => [{ attacker: corsair, defender: B }];
    toStep(game, "postcombat-main");
    // Keep the Island for the Order: the Bears are paid from new Forests.
    game.state.objects[island].tapped = true;
    const second = toHand(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    cast(game, second, { settle: false });
    game.state.objects[island].tapped = false;
    cast(game, order, { targets: [ref(second)], altCost: true });
    expect(zone(game, second)).toBe("graveyard");
    expect(zone(game, order)).toBe("graveyard");
  });
});

describe("Kumena's Awakening", () => {
  it("each player draws, or only you once you have the city's blessing", () => {
    const { game } = table();
    spawn(game, "Kumena's Awakening");
    toStep(game, "upkeep");
    let [a0, b0] = [hand(game).length, hand(game, B).length];
    settle(game);
    expect([hand(game).length - a0, hand(game, B).length - b0]).toEqual([1, 1]);
    lands(game, "Island", 9);
    check(game);
    expect(game.state.players[A].citysBlessing).toBe(true);
    toStep(game, "upkeep");
    [a0, b0] = [hand(game).length, hand(game, B).length];
    settle(game);
    expect([hand(game).length - a0, hand(game, B).length - b0]).toEqual([1, 0]);
  });
});

describe("Fathom Fleet Boarder", () => {
  it("costs 2 life unless you control another Pirate", () => {
    const { game } = table();
    enter(game, "Fathom Fleet Boarder");
    expect(life(game)).toBe(18);
    spawn(game, "Kitesail Corsair");
    enter(game, "Fathom Fleet Boarder");
    expect(life(game)).toBe(18);
  });
});

describe("Kitesail Corsair", () => {
  it("has flying only while attacking", () => {
    const { game, a } = table();
    const corsair = spawn(game, "Kitesail Corsair");
    expect(keywords(game, corsair).has("flying")).toBe(false);
    a.declareAttackersFn = () => [{ attacker: corsair, defender: B }];
    toStep(game, "declare-blockers");
    expect(keywords(game, corsair).has("flying")).toBe(true);
  });
});

describe("Detective of the Month", () => {
  it("makes a Detective on your second draw, and Detectives are unblockable with the blessing", () => {
    const { game } = table();
    const detective = spawn(game, "Detective of the Month");
    // Alice drew her first card of the turn in her draw step.
    game.debugApplyEffect(A, { kind: "draw", amount: 2 });
    settle(game);
    expect(tokensNamed(game, "Detective Token", A)).toBe(1);
    expect(keywords(game, detective).has("unblockable")).toBe(false);
    lands(game, "Island", 8);
    check(game);
    expect(keywords(game, detective).has("unblockable")).toBe(true);
  });
});
