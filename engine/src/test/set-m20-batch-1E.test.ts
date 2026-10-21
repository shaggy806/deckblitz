/**
 * Commander 2019 and Core Set 2020 (C19, M20; B121), group E. One test per
 * card whose behaviour is more than a stat line, on the clause most likely to
 * be wrong.
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
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  named,
  nextTurn,
  pickFromZone,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

describe("Selesnya Eulogist", () => {
  it("exiles a creature card from a graveyard, then populates", () => {
    const { game } = table();
    const eulogist = spawn(game, "Selesnya Eulogist");
    game.debugApplyEffect(A, { kind: "create-token", token: "Rhino Token", count: 1 }, []);
    settle(game);
    expect(tokensNamed(game, "Rhino Token", A)).toBe(1);
    const dead = toGraveyard(game, "Grizzly Bears", B);
    lands(game, "Forest", 3);
    activate(game, eulogist, 0, { targets: [ref(dead)] });
    expect(zone(game, dead)).toBe("exile");
    expect(tokensNamed(game, "Rhino Token", A)).toBe(2);
  });
});

describe("Ghired, Conclave Exile", () => {
  it("makes a Rhino, and populates one that enters tapped and attacking", () => {
    const { game, a } = table();
    const ghired = enter(game, "Ghired, Conclave Exile");
    const [rhino] = named(game, "Rhino Token", A);
    expect(rhino).toBeDefined();
    pickPermanents(a, rhino);
    attack(game, a, [ghired]);
    expect(tokensNamed(game, "Rhino Token", A)).toBe(2);
    // Ghired's 2 and the populated Rhino's 4; the first Rhino stayed home.
    expect(life(game, B)).toBe(14);
    expect(game.state.objects[rhino].tapped).toBe(false);
  });
});

describe("Sevinne, the Chronoclasm", () => {
  it("copies the first instant cast from the graveyard, even after one from the hand", () => {
    const { game } = table();
    spawn(game, "Sevinne, the Chronoclasm");
    lands(game, "Island", 5);
    const think = toHand(game, "Think Twice");
    const before = hand(game).length;
    cast(game, think);
    expect(hand(game).length).toBe(before); // -1 cast, +1 draw: not copied
    cast(game, think, { via: "flashback" });
    expect(hand(game).length).toBe(before + 2); // the spell and its copy
  });

  it("prevents all damage dealt to it", () => {
    const { game } = table();
    const sevinne = spawn(game, "Sevinne, the Chronoclasm");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(sevinne)] });
    expect(zone(game, sevinne)).toBe("battlefield");
  });
});

describe("Drawn from Dreams", () => {
  it("puts two of the top seven into the hand", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const card = toHand(game, "Drawn from Dreams");
    const before = hand(game).length;
    cast(game, card);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Chandra's Regulator", () => {
  it("discards only a Mountain card or a red card to draw", () => {
    const { game, a } = table();
    const regulator = spawn(game, "Chandra's Regulator");
    lands(game, "Wastes", 1);
    expect(() => activate(game, regulator, 0)).toThrow();
    const mountain = toHand(game, "Mountain");
    const before = hand(game).length;
    pickFromZone(a, mountain);
    activate(game, regulator, 0);
    expect(zone(game, mountain)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
  });
});

describe("Ajani, Inspiring Leader", () => {
  it("+2 with no target still gains the life", () => {
    const { game } = table();
    const ajani = spawn(game, "Ajani, Inspiring Leader");
    loyalty(game, ajani, 2, { targets: [null] });
    expect(life(game, A)).toBe(22);
  });

  it("−3 exiles a creature and its controller gains 2", () => {
    const { game } = table();
    const ajani = spawn(game, "Ajani, Inspiring Leader");
    const bears = spawn(game, "Grizzly Bears", B);
    loyalty(game, ajani, -3, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(life(game, B)).toBe(22);
    expect(life(game, A)).toBe(20);
  });
});

describe("Diamond Knight", () => {
  it("grows on a spell of the chosen colour only", () => {
    const { game } = table();
    const knight = spawn(game, "Diamond Knight");
    game.state.objects[knight].chosenOnEnter = "R";
    lands(game, "Mountain", 1);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(counters(game, knight)).toBe(1);
    cast(game, toHand(game, "Opt"));
    expect(counters(game, knight)).toBe(1);
  });
});

describe("Scampering Scorcher", () => {
  it("gives the Elementals there haste, and nothing else", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    const scorcher = enter(game, "Scampering Scorcher");
    const tokens = named(game, "1/1 Red Elemental Token", A);
    expect(tokensNamed(game, "1/1 Red Elemental Token", A)).toBe(2);
    expect(keywords(game, scorcher).has("haste")).toBe(true);
    expect(keywords(game, tokens[0]).has("haste")).toBe(true);
    expect(keywords(game, bears).has("haste")).toBe(false);
  });
});

describe("Wakeroot Elemental", () => {
  it("untaps a land and makes it a 5/5 haste creature for good", () => {
    const { game } = table();
    const wakeroot = spawn(game, "Wakeroot Elemental");
    lands(game, "Forest", 5);
    const target = spawn(game, "Forest", A, { tapped: true });
    activate(game, wakeroot, 0, { targets: [ref(target)] });
    expect(game.state.objects[target].tapped).toBe(false);
    expect(pt(game, target)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, target).has("haste")).toBe(true);
    nextTurn(game);
    nextTurn(game);
    expect(types(game, target)).toEqual(expect.arrayContaining(["land", "creature"]));
  });
});

describe("Sorin, Vampire Lord", () => {
  it("−8 gives a Vampire a tap ability that steals a creature for good", () => {
    const { game } = table();
    const sorin = spawn(game, "Sorin, Vampire Lord");
    const vampire = spawn(game, "Barony Vampire");
    const bears = spawn(game, "Grizzly Bears", B);
    loyalty(game, sorin, -8, { atLeast: 8 });
    activate(game, vampire, 0, { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    nextTurn(game);
    nextTurn(game);
    expect(controller(game, bears)).toBe(A);
  });
});

describe("Fry", () => {
  it("can target only a white or blue creature or planeswalker", () => {
    const { game } = table();
    const red = spawn(game, "Goblin Piker", B);
    const white = spawn(game, "Savannah Lions", B);
    lands(game, "Mountain", 2);
    const fry = toHand(game, "Fry");
    expect(() => cast(game, fry, { targets: [ref(red)] })).toThrow();
    cast(game, fry, { targets: [ref(white)] });
    expect(zone(game, white)).toBe("graveyard");
    expect(graveyard(game, A)).toContain(fry);
  });
});

describe("Yarok's Wavecrasher", () => {
  it("returns another creature you control", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a, bears);
    const crasher = enter(game, "Yarok's Wavecrasher");
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, crasher)).toBe("battlefield");
  });
});

describe("Herald of the Sun", () => {
  it("counters only another creature with flying", () => {
    const { game } = table();
    const herald = spawn(game, "Herald of the Sun");
    const bears = spawn(game, "Grizzly Bears");
    const drake = spawn(game, "Cerulean Drake");
    lands(game, "Plains", 4);
    expect(() => activate(game, herald, 0, { targets: [ref(bears)] })).toThrow();
    expect(() => activate(game, herald, 0, { targets: [ref(herald)] })).toThrow();
    activate(game, herald, 0, { targets: [ref(drake)] });
    expect(counters(game, drake)).toBe(1);
  });
});
