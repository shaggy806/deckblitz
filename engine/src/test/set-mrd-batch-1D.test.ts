/**
 * Mirrodin (MRD; B215), group D. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  enter,
  keywords,
  lands,
  nextTurn,
  pickFromZone,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("Reiver Demon", () => {
  it("cast from hand, destroys nonartifact, nonblack creatures only", () => {
    const { game } = table();
    lands(game, "Swamp", 8);
    const bears = spawn(game, "Grizzly Bears", B);
    const nighthawk = spawn(game, "Vampire Nighthawk", B);
    const thopter = spawn(game, "Ornithopter", B);
    const demon = toHand(game, "Reiver Demon");
    cast(game, demon);
    expect(zone(game, demon)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, nighthawk)).toBe("battlefield");
    expect(zone(game, thopter)).toBe("battlefield");
  });

  it("put onto the battlefield without being cast, it destroys nothing", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    enter(game, "Reiver Demon");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Gate to the Aether", () => {
  it("on another player's upkeep, that player may put their revealed creature onto the battlefield", () => {
    const { game, b } = table();
    spawn(game, "Gate to the Aether");
    const bears = toLibrary(game, "Grizzly Bears", B);
    pickFromZone(b, bears);
    nextTurn(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(B);
  });
});

describe("Taj-Nar Swordsmith", () => {
  it("paying X = 2 finds an Equipment with mana value 2 or less", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const splitter = toLibrary(game, "Bonesplitter");
    const hammer = toLibrary(game, "Loxodon Warhammer");
    const seen = pickFromZone(a, splitter);
    enter(game, "Taj-Nar Swordsmith", A, { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "choose-modes");
    game.dispatch({ type: "choose-modes", player: A, modes: [0], xValue: 2 });
    settle(game);
    expect(seen.offered).toContain(splitter);
    expect(seen.offered).not.toContain(hammer);
    expect(zone(game, splitter)).toBe("battlefield");
    expect(zone(game, hammer)).toBe("library");
  });
});

describe("Solar Tide", () => {
  it("entwined by sacrificing two lands, destroys both small and large creatures", () => {
    const { game } = table();
    const plains = lands(game, "Plains", 8);
    const bears = spawn(game, "Grizzly Bears", B);
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Solar Tide"), { kicked: true, modes: [0, 1] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, angel)).toBe("graveyard");
    expect(plains.filter((id) => zone(game, id) === "graveyard")).toHaveLength(2);
  });

  it("one mode alone spares the other side", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    const bears = spawn(game, "Grizzly Bears", B);
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Solar Tide"), { modes: [1] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, angel)).toBe("graveyard");
  });
});

describe("Clockwork Vorrac", () => {
  it("enters with four counters and loses one at end of combat after attacking", () => {
    const { game, a } = table();
    const vorrac = enter(game, "Clockwork Vorrac");
    expect(pt(game, vorrac)).toEqual({ power: 4, toughness: 4 });
    attack(game, a, [vorrac]);
    expect(counters(game, vorrac)).toBe(3);
  });
});

describe("Irradiate", () => {
  it("-1/-1 for each artifact you control", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    spawn(game, "Ornithopter");
    spawn(game, "Ornithopter");
    spawn(game, "Memnite");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Irradiate"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Broodstar", () => {
  it("is as big as the number of artifacts you control", () => {
    const { game } = table();
    const star = spawn(game, "Broodstar");
    spawn(game, "Ornithopter");
    spawn(game, "Memnite");
    spawn(game, "Ornithopter", B);
    expect(pt(game, star)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Heartwood Shard", () => {
  it("the {G}, {T} cost grants trample", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const shard = spawn(game, "Heartwood Shard");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, shard, 1, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("trample")).toBe(true);
  });
});

describe("Domineer", () => {
  it("takes an artifact creature, and can't enchant a plain creature", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const thopter = spawn(game, "Ornithopter", B);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "Domineer"), { targets: [ref(bears)] })).toThrow();
    cast(game, toHand(game, "Domineer"), { targets: [ref(thopter)] });
    expect(controller(game, thopter)).toBe(A);
  });
});
