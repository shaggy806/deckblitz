/**
 * Set walk batch 76, part c (2026-10-15): Secrets of Strixhaven (SOS), the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { computeCharacteristics } from "../characteristics.js";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
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
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toStep,
  toGraveyard,
  toHand,
  toLibrary,

  zone,
} from "./harness.js";

/** The prepare spell copies in exile. */
const preparedCopies = (game: Game): ObjectId[] =>
  game.state.zones.shared.exile.filter((id) => game.state.objects[id].preparedFor !== undefined);
const colorsOf = (game: Game, id: ObjectId): string[] =>
  [...computeCharacteristics(game.state, game.registry, id).colors].sort();

describe("Chelonian Tackle", () => {
  it("gives +0/+10, then fights the opponent's creature", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const wurm = spawn(game, "Craw Wurm", B);
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Chelonian Tackle"), { targets: [ref(bears), ref(wurm)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 12 });
    expect(game.state.objects[bears].damageMarked).toBe(6);
    expect(game.state.objects[wurm].damageMarked).toBe(2);
  });

  it("the fight is up to one target: with none, only the pump happens", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Chelonian Tackle"), { targets: [ref(bears), null] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 12 });
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });
});

describe("Orysa, Tide Choreographer", () => {
  it("costs {3} less with total toughness 10 or greater, and draws two on entering", () => {
    const { game } = table();
    spawn(game, "Craw Wurm");
    spawn(game, "Craw Wurm");
    spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    toLibrary(game, "Island");
    toLibrary(game, "Island");
    const before = hand(game).length;
    cast(game, toHand(game, "Orysa, Tide Choreographer"));
    expect(named(game, "Orysa, Tide Choreographer")).toHaveLength(1);
    expect(hand(game).length).toBe(before + 2);
  });

  it("pays full price with total toughness 9", () => {
    const { game } = table();
    spawn(game, "Craw Wurm");
    spawn(game, "Craw Wurm");
    spawn(game, "Llanowar Elves");
    lands(game, "Island", 2);
    expect(() => cast(game, toHand(game, "Orysa, Tide Choreographer"))).toThrow(/refused/);
  });
});

describe("Lecturing Scornmage", () => {
  it("repartee: a counter for an instant or sorcery that targets a creature, none for one that targets a player", () => {
    const { game } = table();
    const mage = spawn(game, "Lecturing Scornmage");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(counters(game, mage)).toBe(0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    expect(counters(game, mage)).toBe(1);
  });
});

describe("Spiritcall Enthusiast // Scrollboost", () => {
  it("becomes prepared once for tokens entering together, and Scrollboost pumps two creatures", () => {
    const { game } = table();
    const cat = spawn(game, "Spiritcall Enthusiast");
    expect(game.state.objects[cat].prepared).toBeUndefined();
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 2 });
    settle(game);
    expect(game.state.objects[cat].prepared).toBeDefined();
    const copies = preparedCopies(game);
    expect(copies).toHaveLength(1);
    expect(game.state.objects[copies[0]].cardName).toBe("Scrollboost");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    toStep(game, "postcombat-main");
    cast(game, copies[0], { via: "prepared", targets: [ref(cat), ref(bears)] });
    expect(pt(game, cat)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(game.state.objects[cat].prepared).toBeUndefined();
  });

  it("a nontoken creature entering doesn't prepare it", () => {
    const { game } = table();
    const cat = spawn(game, "Spiritcall Enthusiast");
    enter(game, "Grizzly Bears");
    expect(game.state.objects[cat].prepared).toBeUndefined();
  });

  it("Scrollboost can take a single target", () => {
    const { game } = table();
    const cat = spawn(game, "Spiritcall Enthusiast");
    game.debugApplyEffect(A, { kind: "become-prepared", target: 0 }, [ref(cat)]);
    settle(game);
    const [copy] = preparedCopies(game);
    lands(game, "Plains", 2);
    cast(game, copy, { via: "prepared", targets: [ref(cat), null] });
    expect(pt(game, cat)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Charging Strifeknight", () => {
  it("has haste and loots: {T}, discard a card, draw a card", () => {
    const { a, game } = table();
    const knight = spawn(game, "Charging Strifeknight", A, { sick: true });
    expect(keywords(game, knight).has("haste")).toBe(true);
    const fodder = toHand(game, "Grizzly Bears");
    const drawn = toLibrary(game, "Opt");
    a.chooseDiscardsFn = () => [fodder];
    activate(game, knight, 0);
    expect(zone(game, fodder)).toBe("graveyard");
    expect(zone(game, drawn)).toBe("hand");
    expect(game.state.objects[knight].tapped).toBe(true);
  });
});

describe("Fractalize", () => {
  it("makes the creature a green and blue Fractal with base P/T X+1 until end of turn, counters on top", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel");
    game.state.objects[angel].counters["+1/+1"] = 1;
    lands(game, "Island", 3);
    cast(game, toHand(game, "Fractalize"), { targets: [ref(angel)], x: 2 });
    expect(pt(game, angel)).toEqual({ power: 4, toughness: 4 });
    expect(subtypes(game, angel)).toEqual(["Fractal"]);
    expect(colorsOf(game, angel)).toEqual(["G", "U"]);
    // Its abilities stay.
    expect(keywords(game, angel).has("flying")).toBe(true);
    game.advanceUntil((s) => s.turn.number === 2);
    expect(pt(game, angel)).toEqual({ power: 5, toughness: 5 });
    expect(subtypes(game, angel)).toEqual(["Angel"]);
  });
});

describe("Snooping Page", () => {
  it("can't be blocked after a spell targets a creature, and draws and loses 1 life on combat damage", () => {
    const { a, game } = table();
    const page = spawn(game, "Snooping Page");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 1);
    expect(keywords(game, page).has("unblockable")).toBe(false);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(bears)] });
    expect(keywords(game, page).has("unblockable")).toBe(true);
    toLibrary(game, "Opt");
    const before = hand(game).length;
    attack(game, a, [page]);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(19);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Tackle Artist", () => {
  it("opus: one counter for a cheap spell, two for one with five or more mana spent", () => {
    const { game } = table();
    const artist = spawn(game, "Tackle Artist");
    lands(game, "Mountain", 6);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(counters(game, artist)).toBe(1);
    cast(game, toHand(game, "Lava Axe"), { targets: [ref(B)] });
    expect(counters(game, artist)).toBe(3);
  });

  it("still puts two counters for a five-mana spell countered before the trigger resolves", () => {
    const { game } = table();
    const artist = spawn(game, "Tackle Artist");
    lands(game, "Mountain", 5);
    const axe = toHand(game, "Lava Axe");
    cast(game, axe, { targets: [ref(B)], settle: false });
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(axe)]);
    settle(game);
    expect(zone(game, axe)).toBe("graveyard");
    expect(counters(game, artist)).toBe(2);
    expect(life(game, B)).toBe(20);
  });
});

