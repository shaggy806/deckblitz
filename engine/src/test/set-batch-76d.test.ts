/**
 * Set walk batch 76, part d (2026-10-15): Secrets of Strixhaven (SOS), the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
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
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

/** The prepare spell copies in exile. */
const preparedCopies = (game: Game): ObjectId[] =>
  game.state.zones.shared.exile.filter((id) => game.state.objects[id].preparedFor !== undefined);

/** Fireball for X = 4: five mana spent on an instant or sorcery. */
function fiveManaFireball(game: Game, target: ObjectId | typeof B = B): void {
  lands(game, "Mountain", 5);
  cast(game, toHand(game, "Fireball"), { targets: [ref(target)], x: 4 });
}

/** Lightning Bolt: one mana spent. */
function bolt(game: Game, target: ObjectId | typeof B = B): void {
  lands(game, "Mountain", 1);
  cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(target)] });
}

describe("Social Snub", () => {
  it("while you control a creature, may be copied: each player sacrifices twice, drains twice", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant", B);
    spawn(game, "Hill Giant", B);
    lands(game, "Plains", 2);
    lands(game, "Swamp", 1);
    pickModes(a, 0);
    cast(game, toHand(game, "Social Snub"));
    expect(named(game, "Grizzly Bears", A)).toHaveLength(0);
    expect(named(game, "Hill Giant", B)).toHaveLength(0);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });

  it("without a creature there's no copy", () => {
    const { game, a } = table();
    spawn(game, "Hill Giant", B);
    spawn(game, "Hill Giant", B);
    lands(game, "Plains", 2);
    lands(game, "Swamp", 1);
    pickModes(a, 0);
    cast(game, toHand(game, "Social Snub"));
    expect(named(game, "Hill Giant", B)).toHaveLength(1);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
  });

  it("declining the copy casts it once", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant", B);
    spawn(game, "Hill Giant", B);
    lands(game, "Plains", 2);
    lands(game, "Swamp", 1);
    pickModes(a);
    cast(game, toHand(game, "Social Snub"));
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
    expect(named(game, "Hill Giant", B)).toHaveLength(1);
    expect(life(game, B)).toBe(19);
  });
});

describe("Elemental Mascot", () => {
  it("a cheap spell only pumps it", () => {
    const { game } = table();
    const mascot = spawn(game, "Elemental Mascot");
    const top = toLibrary(game, "Forest");
    bolt(game);
    expect(pt(game, mascot)).toEqual({ power: 2, toughness: 4 });
    expect(zone(game, top)).toBe("library");
  });

  it("five mana spent also exiles the top card, playable until the end of your next turn", () => {
    const { game } = table();
    const mascot = spawn(game, "Elemental Mascot");
    const top = toLibrary(game, "Forest");
    fiveManaFireball(game);
    expect(pt(game, mascot)).toEqual({ power: 2, toughness: 4 });
    expect(zone(game, top)).toBe("exile");
    expect(game.state.objects[top].impulse).toBeDefined();
  });
});

