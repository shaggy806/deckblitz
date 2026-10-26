/**
 * Lorwyn (LRW; B192), group D. One test per card whose behaviour is more
 * than a stat line or an exact copy of an already-tested pattern, on the clause
 * most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  controller,
  enter,
  graveyard,
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
  table,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Gilt-Leaf Ambush", () => {
  it("on a won clash, only the two tokens it made gain deathtouch", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    toLibrary(game, "Hill Giant", A);
    toLibrary(game, "Wastes", B);
    lands(game, "Forest", 3, A);
    cast(game, toHand(game, "Gilt-Leaf Ambush", A));
    expect(tokensNamed(game, "Elf Warrior Token", A)).toBe(2);
    for (const id of named(game, "Elf Warrior Token", A)) expect(keywords(game, id).has("deathtouch")).toBe(true);
    expect(keywords(game, bears).has("deathtouch")).toBe(false);
  });

  it("on a lost clash, the tokens get nothing", () => {
    const { game } = table();
    toLibrary(game, "Wastes", A);
    toLibrary(game, "Hill Giant", B);
    lands(game, "Forest", 3, A);
    cast(game, toHand(game, "Gilt-Leaf Ambush", A));
    expect(tokensNamed(game, "Elf Warrior Token", A)).toBe(2);
    for (const id of named(game, "Elf Warrior Token", A)) expect(keywords(game, id).has("deathtouch")).toBe(false);
  });
});

describe("Hostility", () => {
  it("prevents a spell's damage to an opponent and makes a hasty 3/1 per point", () => {
    const { game } = table();
    spawn(game, "Hostility", A);
    lands(game, "Mountain", 1, A);
    cast(game, toHand(game, "Lightning Bolt", A), { targets: [ref(B)] });
    expect(life(game, B)).toBe(20);
    expect(tokensNamed(game, "Elemental Shaman Token (Haste)", A)).toBe(3);
    const token = named(game, "Elemental Shaman Token (Haste)", A)[0];
    expect(keywords(game, token).has("haste")).toBe(true);
    expect(pt(game, token)).toEqual({ power: 3, toughness: 1 });
  });

  it("leaves damage to a creature alone", () => {
    const { game } = table();
    spawn(game, "Hostility", A);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 1, A);
    cast(game, toHand(game, "Lightning Bolt", A), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(tokensNamed(game, "Elemental Shaman Token (Haste)", A)).toBe(0);
  });
});

describe("Surge of Thoughtweft", () => {
  it("draws only while you control a Kithkin", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Plains", 4, A);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Surge of Thoughtweft", A));
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(hand(game, A).length).toBe(before);
    spawn(game, "Kithkin Healer", A);
    const before2 = hand(game, A).length;
    cast(game, toHand(game, "Surge of Thoughtweft", A));
    expect(hand(game, A).length).toBe(before2 + 1);
  });
});

describe("Silvergill Douser", () => {
  it("gives -X/-0 for each Merfolk and/or Faerie you control", () => {
    const { game } = table();
    const douser = spawn(game, "Silvergill Douser", A);
    spawn(game, "Spellstutter Sprite", A);
    spawn(game, "Grizzly Bears", A);
    const giant = spawn(game, "Hill Giant", B);
    activate(game, douser, 0, { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 1, toughness: 3 });
  });
});

describe("Goatnapper", () => {
  it("untaps a changeling (a Goat), takes it until end of turn and gives it haste", () => {
    const { game, a } = table();
    const goat = spawn(game, "Avian Changeling", B, { tapped: true });
    pickTargets(a, goat);
    enter(game, "Goatnapper", A);
    expect(controller(game, goat)).toBe(A);
    expect(game.state.objects[goat].tapped).toBe(false);
    expect(keywords(game, goat).has("haste")).toBe(true);
    nextTurn(game);
    expect(controller(game, goat)).toBe(B);
  });
});

describe("Glimmerdust Nap", () => {
  it("can enchant only a tapped creature, and goes to the graveyard once its host untaps", () => {
    const { game } = table();
    const untapped = spawn(game, "Grizzly Bears", B);
    const tapped = spawn(game, "Hill Giant", B, { tapped: true });
    lands(game, "Island", 3, A);
    expect(() => cast(game, toHand(game, "Glimmerdust Nap", A), { targets: [ref(untapped)] })).toThrow();
    const nap = toHand(game, "Glimmerdust Nap", A);
    cast(game, nap, { targets: [ref(tapped)] });
    expect(game.state.objects[nap].attachedTo).toBe(tapped);
    lands(game, "Plains", 1, A);
    cast(game, toHand(game, "Burst of Energy", A), { targets: [ref(tapped)] });
    expect(game.state.objects[tapped].tapped).toBe(false);
    expect(graveyard(game, A)).toContain(nap);
  });
});

describe("Warren-Scourge Elf", () => {
  it("can't be targeted by a Goblin's ability", () => {
    const { game } = table();
    const elf = spawn(game, "Warren-Scourge Elf", A);
    const fanatic = spawn(game, "Mogg Fanatic", B);
    expect(() => activate(game, fanatic, 0, { player: B, targets: [ref(elf)] })).toThrow();
  });
});

describe("Soaring Hope", () => {
  it("gains 3 life, grants flying, and {W} puts it on top of its owner's library", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    lands(game, "Plains", 6, A);
    const hope = toHand(game, "Soaring Hope", A);
    cast(game, hope, { targets: [ref(bears)] });
    expect(life(game, A)).toBe(23);
    expect(keywords(game, bears).has("flying")).toBe(true);
    activate(game, hope);
    expect(zone(game, hope)).toBe("library");
    expect(game.state.zones.perPlayer[A].library[0]).toBe(hope);
    expect(keywords(game, bears).has("flying")).toBe(false);
  });
});
