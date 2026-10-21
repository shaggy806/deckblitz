/**
 * Commander 2020 and Theros Beyond Death, batch 118 group E: the clause most
 * likely to be wrong on each card that's more than a stat line or a copy of a
 * tested pattern.
 */
import { describe, expect, it } from "vitest";

import { activePlayerOf, printedCardName } from "../state.js";
import {
  A,
  B,
  C,
  attack,
  cast,
  counters,
  destroy,
  graveyard,
  hand,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

describe("Ukkima, Stalking Shadow", () => {
  it("leaving deals its last-known power to the target player and gains that much life", () => {
    const { game, a } = table();
    const ukkima = spawn(game, "Ukkima, Stalking Shadow");
    game.state.objects[ukkima].counters["+1/+1"] = 1;
    pickTargets(a, B);
    destroy(game, ukkima);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
  });
});

describe("Mindleecher", () => {
  it("mutating exiles the top card of each opponent's library, not its controller's", () => {
    const { game, a } = table({ players: 3 });
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 5);
    const bobTop = toLibrary(game, "Grizzly Bears", B);
    const carolTop = toLibrary(game, "Grizzly Bears", C);
    const aliceTop = toLibrary(game, "Grizzly Bears", A);
    pickModes(a, 0);
    cast(game, toHand(game, "Mindleecher"), { overload: true, targets: [ref(bears)] });
    expect(zone(game, bobTop)).toBe("exile");
    expect(zone(game, carolTop)).toBe("exile");
    expect(zone(game, aliceTop)).toBe("library");
  });
});

describe("Nascent Metamorph", () => {
  it("becomes a copy of the first creature card revealed, and every revealed card goes to the bottom", () => {
    const { game, a } = table();
    const meta = spawn(game, "Nascent Metamorph");
    const bears = toLibrary(game, "Grizzly Bears", B);
    const w1 = toLibrary(game, "Wastes", B);
    const w2 = toLibrary(game, "Wastes", B);
    const library = () => game.state.zones.perPlayer[B].library;
    const topIndex = library().indexOf(w2) === 0 ? 0 : library().length - 1;
    pickTargets(a, B);
    attack(game, a, [meta]);
    expect(printedCardName(game.state.objects[meta])).toBe("Grizzly Bears");
    expect(pt(game, meta)).toEqual({ power: 2, toughness: 2 });
    expect(subtypes(game, meta)).toContain("Bear");
    for (const id of [bears, w1, w2]) expect(zone(game, id)).toBe("library");
    const top = library()[topIndex === 0 ? 0 : library().length - 1];
    expect([bears, w1, w2]).not.toContain(top);
  });
});

describe("Cling to Dust", () => {
  it("gains 3 life for a creature card, draws for anything else", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Cling to Dust"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(life(game, A)).toBe(23);
    const land = toGraveyard(game, "Wastes", B);
    const before = hand(game).length;
    cast(game, toHand(game, "Cling to Dust"), { targets: [ref(land)] });
    expect(life(game, A)).toBe(23);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Tymaret Calls the Dead", () => {
  it("chapter I mills three, then exiling a creature card makes a Zombie", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const bears = toGraveyard(game, "Grizzly Bears");
    const gyBefore = graveyard(game).length;
    pickModes(a, 0);
    pickFromZone(a, bears);
    cast(game, toHand(game, "Tymaret Calls the Dead"));
    expect(zone(game, bears)).toBe("exile");
    expect(graveyard(game).length).toBe(gyBefore + 3 - 1);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
  });
});

describe("Purphoros's Intervention", () => {
  it("makes an X/1 Elemental with haste", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Purphoros's Intervention"), { modes: [0], x: 3 });
    const [token] = named(game, "X/1 Elemental Token (Trample, Haste)", A);
    expect(pt(game, token)).toEqual({ power: 3, toughness: 1 });
  });

  it("deals twice X damage to a creature", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].counters["+1/+1"] = 1;
    cast(game, toHand(game, "Purphoros's Intervention"), { modes: [1], x: 2, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("One with the Stars", () => {
  it("makes the creature only an enchantment, without its creature types", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "One with the Stars"), { targets: [ref(bears)] });
    expect(types(game, bears)).toEqual(["enchantment"]);
    expect(subtypes(game, bears)).not.toContain("Bear");
  });
});

describe("Hero of the Winds", () => {
  it("a spell targeting it gives every creature you control +1/+0", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const hero = spawn(game, "Hero of the Winds");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(hero)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, hero)).toEqual({ power: 5, toughness: 7 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Stampede Rider", () => {
  it("triggers at the beginning of each combat, an opponent's included", () => {
    const { game } = table();
    const rider = spawn(game, "Stampede Rider");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 2;
    toStep(game, "begin-combat", B);
    settle(game);
    expect(pt(game, rider)).toEqual({ power: 3, toughness: 4 });
  });
});

describe("Mischievous Chimera", () => {
  it("only the first spell during an opponent's turn pings each opponent", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Mischievous Chimera");
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    const alicesPriority = (): void =>
      game.advanceUntil(
        (s) => activePlayerOf(s) === B && s.turn.step === "upkeep" && s.priority.holder === A && s.zones.shared.stack.length === 0,
      );
    alicesPriority();
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(life(game, B)).toBe(19);
    expect(life(game, C)).toBe(19);
    alicesPriority();
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(life(game, B)).toBe(19);
  });
});

describe("Nessian Hornbeetle", () => {
  it("needs another creature with power 4 or greater", () => {
    const { game } = table();
    const beetle = spawn(game, "Nessian Hornbeetle");
    game.state.objects[beetle].counters["+1/+1"] = 2;
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, beetle)).toBe(2);
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 2;
    toStep(game, "begin-combat");
    settle(game);
    expect(counters(game, beetle)).toBe(3);
  });
});

describe("Blight-Breath Catoblepas", () => {
  it("gives -X/-X where X is your devotion to black", () => {
    const { game, a } = table();
    spawn(game, "Mindleecher");
    const target = spawn(game, "Grizzly Bears", B);
    // 4/4: dies only if the Mindleecher's {B}{B} count too (devotion 4).
    game.state.objects[target].counters["+1/+1"] = 2;
    pickTargets(a, target);
    lands(game, "Swamp", 6);
    cast(game, toHand(game, "Blight-Breath Catoblepas"));
    expect(zone(game, target)).toBe("graveyard");
  });
});

describe("Avenging Huntbonder", () => {
  it("gives another attacking creature a double strike counter", () => {
    const { game, a } = table();
    const hunt = spawn(game, "Avenging Huntbonder");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    attack(game, a, [hunt, bears]);
    expect(counters(game, bears, "double-strike")).toBe(1);
    expect(life(game, B)).toBe(20 - 6 - 4);
  });
});
