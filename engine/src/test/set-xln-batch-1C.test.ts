/**
 * Ixalan and Commander 2017, group C: raid, the transforming enchantment,
 * Treasure costs, Mirror of the Forebears' chosen type, Licia's reduction.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  controller,
  enter,
  hand,
  lands,
  life,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

describe("Arguel's Blood Fast", () => {
  it("transforms in your upkeep at 5 or less life", () => {
    const { game, a } = table();
    const fast = spawn(game, "Arguel's Blood Fast");
    game.state.players[A].life = 5;
    pickModes(a, 0);
    toStep(game, "precombat-main");
    expect(game.state.objects[fast].face).toBe(1);
  });

  it("doesn't trigger at 6 life", () => {
    const { game, a } = table();
    const fast = spawn(game, "Arguel's Blood Fast");
    game.state.players[A].life = 6;
    pickModes(a, 0);
    toStep(game, "precombat-main");
    expect(game.state.objects[fast].face ?? 0).toBe(0);
  });
});

describe("Ruthless Knave", () => {
  it("sacrifices three Treasures to draw a card", () => {
    const { game } = table();
    const knave = spawn(game, "Ruthless Knave");
    for (let i = 0; i < 3; i += 1) spawn(game, "Treasure Token");
    const before = hand(game).length;
    activate(game, knave, 1);
    expect(hand(game).length).toBe(before + 1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
  });

  it("can't with only two Treasures", () => {
    const { game } = table();
    const knave = spawn(game, "Ruthless Knave");
    for (let i = 0; i < 2; i += 1) spawn(game, "Treasure Token");
    expect(() => activate(game, knave, 1)).toThrow();
  });
});

describe("Entrancing Melody", () => {
  it("takes a creature whose mana value is X, and only that", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 4);
    const melody = toHand(game, "Entrancing Melody");
    expect(() => cast(game, melody, { x: 1, targets: [ref(bears)] })).toThrow();
    cast(game, melody, { x: 2, targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
  });
});

describe("Tocatli Honor Guard", () => {
  it("stops a creature's own enters trigger", () => {
    const { game, a } = table();
    a.choosePermanentsFn = (_view, eligible) => eligible.filter((id) => game.state.objects[id].cardName === "Storm Sculptor");
    spawn(game, "Tocatli Honor Guard");
    const sculptor = enter(game, "Storm Sculptor");
    expect(zone(game, sculptor)).toBe("battlefield");
  });
});

describe("Storm Sculptor", () => {
  it("returns itself when it's the only creature you control", () => {
    const { game, a } = table();
    a.choosePermanentsFn = (_view, eligible) => eligible.slice(0, 1);
    const sculptor = enter(game, "Storm Sculptor");
    expect(zone(game, sculptor)).toBe("hand");
  });
});

describe("Adanto Vanguard", () => {
  it("deals 3 while attacking", () => {
    const { game, a } = table();
    const vanguard = spawn(game, "Adanto Vanguard");
    expect(pt(game, vanguard)).toEqual({ power: 1, toughness: 1 });
    attack(game, a, [vanguard]);
    expect(life(game, B)).toBe(17);
  });
});

describe("Kumena's Speaker", () => {
  it("gets +1/+1 only with another Merfolk or an Island", () => {
    const { game } = table();
    const speaker = spawn(game, "Kumena's Speaker");
    expect(pt(game, speaker)).toEqual({ power: 1, toughness: 1 });
    spawn(game, "Island");
    expect(pt(game, speaker)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Raid", () => {
  it("Firecannon Blast deals 3, or 6 if you attacked", () => {
    const { game, a } = table();
    const big = spawn(game, "Belligerent Brontodon", B);
    const small = spawn(game, "Belligerent Brontodon", B);
    lands(game, "Mountain", 6);
    cast(game, toHand(game, "Firecannon Blast"), { targets: [ref(big)] });
    expect(zone(game, big)).toBe("battlefield");
    attack(game, a, [spawn(game, "Grizzly Bears")]);
    cast(game, toHand(game, "Firecannon Blast"), { targets: [ref(small)] });
    expect(zone(game, small)).toBe("graveyard");
  });

  it("Repeating Barrage returns from the graveyard only if you attacked", () => {
    const { game, a } = table();
    const barrage = toGraveyard(game, "Repeating Barrage");
    lands(game, "Mountain", 5);
    expect(() => activate(game, barrage, 0)).toThrow();
    attack(game, a, [spawn(game, "Grizzly Bears")]);
    activate(game, barrage, 0);
    expect(zone(game, barrage)).toBe("hand");
  });
});

describe("River Heralds' Boon", () => {
  it("may put both counters on one Merfolk", () => {
    const { game } = table();
    const merfolk = spawn(game, "Kumena's Speaker");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "River Heralds' Boon"), { targets: [ref(merfolk), ref(merfolk)] });
    expect(counters(game, merfolk)).toBe(2);
  });
});

describe("Mirror of the Forebears", () => {
  it("becomes an artifact copy of a creature of the chosen type, and can't target another type", () => {
    const { game, a } = table();
    a.chooseCreatureTypeFn = () => "Bear";
    lands(game, "Wastes", 3);
    const bears = spawn(game, "Grizzly Bears");
    const merfolk = spawn(game, "Kumena's Speaker");
    const mirror = toHand(game, "Mirror of the Forebears");
    cast(game, mirror);
    expect(() => activate(game, mirror, 0, { targets: [ref(merfolk)] })).toThrow();
    activate(game, mirror, 0, { targets: [ref(bears)] });
    expect(types(game, mirror)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(pt(game, mirror)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Licia, Sanguine Tribune", () => {
  it("costs {1} less for each life gained this turn", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Nourish"));
    expect(life(game)).toBe(26);
    spawn(game, "Mountain");
    spawn(game, "Plains");
    spawn(game, "Swamp");
    const licia = toHand(game, "Licia, Sanguine Tribune");
    cast(game, licia);
    expect(zone(game, licia)).toBe("battlefield");
  });

  it("puts three counters on itself once a turn, during your turn", () => {
    const { game } = table();
    const licia = spawn(game, "Licia, Sanguine Tribune");
    activate(game, licia, 0);
    expect(counters(game, licia)).toBe(3);
    expect(life(game)).toBe(15);
    expect(() => activate(game, licia, 0)).toThrow();
  });
});
