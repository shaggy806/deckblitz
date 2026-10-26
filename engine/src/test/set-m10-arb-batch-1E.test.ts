/**
 * Magic 2010 and Alara Reborn (M10, ARB; B168), group E. One test per card
 * whose behaviour is more than a stat line, on the clause most likely to be
 * wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Magma Phoenix", () => {
  it("deals 3 to each creature and each player as it dies, and returns to hand from the graveyard", () => {
    const { game } = table();
    const phoenix = spawn(game, "Magma Phoenix");
    const giant = spawn(game, "Hill Giant", B);
    const wurm = spawn(game, "Craw Wurm", B);
    destroy(game, phoenix);
    expect(life(game, A)).toBe(17);
    expect(life(game, B)).toBe(17);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("battlefield");
    lands(game, "Mountain", 5);
    activate(game, phoenix, 0);
    expect(zone(game, phoenix)).toBe("hand");
  });
});

describe("Undead Slayer", () => {
  it("exiles a Zombie, and can't target a creature without the types", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const slayer = spawn(game, "Undead Slayer");
    const corpse = spawn(game, "Walking Corpse", B);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, slayer, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, slayer, 0, { targets: [ref(corpse)] });
    expect(zone(game, corpse)).toBe("exile");
  });
});

describe("Enigma Sphinx", () => {
  it("goes third from the top of its owner's library when it dies", () => {
    const { game } = table();
    const sphinx = spawn(game, "Enigma Sphinx");
    destroy(game, sphinx);
    expect(zone(game, sphinx)).toBe("library");
    expect(game.state.zones.perPlayer[A].library.indexOf(sphinx)).toBe(2);
  });

  it("doesn't trigger when it goes to another owner's graveyard", () => {
    const { game } = table();
    const sphinx = spawn(game, "Enigma Sphinx", B);
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(sphinx)]);
    settle(game);
    expect(game.state.objects[sphinx].controller).toBe(A);
    destroy(game, sphinx);
    expect(zone(game, sphinx)).toBe("graveyard");
    expect(graveyard(game, B)).toContain(sphinx);
  });
});

describe("Filigree Angel", () => {
  it("gains 3 life for each artifact you control, itself included", () => {
    const { game } = table();
    spawn(game, "Etherwrought Page");
    enter(game, "Filigree Angel");
    expect(life(game, A)).toBe(26);
  });
});

describe("Necromancer's Covenant", () => {
  it("exiles the creature cards from a graveyard and makes a Zombie for each, Zombies with lifelink", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Hill Giant", B);
    const island = toGraveyard(game, "Island", B);
    pickTargets(a, B);
    enter(game, "Necromancer's Covenant");
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, island)).toBe("graveyard");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(2);
    const [zombie] = named(game, "Zombie Token", A);
    expect(keywords(game, zombie).has("lifelink")).toBe(true);
  });
});

describe("Sigil Captain", () => {
  it("puts two counters on a creature that enters as a 1/1, and none on a 2/2", () => {
    const { game } = table();
    spawn(game, "Sigil Captain");
    const elves = enter(game, "Llanowar Elves");
    expect(counters(game, elves)).toBe(2);
    const bears = enter(game, "Grizzly Bears");
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Double Negative", () => {
  it("counters two spells at once", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    lands(game, "Island", 2);
    const first = toHand(game, "Shock");
    const second = toHand(game, "Shock");
    cast(game, first, { targets: [ref(B)], settle: false });
    cast(game, second, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Double Negative"), { targets: [ref(first), ref(second)] });
    expect(zone(game, first)).toBe("graveyard");
    expect(zone(game, second)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Morbid Bloom", () => {
  it("makes Saprolings equal to the exiled card's toughness", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    lands(game, "Wastes", 4);
    const wurm = toGraveyard(game, "Craw Wurm", B);
    cast(game, toHand(game, "Morbid Bloom"), { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("exile");
    expect(tokensNamed(game, "Saproling Token", A)).toBe(4);
  });
});

describe("Etherwrought Page", () => {
  it("drains each opponent for 1 when that mode is chosen at upkeep", () => {
    const { game, a } = table();
    spawn(game, "Etherwrought Page");
    pickModes(a, 2);
    toStep(game, "upkeep");
    settle(game);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
  });
});

describe("Esper Stormblade", () => {
  it("gets +1/+1 and flying only with another multicolored permanent", () => {
    const { game } = table();
    const blade = spawn(game, "Esper Stormblade");
    expect(pt(game, blade)).toEqual({ power: 2, toughness: 1 });
    expect(keywords(game, blade).has("flying")).toBe(false);
    spawn(game, "Etherwrought Page");
    expect(pt(game, blade)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, blade).has("flying")).toBe(true);
  });
});

describe("Drastic Revelation", () => {
  it("discards the hand, draws seven, then discards three at random", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 2);
    const card = toHand(game, "Drastic Revelation");
    cast(game, card);
    expect(hand(game, A)).toHaveLength(4);
  });
});

describe("Naya Sojourners", () => {
  it("cycling it may put a +1/+1 counter on target creature", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    pickTargets(a, bears);
    game.dispatch({ type: "cycle", player: A, card: toHand(game, "Naya Sojourners") });
    settle(game);
    expect(counters(game, bears)).toBe(1);
  });

  it("dying does the same", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const sojourners = spawn(game, "Naya Sojourners");
    pickModes(a, 0);
    pickTargets(a, bears);
    destroy(game, sojourners);
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Grixis Sojourners", () => {
  it("dying may exile a card from a graveyard — itself included", () => {
    const { game, a } = table();
    const sojourners = spawn(game, "Grixis Sojourners");
    pickModes(a, 0);
    pickTargets(a, sojourners);
    destroy(game, sojourners);
    expect(zone(game, sojourners)).toBe("exile");
  });
});
