/**
 * Set walk batch 76, part e (2026-10-15): Secrets of Strixhaven (SOS), the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
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
  watchTargets,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";

const libraryOf = (game: Game, player = A) => game.state.zones.perPlayer[player].library;
const gainLife = (game: Game, amount = 1, player = A): void => {
  game.debugApplyEffect(player, { kind: "gain-life", amount });
  settle(game);
};

describe("Sundering Archaic", () => {
  it("exiles a nonland permanent an opponent controls with mana value up to the colours spent", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    spawn(game, "Serra Angel", B);
    spawn(game, "Hill Giant", B);
    spawn(game, "Forest", B);
    const seen = watchTargets(a, () => [bears]);
    cast(game, toHand(game, "Sundering Archaic"));
    // Three colours spent: mana value 3 or less, never a land, never your own.
    expect(new Set(seen.offered[0])).toEqual(new Set([bears, elves]));
    expect(zone(game, bears)).toBe("exile");
  });

  it("puts a card from a graveyard on the bottom of its owner's library for {2}", () => {
    const { game } = table();
    const archaic = spawn(game, "Sundering Archaic");
    lands(game, "Wastes", 2);
    const card = toGraveyard(game, "Grizzly Bears", B);
    activate(game, archaic, 0, { targets: [ref(card)] });
    expect(zone(game, card)).toBe("library");
    // The bottom is the far end; the top is index 0.
    expect(libraryOf(game, B).at(-1)).toBe(card);
  });
});

describe("Owlin Historian", () => {
  it("gets +1/+1 once whenever one or more cards leave your graveyard", () => {
    const { game } = table();
    const owl = spawn(game, "Owlin Historian");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Llanowar Elves");
    game.debugApplyEffect(A, { kind: "exile-graveyard", target: "you" });
    settle(game);
    expect(pt(game, owl)).toEqual({ power: 3, toughness: 4 });
    // An opponent's graveyard doesn't count.
    toGraveyard(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "exile-graveyard", target: "you" });
    settle(game);
    expect(pt(game, owl)).toEqual({ power: 3, toughness: 4 });
    toStep(game, "precombat-main", B);
    expect(pt(game, owl)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Old-Growth Educator", () => {
  it("enters with two +1/+1 counters only if you gained life this turn", () => {
    const { game } = table();
    const first = enter(game, "Old-Growth Educator");
    expect(counters(game, first)).toBe(0);
    gainLife(game);
    const second = enter(game, "Old-Growth Educator");
    expect(counters(game, second)).toBe(2);
    expect(pt(game, second)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Mage Tower Referee", () => {
  it("gets a +1/+1 counter for a multicolored spell, not a monocolored one", () => {
    const { game } = table();
    const referee = spawn(game, "Mage Tower Referee");
    lands(game, "Mountain", 2);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(counters(game, referee)).toBe(0);
    cast(game, toHand(game, "Lightning Helix"), { targets: [ref(B)] });
    expect(counters(game, referee)).toBe(1);
  });
});

describe("Ascendant Dustspeaker", () => {
  it("puts a +1/+1 counter on another creature you control as it enters", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const speaker = enter(game, "Ascendant Dustspeaker");
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, speaker)).toBe(0);
  });

  it("exiles up to one card from a graveyard at the beginning of combat on your turn", () => {
    const { game, a } = table();
    spawn(game, "Ascendant Dustspeaker");
    const card = toGraveyard(game, "Grizzly Bears", B);
    pickTargets(a, card);
    toStep(game, "begin-combat");
    settle(game);
    expect(zone(game, card)).toBe("exile");
    // Up to one: it can find nothing to exile.
    const kept = toGraveyard(game, "Serra Angel", B);
    pickTargets(a, null);
    toStep(game, "begin-combat");
    settle(game);
    expect(zone(game, kept)).toBe("graveyard");
  });
});

describe("Inkshape Demonstrator", () => {
  it("gets +1/+0 and lifelink when you cast an instant or sorcery that targets a creature", () => {
    const { game } = table();
    const demo = spawn(game, "Inkshape Demonstrator");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(pt(game, demo)).toEqual({ power: 3, toughness: 4 });
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(angel)] });
    expect(pt(game, demo)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, demo).has("lifelink")).toBe(true);
  });

  it("has ward {2}", () => {
    const { game } = table();
    const demo = spawn(game, "Inkshape Demonstrator");
    toStep(game, "precombat-main", B);
    lands(game, "Mountain", 1, B);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(demo)] });
    // Bob can't pay {2}, so his Bolt is countered.
    expect(game.state.objects[demo].damageMarked).toBe(0);
    expect(zone(game, demo)).toBe("battlefield");
  });
});

describe("Stadium Tidalmage", () => {
  it("may draw a card as it enters, and discards one only if it did", () => {
    const { game, a } = table();
    const handBefore = hand(game).length;
    const libraryBefore = libraryOf(game).length;
    pickModes(a, 0);
    enter(game, "Stadium Tidalmage");
    expect(hand(game).length).toBe(handBefore);
    expect(libraryOf(game).length).toBe(libraryBefore - 1);
    expect(graveyard(game).length).toBe(1);
  });

  it("does nothing when declined, and loots again when it attacks", () => {
    const { game, a } = table();
    pickModes(a);
    const mage = enter(game, "Stadium Tidalmage");
    expect(graveyard(game).length).toBe(0);
    pickModes(a, 0);
    attack(game, a, [mage], B);
    expect(graveyard(game).length).toBe(1);
  });
});

describe("Summoned Dromedary", () => {
  it("returns from your graveyard to your hand for {1}{W}", () => {
    const { game } = table();
    const camel = toGraveyard(game, "Summoned Dromedary");
    lands(game, "Plains", 2);
    activate(game, camel, 0);
    expect(zone(game, camel)).toBe("hand");
  });
});

describe("Snarl Song", () => {
  it("makes two Fractals with X +1/+1 counters each and gains X life, X the colours spent", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 3);
    cast(game, toHand(game, "Snarl Song"));
    const fractals = named(game, "Fractal Token");
    expect(fractals).toHaveLength(2);
    expect(fractals.map((id) => counters(game, id))).toEqual([3, 3]);
    expect(life(game)).toBe(23);
  });
});

describe("Poisoner's Apprentice", () => {
  it("gives the target -4/-4 only if you gained life this turn", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    enter(game, "Poisoner's Apprentice");
    expect(pt(game, angel)).toEqual({ power: 4, toughness: 4 });
    gainLife(game);
    enter(game, "Poisoner's Apprentice");
    expect(zone(game, angel)).toBe("graveyard");
  });
});

describe("Rehearsed Debater", () => {
  it("gets +1/+1 when you cast an instant or sorcery that targets a creature", () => {
    const { game } = table();
    const debater = spawn(game, "Rehearsed Debater");
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(pt(game, debater)).toEqual({ power: 3, toughness: 3 });
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    expect(pt(game, debater)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Matterbending Mage", () => {
  it("returns up to one other creature to its owner's hand", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [bears]);
    const mage = enter(game, "Matterbending Mage");
    expect(seen.offered[0]).not.toContain(mage);
    expect(zone(game, bears)).toBe("hand");
  });

  it("can't be blocked this turn once you cast a spell with {X} in its mana cost", () => {
    const { game } = table();
    const mage = spawn(game, "Matterbending Mage");
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(keywords(game, mage).has("unblockable")).toBe(false);
    cast(game, toHand(game, "Fireball"), { targets: [ref(B)], x: 1 });
    expect(keywords(game, mage).has("unblockable")).toBe(true);
    toStep(game, "precombat-main", B);
    expect(keywords(game, mage).has("unblockable")).toBe(false);
  });
});

describe("Ulna Alley Shopkeep", () => {
  it("gets +2/+0 as long as you gained life this turn", () => {
    const { game } = table();
    const shopkeep = spawn(game, "Ulna Alley Shopkeep");
    expect(pt(game, shopkeep)).toEqual({ power: 2, toughness: 3 });
    gainLife(game);
    expect(pt(game, shopkeep)).toEqual({ power: 4, toughness: 3 });
    toStep(game, "precombat-main", B);
    expect(pt(game, shopkeep)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Living History", () => {
  it("makes a 2/2 red and white Spirit, and pumps an attacker only if a card left your graveyard", () => {
    const { game, a } = table();
    enter(game, "Living History");
    expect(tokensNamed(game, "Spirit Token (Red-White 2/2)")).toBe(1);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears], B);
    expect(life(game, B)).toBe(18);
    toStep(game, "precombat-main");
    toGraveyard(game, "Llanowar Elves");
    game.debugApplyEffect(A, { kind: "exile-graveyard", target: "you" });
    settle(game);
    attack(game, a, [bears], B);
    expect(life(game, B)).toBe(14);
  });
});

describe("Tenured Concocter", () => {
  it("may draw a card when an opponent's spell targets it", () => {
    const { game, a } = table();
    const troll = spawn(game, "Tenured Concocter");
    toStep(game, "precombat-main", B);
    const handBefore = hand(game).length;
    lands(game, "Mountain", 1, B);
    pickModes(a, 0);
    cast(game, toHand(game, "Lightning Bolt", B), { player: B, targets: [ref(troll)] });
    expect(hand(game).length).toBe(handBefore + 1);
    // Its own controller's spell doesn't.
    toStep(game, "precombat-main");
    lands(game, "Forest", 1);
    const before = hand(game).length;
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(troll)] });
    expect(hand(game).length).toBe(before);
  });

  it("gets +2/+0 as long as you gained life this turn", () => {
    const { game } = table();
    const troll = spawn(game, "Tenured Concocter");
    expect(pt(game, troll)).toEqual({ power: 4, toughness: 5 });
    gainLife(game);
    expect(pt(game, troll)).toEqual({ power: 6, toughness: 5 });
  });
});

describe("Stirring Honormancer", () => {
  it("looks at the top X cards, X the creatures you control, one to hand and the rest to the graveyard", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Llanowar Elves");
    const fourth = toLibrary(game, "Counterspell");
    const third = toLibrary(game, "Giant Growth");
    const second = toLibrary(game, "Shock");
    const top = toLibrary(game, "Lightning Bolt");
    const seen = pickFromZone(a, second);
    enter(game, "Stirring Honormancer");
    expect(new Set(seen.offered)).toEqual(new Set([top, second, third]));
    expect(zone(game, second)).toBe("hand");
    expect(zone(game, top)).toBe("graveyard");
    expect(zone(game, third)).toBe("graveyard");
    expect(zone(game, fourth)).toBe("library");
  });
});

describe("Arcane Omens", () => {
  it("makes the target player discard X cards, X the colours spent", () => {
    const { game } = table();
    for (let i = 0; i < 3; i++) toHand(game, "Grizzly Bears", B);
    const before = hand(game, B).length;
    lands(game, "Swamp", 1);
    lands(game, "Island", 1);
    lands(game, "Wastes", 3);
    cast(game, toHand(game, "Arcane Omens"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(before - 2);
  });
});