describe("Spectacular Skywhale", () => {
  it("opus: +3/+0 for a cheap spell, three counters instead for five or more mana", () => {
    const { game } = table();
    const whale = spawn(game, "Spectacular Skywhale");
    lands(game, "Mountain", 6);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(pt(game, whale)).toEqual({ power: 4, toughness: 4 });
    expect(counters(game, whale)).toBe(0);
    cast(game, toHand(game, "Lava Axe"), { targets: [ref(B)] });
    expect(counters(game, whale)).toBe(3);
    expect(pt(game, whale)).toEqual({ power: 7, toughness: 7 });
  });
});

describe("Visionary's Dance", () => {
  it("makes two 3/3 flying Elementals", () => {
    const { game } = table();
    lands(game, "Island", 4);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Visionary's Dance"));
    const tokens = named(game, "Elemental Token (3/3 Blue-Red Flying)");
    expect(tokens).toHaveLength(2);
    expect(pt(game, tokens[0])).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, tokens[0]).has("flying")).toBe(true);
  });

  it("{2}, discard it: one of the top two to hand, the other to the graveyard", () => {
    const { a, game } = table();
    lands(game, "Island", 2);
    const bottom = toLibrary(game, "Opt");
    const top = toLibrary(game, "Grizzly Bears");
    const dance = toHand(game, "Visionary's Dance");
    pickFromZone(a, bottom);
    activate(game, dance, 0);
    expect(zone(game, dance)).toBe("graveyard");
    expect(zone(game, bottom)).toBe("hand");
    expect(zone(game, top)).toBe("graveyard");
  });
});

describe("Duel Tactics", () => {
  it("deals 1 damage and the creature can't block; it has flashback", () => {
    const { a, game } = table();
    const giant = spawn(game, "Hill Giant", B);
    const other = spawn(game, "Hill Giant", B);
    const free = spawn(game, "Craw Wurm", B);
    lands(game, "Mountain", 3);
    const tactics = toHand(game, "Duel Tactics");
    cast(game, tactics, { targets: [ref(giant)] });
    expect(game.state.objects[giant].damageMarked).toBe(1);
    expect(zone(game, tactics)).toBe("graveyard");
    // Flashback from the graveyard, then exiled.
    cast(game, tactics, { targets: [ref(other)], via: "flashback" });
    expect(game.state.objects[other].damageMarked).toBe(1);
    expect(zone(game, tactics)).toBe("exile");
    const bears = spawn(game, "Grizzly Bears");
    const offer = blockOffer(game, a, [bears]);
    const blockers = offer.eligible.filter((e) => e.canBlock.length > 0).map((e) => e.blocker);
    expect(blockers).toEqual([free]);
  });
});

