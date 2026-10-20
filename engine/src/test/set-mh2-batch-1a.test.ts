/**
 * The set walk, Modern Horizons 2 / Commander 2021 batch 1, part a: the
 * clause of each card most likely to be wrong. Written on the shared table in
 * `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  keywords,
  lands,
  life,
  pickModes,
  pickTargets,
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

/** Alice's Army tokens on the battlefield. */
const armies = (game: Game): ObjectId[] =>
  Object.values(game.state.objects)
    .filter((o) => o.zone === "battlefield" && o.controller === A && /Army/.test(o.cardName))
    .map((o) => o.id);

describe("Lazotep Chancellor", () => {
  it("pays {1} on a discard to amass Zombies 2, making the Army first", () => {
    const { game, a } = table();
    spawn(game, "Lazotep Chancellor");
    const lashclaw = spawn(game, "Viashino Lashclaw");
    lands(game, "Island", 1);
    a.chooseFromZoneFn = (_view, eligible) => [eligible[0]];
    pickModes(a, 0);
    activate(game, lashclaw, 0);
    const army = armies(game);
    expect(army).toHaveLength(1);
    expect(counters(game, army[0])).toBe(2);
  });

  it("does nothing when the {1} isn't paid", () => {
    const { game, a } = table();
    spawn(game, "Lazotep Chancellor");
    const lashclaw = spawn(game, "Viashino Lashclaw");
    lands(game, "Island", 1);
    a.chooseFromZoneFn = (_view, eligible) => [eligible[0]];
    pickModes(a);
    activate(game, lashclaw, 0);
    expect(armies(game)).toHaveLength(0);
  });
});

describe("Abiding Grace", () => {
  it("returns a mana value 1 creature card at your end step", () => {
    const { game, a } = table();
    spawn(game, "Abiding Grace");
    const mystic = toGraveyard(game, "Elvish Mystic");
    pickModes(a, 1);
    pickTargets(a, mystic);
    toStep(game, "end");
    settle(game);
    expect(zone(game, mystic)).toBe("battlefield");
  });

  it("gains 1 life with the other mode", () => {
    const { game, a } = table();
    spawn(game, "Abiding Grace");
    pickModes(a, 0);
    toStep(game, "end");
    settle(game);
    expect(life(game, A)).toBe(21);
  });
});

describe("Willowdusk, Essence Seer", () => {
  it("counts the life lost when it's the greater", () => {
    const { game } = table();
    const willowdusk = spawn(game, "Willowdusk, Essence Seer");
    const bears = spawn(game, "Grizzly Bears");
    for (let i = 0; i < 3; i += 1) enter(game, "Clattering Augur");
    lands(game, "Forest", 1);
    // The entries can settle past the main phase; this turn's second one.
    toStep(game, "postcombat-main");
    activate(game, willowdusk, 0, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(3);
  });

  it("counts the life gained when it's the greater", () => {
    const { game } = table();
    const willowdusk = spawn(game, "Willowdusk, Essence Seer");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 4);
    cast(game, toHand(game, "Angel's Mercy"));
    enter(game, "Clattering Augur");
    lands(game, "Forest", 1);
    toStep(game, "postcombat-main");
    activate(game, willowdusk, 0, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(7);
  });
});

describe("Zaffai, Thunder Conductor", () => {
  it("makes a 4/4 only for a spell of mana value 5 or more, and for a copy of one", () => {
    const { game } = table();
    spawn(game, "Zaffai, Thunder Conductor");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
    expect(tokensNamed(game, "4/4 Blue Red Elemental Token")).toBe(0);
    lands(game, "Forest", 7);
    // Opt came first, so storm copies Hunting Pack once — and a copy is
    // magecraft too (its ruling): two Elementals.
    cast(game, toHand(game, "Hunting Pack"));
    expect(tokensNamed(game, "4/4 Blue Red Elemental Token")).toBe(2);
  });

  it("deals 10 to an opponent for a spell of mana value 10 or more ({X} counted)", () => {
    const { game } = table();
    spawn(game, "Zaffai, Thunder Conductor");
    lands(game, "Mountain", 10);
    cast(game, toHand(game, "Fireball"), { targets: [ref(B)], x: 9 });
    expect(tokensNamed(game, "4/4 Blue Red Elemental Token")).toBe(1);
    expect(life(game, B)).toBe(20 - 10 - 9);
  });
});

describe("Knighted Myr", () => {
  it("gains double strike when it adapts", () => {
    const { game } = table();
    const myr = spawn(game, "Knighted Myr");
    lands(game, "Plains", 3);
    activate(game, myr, 0);
    expect(counters(game, myr)).toBe(1);
    expect(keywords(game, myr).has("double-strike")).toBe(true);
  });
});

describe("Spreading Insurrection", () => {
  it("steals a creature, and a storm copy steals another", () => {
    const { game, a } = table();
    const first = spawn(game, "Grizzly Bears", B);
    const second = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 6);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    pickTargets(a, second);
    cast(game, toHand(game, "Spreading Insurrection"), { targets: [ref(first)] });
    expect(game.state.objects[first].controller).toBe(A);
    expect(game.state.objects[second].controller).toBe(A);
    expect(keywords(game, second).has("haste")).toBe(true);
  });
});

