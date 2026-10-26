/**
 * Gatecrash (GTC; B176), group B. One test per card whose behaviour is more
 * than a stat line or a copy of an already-tested pattern, on the clause most
 * likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

describe("Biovisionary", () => {
  it("wins at the end step with four Biovisionaries, not with three", () => {
    const { game } = table();
    for (let i = 0; i < 3; i++) spawn(game, "Biovisionary");
    toStep(game, "end");
    settle(game);
    expect(game.state.result?.over ?? false).toBe(false);
    spawn(game, "Biovisionary");
    toStep(game, "end");
    settle(game);
    expect(game.state.result).toMatchObject({ over: true, winner: A });
  });
});

describe("Luminate Primordial", () => {
  it("exiles one creature per opponent, each controller gaining its power", () => {
    const { game, a } = table({ players: 3 });
    const bBears = spawn(game, "Grizzly Bears", B);
    const cGiant = spawn(game, "Craw Wurm", C);
    const cPower = pt(game, cGiant).power;
    pickTargets(a, bBears, cGiant);
    enter(game, "Luminate Primordial");
    expect(zone(game, bBears)).toBe("exile");
    expect(zone(game, cGiant)).toBe("exile");
    expect(life(game, B)).toBe(22);
    expect(life(game, C)).toBe(20 + cPower);
    expect(life(game, A)).toBe(20);
  });
});

describe("Balustrade Spy", () => {
  it("mills target player down to and including the first land", () => {
    const { game, a } = table();
    toLibrary(game, "Grizzly Bears", B);
    toLibrary(game, "Grizzly Bears", B);
    const before = graveyard(game, B).length;
    pickTargets(a, B);
    enter(game, "Balustrade Spy");
    expect(graveyard(game, B).length - before).toBe(3);
  });
});

describe("Rubblehulk", () => {
  it("is as big as your lands, and bloodrushes +X/+X for them", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    lands(game, "Forest", 2);
    const hulk = spawn(game, "Rubblehulk");
    expect(pt(game, hulk)).toEqual({ power: 4, toughness: 4 });
    const bears = spawn(game, "Grizzly Bears");
    const card = toHand(game, "Rubblehulk");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A && s.awaiting === null);
    activate(game, card, 0, { targets: [ref(bears)] });
    expect(zone(game, card)).toBe("graveyard");
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Realmwright", () => {
  it("makes your lands the chosen basic land type, not an opponent's", () => {
    const { game } = table();
    const mine = spawn(game, "Wastes");
    const theirs = spawn(game, "Wastes", B);
    const wright = spawn(game, "Realmwright");
    game.state.objects[wright].chosenOnEnter = "Swamp";
    expect(subtypes(game, mine)).toContain("Swamp");
    expect(subtypes(game, mine)).not.toContain("Island");
    expect(subtypes(game, theirs)).not.toContain("Swamp");
  });
});

describe("Predator's Rapport", () => {
  it("gains life equal to the creature's power plus toughness", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Predator's Rapport"), { targets: [ref(bears)] });
    expect(life(game, A)).toBe(24);
  });
});

describe("Sage's Row Denizen", () => {
  it("mills two when another blue creature you control enters, not a green one", () => {
    const { game, a } = table();
    spawn(game, "Sage's Row Denizen");
    pickTargets(a, B);
    const before = graveyard(game, B).length;
    enter(game, "Grizzly Bears");
    expect(graveyard(game, B).length).toBe(before);
    enter(game, "Incursion Specialist");
    expect(graveyard(game, B).length - before).toBe(2);
  });
});

describe("Slate Street Ruffian", () => {
  it("makes the defending player discard when it becomes blocked", () => {
    const { game, a, b } = table();
    const ruffian = spawn(game, "Slate Street Ruffian");
    const wall = spawn(game, "Grizzly Bears", B);
    const before = hand(game, B).length;
    b.declareBlockersFn = () => [{ blocker: wall, attacker: ruffian }];
    attack(game, a, [ruffian]);
    expect(hand(game, B).length).toBe(before - 1);
  });
});

describe("Ordruun Veteran", () => {
  it("gains double strike attacking with two others", () => {
    const { game, a } = table();
    const vet = spawn(game, "Ordruun Veteran");
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Grizzly Bears");
    attack(game, a, [vet, x, y]);
    expect(keywords(game, vet).has("double-strike")).toBe(true);
    expect(life(game, B)).toBe(20 - 6 - 2 - 2);
  });
});

describe("Incursion Specialist", () => {
  it("gets +2/+0 and can't be blocked on your second spell", () => {
    const { game } = table();
    const spec = spawn(game, "Incursion Specialist");
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(pt(game, spec)).toEqual({ power: 1, toughness: 3 });
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(pt(game, spec)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, spec).has("unblockable")).toBe(true);
  });
});

describe("Domri Rade", () => {
  it("+1 puts a creature card on top into your hand if you choose", () => {
    const { game, a } = table();
    const domri = spawn(game, "Domri Rade");
    const top = toLibrary(game, "Grizzly Bears");
    pickModes(a, 0);
    a.chooseFromZoneFn = (_v, eligible) => eligible.slice(0, 1);
    loyalty(game, domri, 1);
    expect(zone(game, top)).toBe("hand");
  });

  it("−7 gives creatures you control double strike, trample, hexproof and haste", () => {
    const { game } = table();
    const domri = spawn(game, "Domri Rade");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    loyalty(game, domri, -7, { atLeast: 7 });
    for (const k of ["double-strike", "trample", "hexproof", "haste"]) expect(keywords(game, bears).has(k)).toBe(true);
    expect(keywords(game, theirs).has("haste")).toBe(false);
  });
});
