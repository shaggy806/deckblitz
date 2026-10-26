/**
 * Portal / Portal Second Age, group C (batch 190): Temple Elder and Norwood
 * Priestess ("activate only during your turn, before attackers are
 * declared"), Final Strike, Fire Dragon, Alaborn Zealot, Sylvan Basilisk,
 * Rain of Salt, Predatory Nightstalker, Ebon Dragon, Goblin General,
 * Valorous Charge, Burning Cloak, Theft of Dreams.
 */
import { describe, expect, it } from "vitest";
import type { Action } from "../actions.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  enter,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const tapAbility = (source: ObjectId): Action =>
  ({ type: "activate-ability", player: A, source, abilityIndex: 0, targets: [] }) as unknown as Action;

describe("Temple Elder", () => {
  it("is activated in your precombat main phase, not in your second main phase or on an opponent's turn", () => {
    const { game } = table();
    const elder = spawn(game, "Temple Elder");
    const before = life(game);
    activate(game, elder);
    expect(life(game)).toBe(before + 1);

    game.state.objects[elder].tapped = false;
    toStep(game, "postcombat-main");
    expect(game.canDispatch(tapAbility(elder))).not.toBeNull();

    nextTurn(game); // bob's turn
    game.state.objects[elder].tapped = false;
    game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");
    expect(game.canDispatch(tapAbility(elder))).not.toBeNull();
  });
});

describe("Norwood Priestess", () => {
  it("puts a green creature card from your hand onto the battlefield; the second main phase is too late", () => {
    const { game, a } = table();
    const priestess = spawn(game, "Norwood Priestess");
    const bears = toHand(game, "Grizzly Bears");
    const giant = toHand(game, "Hill Giant");
    const seen = pickFromZone(a, bears);
    activate(game, priestess);
    expect(seen.offered).toContain(bears);
    expect(seen.offered).not.toContain(giant);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, giant)).toBe("hand");

    game.state.objects[priestess].tapped = false;
    toStep(game, "postcombat-main");
    expect(game.canDispatch(tapAbility(priestess))).not.toBeNull();
  });
});

describe("Final Strike", () => {
  it("deals damage equal to the sacrificed creature's power to the target opponent", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    lands(game, "Swamp", 4);
    const before = life(game, B);
    game.dispatch({ type: "cast-spell", player: A, card: toHand(game, "Final Strike"), targets: [ref(B)], sacrifice: giant } as Action);
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(before - 3);
  });
});

describe("Fire Dragon", () => {
  it("deals damage to the target creature equal to the Mountains you control", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const giant = spawn(game, "Hill Giant", B);
    const lions = spawn(game, "Savannah Lions", B);
    pickTargets(a, giant);
    enter(game, "Fire Dragon");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, lions)).toBe("battlefield");
  });
});

describe("Alaborn Zealot", () => {
  it("blocking destroys both it and the creature it blocks", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant");
    const zealot = spawn(game, "Alaborn Zealot", B);
    b.declareBlockersFn = () => [{ blocker: zealot, attacker: giant }];
    attack(game, a, [giant]);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, zealot)).toBe("graveyard");
  });
});

describe("Sylvan Basilisk", () => {
  it("destroys each creature that blocks it", () => {
    const { game, a, b } = table();
    const basilisk = spawn(game, "Sylvan Basilisk");
    const giant = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker: giant, attacker: basilisk }];
    attack(game, a, [basilisk]);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, basilisk)).toBe("battlefield");
  });
});

describe("Rain of Salt", () => {
  it("destroys two target lands", () => {
    const { game } = table();
    lands(game, "Mountain", 6);
    const [x, y] = lands(game, "Forest", 2, B);
    const rain = toHand(game, "Rain of Salt");
    expect(() => cast(game, rain, { targets: [ref(x)] })).toThrow();
    cast(game, rain, { targets: [ref(x), ref(y)] });
    expect(zone(game, x)).toBe("graveyard");
    expect(zone(game, y)).toBe("graveyard");
  });
});

describe("Predatory Nightstalker", () => {
  it("may have the target opponent sacrifice a creature", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, B);
    pickModes(a, 0);
    enter(game, "Predatory Nightstalker");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Ebon Dragon", () => {
  it("may have the target opponent discard a card", () => {
    const { game, a } = table();
    const before = hand(game, B).length;
    pickTargets(a, B);
    pickModes(a, 0);
    enter(game, "Ebon Dragon");
    expect(hand(game, B).length).toBe(before - 1);
    expect(graveyard(game, B).length).toBe(1);
  });
});

describe("Goblin General", () => {
  it("attacking gives Goblin creatures you control +1/+1, not other creatures", () => {
    const { game, a } = table();
    const general = spawn(game, "Goblin General");
    const goblin = spawn(game, "Raging Goblin");
    const giant = spawn(game, "Hill Giant");
    a.declareAttackersFn = () => [{ attacker: general, defender: B }];
    toStep(game, "declare-blockers");
    expect(pt(game, general)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, goblin)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Valorous Charge", () => {
  it("gives white creatures +2/+0 until end of turn", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const lions = spawn(game, "Savannah Lions");
    const theirLions = spawn(game, "Savannah Lions", B);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Valorous Charge"));
    expect(pt(game, lions)).toEqual({ power: 4, toughness: 1 });
    expect(pt(game, theirLions)).toEqual({ power: 4, toughness: 1 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Burning Cloak", () => {
  it("gives +2/+0 and deals 2 damage to the same creature", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    cast(game, toHand(game, "Burning Cloak"), { targets: [{ kind: "object", object: giant }] });
    expect(pt(game, giant)).toEqual({ power: 5, toughness: 3 });
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });
});

describe("Theft of Dreams", () => {
  it("draws a card for each tapped creature the target opponent controls", () => {
    const { game } = table();
    lands(game, "Island", 3);
    spawn(game, "Grizzly Bears", B, { tapped: true });
    spawn(game, "Hill Giant", B, { tapped: true });
    spawn(game, "Savannah Lions", B);
    spawn(game, "Savannah Lions", A, { tapped: true });
    const card = toHand(game, "Theft of Dreams");
    const before = hand(game).length;
    cast(game, card, { targets: [{ kind: "player", player: B }] });
    expect(hand(game).length).toBe(before - 1 + 2);
  });
});