describe("Skyblade's Boon", () => {
  it("returns itself to hand from the graveyard", () => {
    const { game } = table();
    const boon = toGraveyard(game, "Skyblade's Boon");
    lands(game, "Plains", 3);
    activate(game, boon, 1);
    expect(zone(game, boon)).toBe("hand");
  });
});

describe("Flay Essence", () => {
  it("gains life equal to the counters the exiled creature had", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].counters["+1/+1"] = 3;
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Flay Essence"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(life(game, A)).toBe(23);
  });
});

describe("Foundry Helix", () => {
  it("gains 4 life when the sacrificed permanent was an artifact", () => {
    const { game } = table();
    const thopter = spawn(game, "Ornithopter");
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Foundry Helix"), { targets: [ref(B)], sacrifice: thopter });
    expect(zone(game, thopter)).toBe("graveyard");
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(24);
  });

  it("gains nothing for a nonartifact permanent", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    lands(game, "Wastes", 1);
    cast(game, toHand(game, "Foundry Helix"), { targets: [ref(B)], sacrifice: bears });
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(16);
    expect(life(game, A)).toBe(20);
  });
});

describe("Scour the Desert", () => {
  it("makes Birds equal to the exiled card's toughness", () => {
    const { game } = table();
    const giant = toGraveyard(game, "Hill Giant");
    lands(game, "Plains", 5);
    cast(game, toHand(game, "Scour the Desert"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("exile");
    expect(tokensNamed(game, "Bird Token")).toBe(3);
  });
});

describe("Bannerhide Krushok", () => {
  it("reinforces from the hand, then scavenges its power from the graveyard", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const krushok = toHand(game, "Bannerhide Krushok");
    lands(game, "Forest", 2);
    activate(game, krushok, 0, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(2);
    expect(graveyard(game)).toContain(krushok);

    lands(game, "Forest", 7);
    activate(game, krushok, 1, { targets: [ref(bears)] });
    expect(zone(game, krushok)).toBe("exile");
    expect(counters(game, bears)).toBe(6);
  });
});

describe("Gouged Zealot", () => {
  it("pings each creature the defending player controls only with delirium", () => {
    const { game, a } = table();
    const zealot = spawn(game, "Gouged Zealot");
    const elves = [spawn(game, "Llanowar Elves", B), spawn(game, "Llanowar Elves", B)];
    const mine = spawn(game, "Llanowar Elves");
    for (const card of ["Wastes", "Grizzly Bears", "Lightning Bolt"]) toGraveyard(game, card);
    attack(game, a, [zealot]);
    expect(elves.map((e) => zone(game, e))).toEqual(["battlefield", "battlefield"]);

    toGraveyard(game, "Divination");
    attack(game, a, [zealot]);
    expect(elves.map((e) => zone(game, e))).toEqual(["graveyard", "graveyard"]);
    expect(zone(game, mine)).toBe("battlefield");
  });
});
