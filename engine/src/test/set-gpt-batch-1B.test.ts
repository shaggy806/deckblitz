/**
 * Guildpact (GPT; B206), group B. One test per card whose behaviour is more
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
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickTargets,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

describe("Hissing Miasma", () => {
  it("makes the controller of a creature attacking you lose 1 life", () => {
    const { game, b } = table();
    spawn(game, "Hissing Miasma");
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    attack(game, b, [bears], A);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(18);
  });
});

describe("Poisonbelly Ogre", () => {
  it("makes the entering creature's controller lose 1 life", () => {
    const { game } = table();
    spawn(game, "Poisonbelly Ogre");
    enter(game, "Grizzly Bears", B);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
  });
});

describe("Sky Swallower", () => {
  it("gives the target opponent every other permanent you control", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const [forest] = lands(game, "Forest", 1);
    pickTargets(a, B);
    const swallower = enter(game, "Sky Swallower");
    expect(controller(game, bears)).toBe(B);
    expect(controller(game, forest)).toBe(B);
    expect(controller(game, swallower)).toBe(A);
  });
});

describe("Skarrgan Firebird", () => {
  it("enters with three counters and returns from the graveyard only once an opponent was dealt damage", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const inYard = toGraveyard(game, "Skarrgan Firebird");
    expect(() => activate(game, inYard)).toThrow();
    const plain = enter(game, "Skarrgan Firebird");
    expect(counters(game, plain)).toBe(0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    const thirsty = enter(game, "Skarrgan Firebird");
    expect(counters(game, thirsty)).toBe(3);
    expect(pt(game, thirsty)).toEqual({ power: 6, toughness: 6 });
    activate(game, inYard);
    expect(zone(game, inYard)).toBe("hand");
  });
});

describe("Dune-Brood Nephilim", () => {
  it("makes a 1/1 Sand for each land you control on combat damage to a player", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const nephilim = spawn(game, "Dune-Brood Nephilim");
    attack(game, a, [nephilim]);
    expect(tokensNamed(game, "Sand Token", A)).toBe(3);
    const sand = named(game, "Sand Token", A)[0];
    expect(pt(game, sand)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Tibor and Lumia", () => {
  it("a blue spell gives target creature flying; a red one pings each creature without flying", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    lands(game, "Mountain", 1);
    spawn(game, "Tibor and Lumia");
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves", B);
    const birds = spawn(game, "Birds of Paradise", B);
    pickTargets(a, bears);
    cast(game, toHand(game, "Opt"));
    expect(keywords(game, bears).has("flying")).toBe(true);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, birds)).toBe("battlefield");
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });
});

describe("Shrieking Grotesque", () => {
  it("makes target player discard only if {B} was spent to cast it", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    pickTargets(a, B);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Shrieking Grotesque"));
    expect(hand(game, B).length).toBe(before);

    const second = table();
    lands(second.game, "Plains", 2);
    lands(second.game, "Swamp", 1);
    pickTargets(second.a, B);
    const before2 = hand(second.game, B).length;
    cast(second.game, toHand(second.game, "Shrieking Grotesque"));
    expect(hand(second.game, B).length).toBe(before2 - 1);
  });
});

describe("Gruul War Plow", () => {
  it("becomes a 4/4 Juggernaut artifact creature with trample", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Forest", 1);
    const plow = spawn(game, "Gruul War Plow");
    activate(game, plow);
    expect(types(game, plow)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, plow)).toContain("Juggernaut");
    expect(pt(game, plow)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, plow).has("trample")).toBe(true);
  });
});

describe("Yore-Tiller Nephilim", () => {
  it("returns a creature card from your graveyard tapped and attacking", () => {
    const { game, a } = table();
    const nephilim = spawn(game, "Yore-Tiller Nephilim");
    const bears = toGraveyard(game, "Grizzly Bears");
    pickTargets(a, bears);
    attack(game, a, [nephilim]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, B)).toBe(16);
  });
});
