/**
 * Ice Age (ICE; B136), group D. One test per card whose behaviour is more than
 * a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  blockOffer,
  cast,
  hand,
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
import type { Game } from "../game.js";

const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped;

describe("Energy Storm", () => {
  it("prevents an instant's damage but not a creature's, and fliers stay tapped", () => {
    const { game, a } = table();
    spawn(game, "Energy Storm");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(20);
    const bears = spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel", B, { tapped: true });
    const theirBears = spawn(game, "Grizzly Bears", B, { tapped: true });
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(18);
    toStep(game, "precombat-main", B);
    expect(tapped(game, theirBears)).toBe(false);
    expect(tapped(game, angel)).toBe(true);
  });
});

describe("Icequake", () => {
  it("deals 1 damage to the controller only when the destroyed land was snow", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const snow = spawn(game, "Snow-Covered Swamp", B);
    const plain = spawn(game, "Swamp", B);
    cast(game, toHand(game, "Icequake"), { targets: [ref(plain)] });
    expect(zone(game, plain)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
    cast(game, toHand(game, "Icequake"), { targets: [ref(snow)] });
    expect(zone(game, snow)).toBe("graveyard");
    expect(life(game, B)).toBe(19);
  });
});

describe("Essence Filter", () => {
  it("chosen as it resolves: the nonwhite mode spares white enchantments", () => {
    const { game, a } = table();
    const white = spawn(game, "Hallowed Ground", B);
    const green = spawn(game, "Fyndhorn Pollen", B);
    lands(game, "Forest", 3);
    pickModes(a, 1);
    cast(game, toHand(game, "Essence Filter"));
    expect(zone(game, white)).toBe("battlefield");
    expect(zone(game, green)).toBe("graveyard");
  });
});

describe("Runed Arch", () => {
  it("enters tapped; X targets with power 2 or less can't be blocked this turn", () => {
    const { game, a } = table();
    const arch = game.debugSpawn("Runed Arch", A, "hand");
    lands(game, "Wastes", 5);
    cast(game, arch);
    expect(tapped(game, arch)).toBe(true);
    game.state.objects[arch].tapped = false;
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    const giant = spawn(game, "Hill Giant");
    expect(() => activate(game, arch, 0, { x: 2, targets: [ref(bears), ref(giant)] })).toThrow(/refused/);
    activate(game, arch, 0, { x: 2, targets: [ref(bears), ref(elves)] });
    expect(zone(game, arch)).toBe("graveyard");
    const wall = spawn(game, "Walking Wall", B);
    blockOffer(game, a, [bears, giant]);
    expect(() =>
      game.dispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: wall, attacker: bears }] }),
    ).toThrow(/block/);
    game.dispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: wall, attacker: giant }] });
  });
});

describe("Black Scarab", () => {
  it("gives +2/+2 only while an opponent controls a black permanent", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Black Scarab"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    spawn(game, "Drudge Skeletons");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    spawn(game, "Drudge Skeletons", B);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Malachite Talisman", () => {
  it("on a green spell, paying {3} untaps the target permanent", () => {
    const { game, a } = table();
    spawn(game, "Malachite Talisman");
    const giant = spawn(game, "Hill Giant", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    lands(game, "Wastes", 3);
    pickTargets(a, giant);
    pickModes(a, 0);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(tapped(game, giant)).toBe(false);
  });
});

describe("Elder Druid", () => {
  it("chooses tap or untap as it resolves", () => {
    const { game, a } = table();
    const druid = spawn(game, "Elder Druid");
    const giant = spawn(game, "Hill Giant", B, { tapped: true });
    lands(game, "Forest", 4);
    pickModes(a, 1);
    activate(game, druid, 0, { targets: [ref(giant)] });
    expect(tapped(game, giant)).toBe(false);
  });
});

describe("Walking Wall", () => {
  it("gets +3/-1 and may attack, only once each turn", () => {
    const { game } = table();
    const wall = spawn(game, "Walking Wall");
    lands(game, "Wastes", 6);
    activate(game, wall, 0);
    expect(pt(game, wall)).toEqual({ power: 3, toughness: 5 });
    expect(() => activate(game, wall, 0)).toThrow(/refused/);
  });
});

describe("Enervate", () => {
  it("taps the target and draws a card at the next turn's upkeep", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 2);
    const card = toHand(game, "Enervate");
    const before = hand(game).length;
    cast(game, card, { targets: [ref(bears)] });
    expect(tapped(game, bears)).toBe(true);
    expect(hand(game).length).toBe(before - 1);
    toStep(game, "draw", B);
    settle(game);
    expect(hand(game).length).toBe(before);
  });
});

describe("Mystic Might", () => {
  it("enchants only a land you control, which gains the pump ability", () => {
    const { game, a } = table();
    const mine = spawn(game, "Forest");
    const theirs = spawn(game, "Forest", B);
    lands(game, "Island", 1);
    const aura = toHand(game, "Mystic Might");
    expect(() => cast(game, aura, { targets: [ref(theirs)] })).toThrow(/refused/);
    cast(game, aura, { targets: [ref(mine)] });
    const bears = spawn(game, "Grizzly Bears");
    const granted = game
      .legalActions(A)
      .find((o) => o.kind === "activate-ability" && o.source === mine && o.text.startsWith("{T}: Target creature"));
    if (granted?.kind !== "activate-ability") throw new Error("not offered");
    pickTargets(a, bears);
    activate(game, mine, granted.abilityIndex, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Hallowed Ground", () => {
  it("returns a nonsnow land you control, never a snow one", () => {
    const { game } = table();
    const ground = spawn(game, "Hallowed Ground");
    lands(game, "Plains", 2);
    const snow = spawn(game, "Snow-Covered Plains");
    const plains = spawn(game, "Plains");
    expect(() => activate(game, ground, 0, { targets: [ref(snow)] })).toThrow(/refused/);
    activate(game, ground, 0, { targets: [ref(plains)] });
    expect(zone(game, plains)).toBe("hand");
  });
});

describe("Avalanche", () => {
  it("destroys X target snow lands and can't target a nonsnow one", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const snow = spawn(game, "Snow-Covered Mountain", B);
    const plain = spawn(game, "Mountain", B);
    const card = toHand(game, "Avalanche");
    expect(() => cast(game, card, { x: 1, targets: [ref(plain)] })).toThrow(/refused/);
    cast(game, card, { x: 1, targets: [ref(snow)] });
    expect(zone(game, snow)).toBe("graveyard");
  });
});

describe("Fyndhorn Pollen", () => {
  it("gives all creatures -1/-0, and -1/-0 more until end of turn", () => {
    const { game } = table();
    const pollen = spawn(game, "Fyndhorn Pollen");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 2 });
    lands(game, "Forest", 2);
    activate(game, pollen, 0);
    expect(pt(game, bears)).toEqual({ power: 0, toughness: 2 });
  });
});

describe("Freyalise's Charm", () => {
  it("draws when an opponent casts a black spell and its controller pays {G}{G}", () => {
    const { game, a } = table();
    spawn(game, "Freyalise's Charm");
    lands(game, "Forest", 2);
    lands(game, "Swamp", 2, B);
    toStep(game, "precombat-main", B);
    const before = hand(game).length;
    pickModes(a, 0);
    cast(game, toHand(game, "Drudge Skeletons", B), { player: B });
    expect(hand(game).length).toBe(before + 1);
  });
});
