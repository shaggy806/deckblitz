/**
 * Nemesis (NEM), batch 1, group B.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
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
  toHand,
  toStep,
  zone,
} from "./harness.js";

describe("Defender en-Vec", () => {
  it("enters with four fade counters, loses one each upkeep, and is sacrificed when it can't", () => {
    const { game } = table();
    const defender = enter(game, "Defender en-Vec");
    expect(counters(game, defender, "fade")).toBe(4);
    game.state.objects[defender].counters.fade = 1;
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, defender)).toBe("battlefield");
    expect(counters(game, defender, "fade")).toBe(0);
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, defender)).toBe("graveyard");
  });

  it("removes a fade counter to prevent the next 2 damage", () => {
    const { game } = table();
    const defender = enter(game, "Defender en-Vec");
    activate(game, defender, 0, { targets: [ref(A)] });
    expect(counters(game, defender, "fade")).toBe(3);
    game.debugApplyEffect(B, { kind: "damage", amount: 3, target: 0 }, [ref(A)]);
    settle(game);
    expect(life(game, A)).toBe(19);
  });
});

describe("Rupture", () => {
  it("deals the sacrificed creature's power to each creature without flying and each player", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears", B);
    const drake = spawn(game, "Wind Drake", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Rupture"));
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, drake)).toBe("battlefield");
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(17);
  });
});

describe("Laccolith Titan", () => {
  it("may deal its power to any creature when blocked, then assigns no combat damage", () => {
    const { game, a, b } = table();
    const titan = spawn(game, "Laccolith Titan");
    const bears = spawn(game, "Grizzly Bears", B);
    const drake = spawn(game, "Wind Drake", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: titan }];
    pickTargets(a, drake);
    pickModes(a, 0);
    attack(game, a, [titan]);
    expect(zone(game, drake)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("deals combat damage as normal when you decline", () => {
    const { game, a, b } = table();
    const titan = spawn(game, "Laccolith Titan");
    const bears = spawn(game, "Grizzly Bears", B);
    const drake = spawn(game, "Wind Drake", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: titan }];
    pickTargets(a, drake);
    pickModes(a);
    attack(game, a, [titan]);
    expect(zone(game, drake)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Flint Golem", () => {
  it("makes the defending player mill three when it becomes blocked", () => {
    const { game, a, b } = table();
    const golem = spawn(game, "Flint Golem");
    const bears = spawn(game, "Grizzly Bears", B);
    const before = graveyard(game, B).length;
    b.declareBlockersFn = () => [{ blocker: bears, attacker: golem }];
    attack(game, a, [golem]);
    expect(graveyard(game, B).length - before).toBe(4); // three milled, plus the Bears
  });
});

describe("Stampede Driver", () => {
  it("discards a card to give creatures you control +1/+1 and trample", () => {
    const { game } = table();
    const driver = spawn(game, "Stampede Driver");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    const before = hand(game).length;
    activate(game, driver, 0);
    expect(hand(game).length).toBe(before - 1);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("trample")).toBe(true);
  });
});

describe("Refreshing Rain", () => {
  it("is free while an opponent controls a Swamp and you control a Forest", () => {
    const { game } = table();
    spawn(game, "Swamp", B);
    spawn(game, "Forest");
    cast(game, toHand(game, "Refreshing Rain"), { targets: [ref(A)], free: true });
    expect(life(game, A)).toBe(26);
  });
});