describe("Mind Roots", () => {
  it("puts a land card discarded this way onto the battlefield tapped under your control", () => {
    const { game, a, b } = table();
    const forest = toHand(game, "Forest", B);
    const bears = toHand(game, "Grizzly Bears", B);
    b.chooseDiscardsFn = () => [forest, bears];
    lands(game, "Swamp", 2);
    lands(game, "Forest", 1);
    const seen = pickFromZone(a, forest);
    cast(game, toHand(game, "Mind Roots"), { targets: [ref(B)] });
    expect(seen.offered).toEqual([forest]);
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].controller).toBe(A);
    expect(game.state.objects[forest].tapped).toBe(true);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("a land already in the graveyard isn't one discarded this way", () => {
    const { game, a, b } = table();
    const old = toGraveyard(game, "Forest", B);
    const bears = toHand(game, "Grizzly Bears", B);
    const giant = toHand(game, "Hill Giant", B);
    b.chooseDiscardsFn = () => [bears, giant];
    lands(game, "Swamp", 2);
    lands(game, "Forest", 1);
    const seen = pickFromZone(a);
    cast(game, toHand(game, "Mind Roots"), { targets: [ref(B)] });
    expect(seen.offered).toEqual([]);
    expect(zone(game, old)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Burrog Barrage", () => {
  it("without another instant or sorcery this turn, deals its unpumped power", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Burrog Barrage"), { targets: [ref(bears), ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(2);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("after another instant or sorcery, gets +1/+0 first", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    bolt(game);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Burrog Barrage"), { targets: [ref(bears), ref(giant)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("the second target is optional", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    bolt(game);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Burrog Barrage"), { targets: [ref(bears), null] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("Homesickness", () => {
  it("target player draws two, and up to two creatures are tapped with a stun counter each", () => {
    const { game } = table();
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Hill Giant", B);
    lands(game, "Island", 6);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Homesickness"), { targets: [ref(B), ref(one), ref(two)] });
    expect(hand(game, B).length).toBe(before + 2);
    for (const id of [one, two]) {
      expect(game.state.objects[id].tapped).toBe(true);
      expect(counters(game, id, "stun")).toBe(1);
    }
  });

  it("can't name the same creature twice", () => {
    const { game } = table();
    const one = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 6);
    expect(() => cast(game, toHand(game, "Homesickness"), { targets: [ref(A), ref(one), ref(one)] })).toThrow();
  });
});

describe("Render Speechless", () => {
  it("you take a nonland card from their hand, and two +1/+1 counters go on up to one creature", () => {
    const { game, a } = table();
    const forest = toHand(game, "Forest", B);
    const bears = toHand(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    lands(game, "Swamp", 2);
    const seen = pickFromZone(a, bears);
    cast(game, toHand(game, "Render Speechless"), { targets: [ref(B), ref(mine)] });
    expect(seen.offered).toEqual([bears]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, forest)).toBe("hand");
    expect(counters(game, mine)).toBe(2);
  });
});

describe("Deluge Virtuoso", () => {
  it("enters tapping a creature an opponent controls and stunning it", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    enter(game, "Deluge Virtuoso");
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(counters(game, giant, "stun")).toBe(1);
  });

  it("opus: +1/+1, or +2/+2 instead when five mana was spent", () => {
    const { game } = table();
    const virtuoso = spawn(game, "Deluge Virtuoso");
    bolt(game);
    expect(pt(game, virtuoso)).toEqual({ power: 3, toughness: 3 });
    fiveManaFireball(game);
    expect(pt(game, virtuoso)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Heated Argument", () => {
  it("6 to the creature, and 2 to its controller if you exile a card from your graveyard", () => {
    const { game, a } = table();
    const angel = spawn(game, "Serra Angel", B);
    const card = toGraveyard(game, "Grizzly Bears");
    lands(game, "Mountain", 5);
    pickFromZone(a, card);
    cast(game, toHand(game, "Heated Argument"), { targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("graveyard");
    expect(zone(game, card)).toBe("exile");
    expect(life(game, B)).toBe(18);
  });

  it("no exile, no damage to the player", () => {
    const { game, a } = table();
    const angel = spawn(game, "Serra Angel", B);
    const card = toGraveyard(game, "Grizzly Bears");
    lands(game, "Mountain", 5);
    pickFromZone(a);
    cast(game, toHand(game, "Heated Argument"), { targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("graveyard");
    expect(zone(game, card)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Paradox Surveyor", () => {
  it("offers a land card or a card with {X} in its mana cost from the top five", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    const fireball = toLibrary(game, "Fireball");
    const forest = toLibrary(game, "Forest");
    const seen = pickFromZone(a, fireball);
    enter(game, "Paradox Surveyor");
    expect([...seen.offered].sort()).toEqual([fireball, forest].sort());
    expect(zone(game, fireball)).toBe("hand");
    expect(zone(game, forest)).toBe("library");
  });
});

describe("Inkling Mascot", () => {
  it("repartee: a spell targeting a creature grants flying", () => {
    const { game } = table();
    const mascot = spawn(game, "Inkling Mascot");
    const giant = spawn(game, "Hill Giant", B);
    expect(keywords(game, mascot).has("flying")).toBe(false);
    bolt(game, giant);
    expect(keywords(game, mascot).has("flying")).toBe(true);
  });

  it("a spell targeting a player doesn't", () => {
    const { game } = table();
    const mascot = spawn(game, "Inkling Mascot");
    bolt(game);
    expect(keywords(game, mascot).has("flying")).toBe(false);
  });
});

describe("Campus Composer // Aqueous Aria", () => {
  it("enters prepared; Aqueous Aria makes a 3/3 blue and red flying Elemental", () => {
    const { game } = table();
    const composer = enter(game, "Campus Composer");
    expect(game.state.objects[composer].prepared).toBeDefined();
    const [copy] = preparedCopies(game);
    expect(game.state.objects[copy].cardName).toBe("Aqueous Aria");
    lands(game, "Island", 5);
    cast(game, copy, { via: "prepared" });
    const [token] = named(game, "Elemental Token (3/3 Blue-Red Flying)");
    expect(pt(game, token)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, token).has("flying")).toBe(true);
    expect(game.state.objects[composer].prepared).toBeUndefined();
  });
});

describe("Expressive Firedancer", () => {
  it("opus: +1/+1, and double strike too when five mana was spent", () => {
    const { game } = table();
    const dancer = spawn(game, "Expressive Firedancer");
    bolt(game);
    expect(pt(game, dancer)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, dancer).has("double-strike")).toBe(false);
    fiveManaFireball(game);
    expect(pt(game, dancer)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, dancer).has("double-strike")).toBe(true);
  });
});

describe("Fractal Mascot", () => {
  it("enters tapping a creature an opponent controls and stunning it", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    enter(game, "Fractal Mascot");
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(counters(game, giant, "stun")).toBe(1);
  });
});

describe("Lumaret's Favor", () => {
  it("no life gained this turn: one +2/+4", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Lumaret's Favor"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 6 });
  });

  it("infusion: having gained life this turn, it's copied", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 });
    settle(game);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Lumaret's Favor"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 10 });
  });
});

describe("Transcendent Archaic", () => {
  it("converge: may draw a card per color spent, then discards two", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 4);
    pickModes(a, 0);
    const before = hand(game).length;
    cast(game, toHand(game, "Transcendent Archaic"));
    expect(hand(game).length).toBe(before + 3 - 2);
    expect(graveyard(game).length).toBe(2);
  });

  it("no colors spent: drawing none discards nothing", () => {
    const { game, a } = table();
    lands(game, "Wastes", 7);
    pickModes(a, 0);
    const before = hand(game).length;
    cast(game, toHand(game, "Transcendent Archaic"));
    expect(hand(game).length).toBe(before);
    expect(graveyard(game).length).toBe(0);
  });
});

describe("Rancorous Archaic", () => {
  it("converge: a +1/+1 counter per color of mana spent", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 3);
    cast(game, toHand(game, "Rancorous Archaic"));
    const [archaic] = named(game, "Rancorous Archaic");
    expect(counters(game, archaic)).toBe(2);
    expect(pt(game, archaic)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Muse's Encouragement", () => {
  it("makes a 3/3 blue and red flying Elemental, then surveils 2", () => {
    const { game } = table();
    lands(game, "Island", 5);
    cast(game, toHand(game, "Muse's Encouragement"));
    expect(tokensNamed(game, "Elemental Token (3/3 Blue-Red Flying)", A)).toBe(1);
  });
});

describe("Strife Scholar // Awaken the Ages", () => {
  it("enters prepared; Awaken the Ages makes two 2/2 red and white Spirits", () => {
    const { game } = table();
    const scholar = enter(game, "Strife Scholar");
    const [copy] = preparedCopies(game);
    expect(game.state.objects[copy].cardName).toBe("Awaken the Ages");
    lands(game, "Mountain", 6);
    cast(game, copy, { via: "prepared" });
    expect(tokensNamed(game, "Spirit Token (Red-White 2/2)", A)).toBe(2);
    expect(game.state.objects[scholar].prepared).toBeUndefined();
  });
});

describe("Startled Relic Sloth", () => {
  it("at the beginning of combat on your turn, exiles up to one target card from a graveyard", () => {
    const { game, a } = table();
    spawn(game, "Startled Relic Sloth");
    const card = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, card);
    toStep(game, "begin-combat");
    settle(game);
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Aberrant Manawurm", () => {
  it("gets +X/+0 where X is the mana spent on the instant or sorcery", () => {
    const { game } = table();
    const wurm = spawn(game, "Aberrant Manawurm");
    fiveManaFireball(game);
    expect(pt(game, wurm)).toEqual({ power: 7, toughness: 5 });
    bolt(game);
    expect(pt(game, wurm)).toEqual({ power: 8, toughness: 5 });
  });
});
