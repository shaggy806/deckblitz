/**
 * Mercadian Masques (MMQ), batch 2, group A.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  grant,
  graveyard,
  hand,
  keywords,
  lands,
  named,
  pickFromZone,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Ferocity", () => {
  it("puts a +1/+1 counter on the enchanted creature when it blocks", () => {
    const { game, a, b } = table();
    lands(game, "Forest", 2);
    const giant = spawn(game, "Hill Giant");
    pickModes(a, 0);
    cast(game, toHand(game, "Ferocity"), { targets: [ref(giant)] });
    expect(named(game, "Ferocity")).toHaveLength(1);
    // Bob attacks into the enchanted blocker on his turn.
    toStep(game, "precombat-main", B);
    const bears = spawn(game, "Grizzly Bears", B);
    a.declareBlockersFn = () => [{ blocker: giant, attacker: bears }];
    attack(game, b, [bears], A);
    expect(counters(game, giant)).toBe(1);
  });

  it("puts one on the enchanted attacker when it becomes blocked, and none if declined", () => {
    const { game, a, b } = table();
    lands(game, "Forest", 2);
    const giant = spawn(game, "Hill Giant");
    pickModes(a, 0);
    cast(game, toHand(game, "Ferocity"), { targets: [ref(giant)] });
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: giant }];
    attack(game, a, [giant]);
    expect(counters(game, giant)).toBe(1);
    pickModes(a);
    const elves = spawn(game, "Llanowar Elves", B);
    b.declareBlockersFn = () => [{ blocker: elves, attacker: giant }];
    toStep(game, "precombat-main");
    attack(game, a, [giant]);
    expect(counters(game, giant)).toBe(1);
  });
});

describe("Chameleon Spirit", () => {
  it("is as big as the permanents of the chosen color its opponents control", () => {
    const { game } = table();
    const spirit = spawn(game, "Chameleon Spirit");
    game.state.objects[spirit].chosenOnEnter = "G";
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Llanowar Elves", B);
    spawn(game, "Hill Giant", B);
    spawn(game, "Grizzly Bears", A);
    expect(pt(game, spirit)).toEqual({ power: 2, toughness: 2 });
    game.state.objects[spirit].chosenOnEnter = "R";
    expect(pt(game, spirit)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Nether Spirit", () => {
  it("returns at upkeep when it's the only creature card in your graveyard", () => {
    const { game, a } = table();
    const spirit = toGraveyard(game, "Nether Spirit");
    toGraveyard(game, "Shock");
    pickModes(a, 0);
    toStep(game, "draw");
    expect(zone(game, spirit)).toBe("battlefield");
  });

  it("stays when another creature card is in your graveyard", () => {
    const { game, a } = table();
    const spirit = toGraveyard(game, "Nether Spirit");
    toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    toStep(game, "draw");
    expect(zone(game, spirit)).toBe("graveyard");
  });
});

describe("Robber Fly", () => {
  it("makes the defending player discard their hand and draw that many", () => {
    const { game, a, b } = table();
    const fly = spawn(game, "Robber Fly");
    const wall = spawn(game, "Wall of Wood", B);
    const kept = [toHand(game, "Shock", B), toHand(game, "Grizzly Bears", B)];
    const before = hand(game, B).length;
    b.declareBlockersFn = () => [{ blocker: wall, attacker: fly }];
    grant(game, wall, "reach");
    attack(game, a, [fly]);
    expect(hand(game, B)).toHaveLength(before);
    for (const id of kept) expect(zone(game, id)).toBe("graveyard");
    expect(graveyard(game, B).length).toBeGreaterThanOrEqual(before);
  });
});

describe("Corrupt Official", () => {
  it("makes the defending player discard a card at random when blocked", () => {
    const { game, a, b } = table();
    const official = spawn(game, "Corrupt Official");
    const bears = spawn(game, "Grizzly Bears", B);
    const before = hand(game, B).length;
    b.declareBlockersFn = () => [{ blocker: bears, attacker: official }];
    attack(game, a, [official]);
    expect(hand(game, B)).toHaveLength(before - 1);
  });
});

describe("Mercadian Lift", () => {
  it("removes X winch counters to put a creature card with mana value X from hand", () => {
    const { game, a } = table();
    lands(game, "Wastes", 2);
    const lift = spawn(game, "Mercadian Lift");
    activate(game, lift, 0);
    expect(counters(game, lift, "winch")).toBe(1);
    game.state.objects[lift].tapped = false;
    game.state.objects[lift].counters.winch = 2;
    const bears = toHand(game, "Grizzly Bears");
    const giant = toHand(game, "Hill Giant");
    const seen = pickFromZone(a, bears);
    activate(game, lift, 1, { x: 2 });
    expect(seen.offered).toContain(bears);
    expect(seen.offered).not.toContain(giant);
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, lift, "winch")).toBe(0);
  });
});

describe("Saprazzan Breaker", () => {
  it("can't be blocked this turn once it mills a land card, but can after milling a nonland", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const breaker = spawn(game, "Saprazzan Breaker");
    toLibrary(game, "Shock");
    activate(game, breaker, 0);
    expect(keywords(game, breaker).has("unblockable")).toBe(false);
    toLibrary(game, "Forest");
    activate(game, breaker, 0);
    expect(keywords(game, breaker).has("unblockable")).toBe(true);
  });
});

describe("Saprazzan Raider", () => {
  it("returns to its owner's hand when it becomes blocked", () => {
    const { game, a, b } = table();
    const raider = spawn(game, "Saprazzan Raider");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: raider }];
    attack(game, a, [raider]);
    expect(zone(game, raider)).toBe("hand");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Delraich", () => {
  it("can be cast by sacrificing three black creatures", () => {
    const { game } = table();
    const black = [spawn(game, "Nether Spirit"), spawn(game, "Rampart Crawler"), spawn(game, "Molting Harpy")];
    const bears = spawn(game, "Grizzly Bears");
    const delraich = toHand(game, "Delraich");
    cast(game, delraich, { altCost: true });
    expect(zone(game, delraich)).toBe("battlefield");
    for (const id of black) expect(zone(game, id)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Squeeze", () => {
  it("makes sorcery spells cost {3} more", () => {
    const { game } = table();
    spawn(game, "Squeeze", B);
    lands(game, "Island", 3);
    expect(() => cast(game, toHand(game, "Tome Scour"), { targets: [ref(B)], settle: false })).toThrow();
    lands(game, "Island", 1);
    cast(game, toHand(game, "Tome Scour"), { targets: [ref(B)] });
    expect(graveyard(game, B)).toHaveLength(5);
  });
});