describe("Spirit Mascot", () => {
  it("one counter per move, however many cards leave your graveyard together", () => {
    const { game } = table();
    const mascot = spawn(game, "Spirit Mascot");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Opt");
    game.debugApplyEffect(A, { kind: "exile-graveyard", target: "you" });
    settle(game);
    expect(counters(game, mascot)).toBe(1);
    const card = toGraveyard(game, "Lightning Bolt");
    game.debugApplyEffect(A, { kind: "return-to-hand", target: 0, from: "graveyard" }, [ref(card)]);
    settle(game);
    expect(counters(game, mascot)).toBe(2);
  });

  it("an opponent's graveyard doesn't count", () => {
    const { game } = table();
    const mascot = spawn(game, "Spirit Mascot");
    toGraveyard(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "exile-graveyard", target: "you" });
    settle(game);
    expect(counters(game, mascot)).toBe(0);
  });
});

describe("Molten Note", () => {
  it("deals damage equal to the mana spent and untaps your creatures", () => {
    const { game } = table();
    const wurm = spawn(game, "Craw Wurm", B);
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Mountain", 2);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Molten Note"), { targets: [ref(wurm)], x: 1 });
    expect(game.state.objects[wurm].damageMarked).toBe(3);
    expect(game.state.objects[bears].tapped).toBe(false);
  });

  it("cast with flashback, it counts the eight mana spent", () => {
    const { game } = table();
    const dragon = spawn(game, "Craw Wurm", B);
    game.state.objects[dragon].counters["+1/+1"] = 5;
    lands(game, "Mountain", 7);
    lands(game, "Plains", 1);
    const note = toGraveyard(game, "Molten Note");
    cast(game, note, { targets: [ref(dragon)], via: "flashback" });
    expect(game.state.objects[dragon].damageMarked).toBe(8);
    expect(zone(game, note)).toBe("exile");
  });
});

describe("Stress Dream", () => {
  it("deals 5 damage, then one of the top two to hand and the other to the bottom", () => {
    const { a, game } = table();
    const wurm = spawn(game, "Craw Wurm", B);
    lands(game, "Island", 4);
    lands(game, "Mountain", 1);
    const second = toLibrary(game, "Opt");
    const first = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, second);
    cast(game, toHand(game, "Stress Dream"), { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
    expect(zone(game, second)).toBe("hand");
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(first);
  });

  it("with no target chosen, still looks", () => {
    const { a, game } = table();
    lands(game, "Island", 4);
    lands(game, "Mountain", 1);
    toLibrary(game, "Opt");
    const first = toLibrary(game, "Grizzly Bears");
    pickFromZone(a, first);
    cast(game, toHand(game, "Stress Dream"), { targets: [null] });
    expect(zone(game, first)).toBe("hand");
  });

  it("with its target gone, it doesn't resolve at all", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 4);
    lands(game, "Mountain", 1);
    const first = toLibrary(game, "Grizzly Bears");
    cast(game, toHand(game, "Stress Dream"), { targets: [ref(bears)], settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, first)).toBe("library");
    expect(graveyard(game, A).some((id) => game.state.objects[id].cardName === "Stress Dream")).toBe(true);
  });
});

describe("Thornfist Striker", () => {
  it("creatures you control get +1/+0 and trample once you've gained life this turn", () => {
    const { game } = table();
    const striker = spawn(game, "Thornfist Striker");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).has("trample")).toBe(false);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 });
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, striker)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    game.advanceUntil((s) => s.turn.number === 2);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("has ward {1}", () => {
    const { game } = table();
    expect(game.registry.get("Thornfist Striker").triggered[0]?.effect).toEqual({
      kind: "ward",
      cost: { mana: "{1}" },
    });
  });
});

describe("Magmablood Archaic", () => {
  it("creatures you control get +1/+0 for each colour spent on the instant or sorcery", () => {
    const { game } = table();
    const archaic = spawn(game, "Magmablood Archaic");
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Lightning Helix"), { targets: [ref(B)] });
    expect(pt(game, archaic)).toEqual({ power: 4, toughness: 2 });
  });

  it("counts the colours of a spell countered before the trigger resolves (the ruling)", () => {
    const { game } = table();
    const archaic = spawn(game, "Magmablood Archaic");
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    const helix = toHand(game, "Lightning Helix");
    cast(game, helix, { targets: [ref(B)], settle: false });
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(helix)]);
    settle(game);
    expect(zone(game, helix)).toBe("graveyard");
    expect(pt(game, archaic)).toEqual({ power: 4, toughness: 2 });
  });
});
