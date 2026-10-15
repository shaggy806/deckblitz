/**
 * Set walk batch 80, part b (2026-10-15): Marvel's Spider-Man (SPM), the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
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

/** `seat`'s player discards `card`, settled — a real discard (mayhem sees it). */
function discard(game: Game, seat: ScriptedController, card: ObjectId): void {
  seat.chooseDiscardsFn = () => [card];
  game.debugApplyEffect(seat.playerId, { kind: "discard", target: "you", amount: 1 });
  settle(game);
}

/** The cast offers for `card` from wherever it is. */
const castOffers = (game: Game, card: ObjectId, player: PlayerId = A) =>
  game.legalActions(player).filter((o) => o.kind === "cast-spell" && o.card === card);

/** A non-mana activated ability `source` offers right now, if any. */
const abilityOffer = (game: Game, source: ObjectId, player: PlayerId = A) =>
  game.legalActions(player).find((o) => o.kind === "activate-ability" && o.source === source && o.manaAbility !== true);

const restrictions = (game: Game, id: ObjectId): readonly string[] => [...game.characteristics(id).restrictions];

/** Alice's creature `attacker` attacks bob; the game stops in declare
 * attackers with her priority and nothing on the stack. */
function attackAndHold(game: Game, seat: ScriptedController, attacker: ObjectId): void {
  seat.declareAttackersFn = () => [{ attacker, defender: B }];
  game.advanceUntil(
    (s) =>
      s.turn.step === "declare-attackers" &&
      s.priority.holder === A &&
      s.awaiting === null &&
      s.objects[attacker].attacking !== null &&
      s.zones.shared.stack.length === 0 &&
      s.pendingTriggers.length === 0,
  );
}

describe("Friendly Neighborhood", () => {
  it("makes three Citizens and gives the land a pump counting your creatures, at sorcery speed", () => {
    const { game } = table();
    const plains = lands(game, "Plains", 5);
    const land = plains[0];
    cast(game, toHand(game, "Friendly Neighborhood"), { targets: [ref(land)] });
    expect(tokensNamed(game, "Human Citizen Token", A)).toBe(3);
    for (const id of plains) game.state.objects[id].tapped = false;
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    const offer = abilityOffer(game, land);
    expect(offer?.kind).toBe("activate-ability");
    if (offer?.kind !== "activate-ability") return;
    activate(game, land, offer.abilityIndex, { targets: [ref(bears)] });
    // Three Citizens and the Bears: +4/+4 (bob's Bears don't count).
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    expect(game.state.objects[land].tapped).toBe(true);
  });

  it("isn't offered outside a main phase", () => {
    const { game } = table();
    const plains = lands(game, "Plains", 5);
    cast(game, toHand(game, "Friendly Neighborhood"), { targets: [ref(plains[0])] });
    for (const id of plains) game.state.objects[id].tapped = false;
    expect(abilityOffer(game, plains[0])).toBeDefined();
    toStep(game, "begin-combat");
    expect(abilityOffer(game, plains[0])).toBeUndefined();
  });
});

describe("Madame Web, Clairvoyant", () => {
  it("casts Spider spells and noncreature spells off the top, not other creatures", () => {
    const { game } = table();
    spawn(game, "Madame Web, Clairvoyant");
    lands(game, "Mountain", 2);
    lands(game, "Swamp", 1);
    const bears = toLibrary(game, "Grizzly Bears");
    expect(castOffers(game, bears)).toHaveLength(0);
    const bolt = toLibrary(game, "Lightning Bolt");
    expect(castOffers(game, bolt).map((o) => o.kind === "cast-spell" && o.via)).toEqual(["library-top"]);
    const spider = toLibrary(game, "Scarlet Spider, Kaine");
    expect(castOffers(game, bolt)).toHaveLength(0);
    cast(game, spider, { via: "library-top" });
    expect(zone(game, spider)).toBe("battlefield");
  });

  it("may mill a card whenever you attack", () => {
    const { game, a } = table();
    const web = spawn(game, "Madame Web, Clairvoyant");
    const top = toLibrary(game, "Grizzly Bears");
    pickModes(a, 0);
    attack(game, a, [web]);
    expect(zone(game, top)).toBe("graveyard");
  });
});

describe("Scout the City", () => {
  it("Look Around mills three, keeps a permanent card, and gains 3 life", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const bolt = toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    const angel = toLibrary(game, "Serra Angel");
    const seen = pickFromZone(a, bears);
    cast(game, toHand(game, "Scout the City"), { modes: [0] });
    expect(seen.offered).toEqual(expect.arrayContaining([bears, angel]));
    expect(seen.offered).not.toContain(bolt);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, angel)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("graveyard");
    expect(life(game)).toBe(23);
  });

  it("Bring Down destroys a creature with flying, only", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const angel = spawn(game, "Serra Angel", B);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "Scout the City"), { modes: [1], targets: [ref(bears)] })).toThrow();
    cast(game, toHand(game, "Scout the City"), { modes: [1], targets: [ref(angel)] });
    expect(zone(game, angel)).toBe("graveyard");
  });
});

describe("Scarlet Spider, Kaine", () => {
  it("gets a counter only for a discard", () => {
    const { game, a } = table();
    const bolt = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [bolt];
    pickModes(a, 0);
    const spider = enter(game, "Scarlet Spider, Kaine");
    expect(zone(game, bolt)).toBe("graveyard");
    expect(counters(game, spider)).toBe(1);
  });

  it("gets no counter when the discard is declined", () => {
    const { game, a } = table();
    const before = hand(game).length;
    pickModes(a);
    const spider = enter(game, "Scarlet Spider, Kaine");
    expect(counters(game, spider)).toBe(0);
    expect(hand(game)).toHaveLength(before);
  });

  it("is cast from the graveyard for {B/R} the turn it was discarded", () => {
    const { game, a } = table();
    const spider = toHand(game, "Scarlet Spider, Kaine");
    discard(game, a, spider);
    lands(game, "Mountain", 1);
    const offers = castOffers(game, spider);
    expect(offers).toHaveLength(1);
    expect(offers[0]).toMatchObject({ via: "mayhem" });
    cast(game, spider, { via: "mayhem" });
    expect(zone(game, spider)).toBe("battlefield");
  });
});

describe("Wisecrack", () => {
  it("has a creature deal its power to itself, and nothing to its controller unless it's attacking", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Wisecrack"), { targets: [ref(dreadmaw)] });
    expect(zone(game, dreadmaw)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });

  it("deals 2 to the controller of an attacking creature", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const angel = spawn(game, "Serra Angel");
    attackAndHold(game, a, angel);
    cast(game, toHand(game, "Wisecrack"), { targets: [ref(angel)] });
    // The Angel's own 4 damage is dealt by it: 4/4, so it dies; Wisecrack hits alice.
    expect(zone(game, angel)).toBe("graveyard");
    expect(life(game, A)).toBe(18);
  });
});

describe("Doc Ock, Sinister Scientist", () => {
  it("is 8/8 with eight cards in your graveyard", () => {
    const { game } = table();
    const ock = spawn(game, "Doc Ock, Sinister Scientist");
    for (let i = 0; i < 7; i += 1) toGraveyard(game, "Wastes");
    toGraveyard(game, "Wastes", B);
    expect(pt(game, ock)).toEqual({ power: 4, toughness: 5 });
    toGraveyard(game, "Wastes");
    expect(pt(game, ock)).toEqual({ power: 8, toughness: 8 });
  });

  it("has hexproof only beside another Villain", () => {
    const { game } = table();
    const ock = spawn(game, "Doc Ock, Sinister Scientist");
    expect(keywords(game, ock).has("hexproof")).toBe(false);
    spawn(game, "Morbius the Living Vampire", B);
    expect(keywords(game, ock).has("hexproof")).toBe(false);
    spawn(game, "Morbius the Living Vampire");
    expect(keywords(game, ock).has("hexproof")).toBe(true);
  });
});

describe("Eerie Gravestone", () => {
  it("draws on entering, and sacrifices to mill four and keep a creature card", () => {
    const { game, a } = table();
    const before = hand(game).length;
    const stone = enter(game, "Eerie Gravestone");
    expect(hand(game)).toHaveLength(before + 1);
    lands(game, "Swamp", 2);
    const bolt = toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, bears);
    activate(game, stone);
    expect(seen.offered).toEqual([bears]);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, bolt)).toBe("graveyard");
    expect(zone(game, stone)).toBe("graveyard");
  });
});

describe("Terrific Team-Up", () => {
  it("costs {2} less with a permanent of mana value 4 or greater", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel", B);
    const spell = toHand(game, "Terrific Team-Up");
    expect(() => cast(game, spell, { targets: [ref(bears), null, ref(angel)] })).toThrow();
    spawn(game, "Colossal Dreadmaw");
    cast(game, spell, { targets: [ref(bears), null, ref(angel)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(game.state.objects[angel].damageMarked).toBe(3);
  });

  it("pumps two creatures, which each deal their power to the opponent's creature", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Terrific Team-Up"), { targets: [ref(bears), ref(elves), ref(angel)] });
    expect(zone(game, angel)).toBe("graveyard");
    expect(pt(game, elves)).toEqual({ power: 2, toughness: 1 });
    // One-sided: the Angel deals nothing back.
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, elves)).toBe("battlefield");
  });
});

describe("Morbius the Living Vampire", () => {
  it("exiles itself from the graveyard to keep one of the top three", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    const morbius = toGraveyard(game, "Morbius the Living Vampire");
    const bolt = toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    const angel = toLibrary(game, "Serra Angel");
    // The one kept, then the order of the other two on the bottom.
    a.chooseFromZoneFn = (_view, eligible, min) => (min === 1 ? [bears] : eligible.slice(0, min));
    activate(game, morbius);
    expect(zone(game, morbius)).toBe("exile");
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, bolt)).toBe("library");
    expect(zone(game, angel)).toBe("library");
  });

  it("can't use it from the battlefield", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    const morbius = spawn(game, "Morbius the Living Vampire");
    expect(abilityOffer(game, morbius)).toBeUndefined();
    expect(keywords(game, morbius)).toEqual(new Set(["flying", "vigilance", "lifelink"]));
  });
});

describe("Cheering Crowd", () => {
  it("lets the active player add a counter and {C} for each counter, in their main phase", () => {
    const { game, a, b } = table();
    const crowd = spawn(game, "Cheering Crowd");
    pickModes(b, 0);
    nextTurn(game);
    settle(game);
    expect(counters(game, crowd)).toBe(1);
    expect(game.state.players[B].manaPool.map((u) => u.type)).toEqual(["C"]);
    expect(game.state.players[A].manaPool).toHaveLength(0);

    pickModes(a, 0);
    nextTurn(game);
    settle(game);
    expect(counters(game, crowd)).toBe(2);
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["C", "C"]);
  });

  it("does nothing when declined", () => {
    const { game, b } = table();
    const crowd = spawn(game, "Cheering Crowd");
    pickModes(b);
    nextTurn(game);
    settle(game);
    expect(counters(game, crowd)).toBe(0);
    expect(game.state.players[B].manaPool).toHaveLength(0);
  });
});

describe("Pictures of Spider-Man", () => {
  it("keeps up to two creature cards of the top five, then sacrifices for a Treasure", () => {
    const { game, a } = table();
    const bolt = toLibrary(game, "Lightning Bolt");
    const bears = toLibrary(game, "Grizzly Bears");
    const angel = toLibrary(game, "Serra Angel");
    const elves = toLibrary(game, "Llanowar Elves");
    const seen = pickFromZone(a, bears, angel);
    const pictures = enter(game, "Pictures of Spider-Man");
    expect(seen.offered).toEqual(expect.arrayContaining([bears, angel, elves]));
    expect(seen.offered).not.toContain(bolt);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, angel)).toBe("hand");
    expect(zone(game, elves)).toBe("library");
    expect(zone(game, bolt)).toBe("library");

    lands(game, "Wastes", 1);
    activate(game, pictures);
    expect(zone(game, pictures)).toBe("graveyard");
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });
});

describe("Shriek, Treblemaker", () => {
  it("discards at your first main phase to stop a creature blocking", () => {
    const { game, a } = table();
    spawn(game, "Shriek, Treblemaker");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickTargets(a, bears);
    const before = graveyard(game).length;
    toStep(game, "precombat-main");
    settle(game);
    expect(graveyard(game)).toHaveLength(before + 1);
    expect(restrictions(game, bears)).toContain("cant-block");
  });

  it("deals 1 damage to an opponent whose creature dies", () => {
    const { game } = table();
    spawn(game, "Shriek, Treblemaker");
    destroy(game, spawn(game, "Grizzly Bears", B));
    expect(life(game, B)).toBe(19);
    destroy(game, spawn(game, "Grizzly Bears"));
    expect(life(game, A)).toBe(20);
  });
});

describe("School Daze", () => {
  it("draws three", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const spell = toHand(game, "School Daze");
    const before = hand(game).length;
    cast(game, spell, { modes: [0] });
    expect(hand(game)).toHaveLength(before - 1 + 3);
  });

  it("counters a spell and draws a card", () => {
    const { game } = table();
    lands(game, "Island", 5);
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    const spell = toHand(game, "School Daze");
    const before = hand(game).length;
    cast(game, spell, { modes: [1], targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before - 1 + 1);
  });
});

describe("Molten Man, Inferno Incarnate", () => {
  it("fetches a basic Mountain tapped and grows with each Mountain", () => {
    const { game, a } = table();
    // A nonbasic Mountain counts too (any Mountain you control).
    spawn(game, "Stomping Ground");
    const mountain = toLibrary(game, "Mountain");
    pickFromZone(a, mountain);
    const molten = enter(game, "Molten Man, Inferno Incarnate");
    expect(zone(game, mountain)).toBe("battlefield");
    expect(game.state.objects[mountain].tapped).toBe(true);
    expect(pt(game, molten)).toEqual({ power: 2, toughness: 2 });
    spawn(game, "Mountain", B);
    expect(pt(game, molten)).toEqual({ power: 2, toughness: 2 });
  });

  it("sacrifices a land when he leaves, dying as a 0/0 included", () => {
    const { game } = table();
    const [forest] = lands(game, "Forest", 1);
    const molten = enter(game, "Molten Man, Inferno Incarnate");
    expect(zone(game, molten)).toBe("graveyard");
    expect(zone(game, forest)).toBe("graveyard");
  });
});

describe("Rhino, Barreling Brute", () => {
  it("draws on attacking only after a spell of mana value 4 or greater this turn", () => {
    const { game, a } = table();
    const rhino = spawn(game, "Rhino, Barreling Brute");
    lands(game, "Forest", 6);
    cast(game, toHand(game, "Grizzly Bears"));
    const before = hand(game).length;
    attack(game, a, [rhino]);
    expect(hand(game)).toHaveLength(before);

    nextTurn(game);
    toStep(game, "precombat-main");
    for (const id of game.battlefield) game.state.objects[id].tapped = false;
    cast(game, toHand(game, "Colossal Dreadmaw"));
    const then = hand(game).length;
    attack(game, a, [rhino]);
    expect(hand(game)).toHaveLength(then + 1);
  });
});

describe("Pumpkin Bombardment", () => {
  it("costs a discard or {2} on top, and deals 3 damage", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const bolt = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [bolt];
    const angel = spawn(game, "Serra Angel", B);
    const spell = toHand(game, "Pumpkin Bombardment");
    expect(castOffers(game, spell)).toHaveLength(1);
    cast(game, spell, { targets: [ref(angel)], costOption: 0 });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(game.state.objects[angel].damageMarked).toBe(3);

    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const again = toHand(game, "Pumpkin Bombardment");
    const handBefore = hand(game).length;
    cast(game, again, { targets: [ref(bears)], costOption: 1 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(hand(game)).toHaveLength(handBefore - 1);
  });
});

describe("Damage Control Crew", () => {
  it("Repair returns a card of mana value 4 or greater from your graveyard", () => {
    const { game, a } = table();
    const dreadmaw = toGraveyard(game, "Colossal Dreadmaw");
    const angel = toGraveyard(game, "Serra Angel");
    const bears = toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Serra Angel", B);
    pickModes(a, 0);
    const seen = watchTargets(a, () => [dreadmaw]);
    enter(game, "Damage Control Crew");
    expect([...seen.offered[0]].sort()).toEqual([dreadmaw, angel].sort());
    expect(seen.offered[0]).not.toContain(bears);
    expect(zone(game, dreadmaw)).toBe("hand");
  });

  it("Impound exiles an artifact or enchantment", () => {
    const { game, a } = table();
    const pictures = spawn(game, "Pictures of Spider-Man", B);
    // Something for Repair too, so both modes are on offer.
    toGraveyard(game, "Colossal Dreadmaw");
    pickModes(a, 1);
    pickTargets(a, pictures);
    enter(game, "Damage Control Crew");
    expect(zone(game, pictures)).toBe("exile");
  });
});

describe("Vulture, Scheming Scavenger", () => {
  it("gives your other Villains flying as he attacks", () => {
    const { game, a } = table();
    const vulture = spawn(game, "Vulture, Scheming Scavenger");
    const ock = spawn(game, "Doc Ock, Sinister Scientist");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Doc Ock, Sinister Scientist", B);
    expect(keywords(game, ock).has("flying")).toBe(false);
    attack(game, a, [vulture]);
    expect(keywords(game, ock).has("flying")).toBe(true);
    expect(keywords(game, bears).has("flying")).toBe(false);
    expect(keywords(game, theirs).has("flying")).toBe(false);
    nextTurn(game);
    expect(keywords(game, ock).has("flying")).toBe(false);
  });
});

describe("Ezekiel Sims, Spider-Totem", () => {
  it("pumps a Spider you control at the beginning of combat", () => {
    const { game, a } = table();
    const ezekiel = spawn(game, "Ezekiel Sims, Spider-Totem");
    const spider = spawn(game, "Scarlet Spider, Kaine");
    spawn(game, "Grizzly Bears");
    spawn(game, "Scarlet Spider, Kaine", B);
    const seen = watchTargets(a, () => [spider]);
    toStep(game, "begin-combat");
    settle(game);
    expect([...seen.offered[0]].sort()).toEqual([ezekiel, spider].sort());
    expect(pt(game, spider)).toEqual({ power: 4, toughness: 3 });
  });
});

describe("Mechanical Mobster", () => {
  it("exiles a graveyard card and has a creature connive", () => {
    const { game, a } = table();
    const theirs = toGraveyard(game, "Lightning Bolt", B);
    const bolt = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [bolt];
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, theirs, bears);
    enter(game, "Mechanical Mobster");
    expect(zone(game, theirs)).toBe("exile");
    expect(zone(game, bolt)).toBe("graveyard");
    expect(counters(game, bears)).toBe(1);
  });

  it("may exile nothing, and a land discarded gives no counter", () => {
    const { game, a } = table();
    const yard = toGraveyard(game, "Lightning Bolt", B);
    const wastes = hand(game)[0];
    a.chooseDiscardsFn = () => [wastes];
    const before = hand(game).length;
    a.chooseTargetsFn = (_view, _source, _specs, options) => [null, options[1][0]];
    const mobster = enter(game, "Mechanical Mobster");
    expect(zone(game, yard)).toBe("graveyard");
    expect(zone(game, wastes)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before);
    expect(counters(game, mobster)).toBe(0);
  });
});

describe("Skyward Spider", () => {
  it("has flying while modified", () => {
    const { game } = table();
    const spider = spawn(game, "Skyward Spider");
    expect(keywords(game, spider).has("flying")).toBe(false);
    game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "stun", amount: 1 }, [ref(spider)]);
    settle(game);
    expect(keywords(game, spider).has("flying")).toBe(true);
  });
});

describe("Sandman's Quicksand", () => {
  it("shrinks every creature cast normally", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const mine = spawn(game, "Colossal Dreadmaw");
    const theirs = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Sandman's Quicksand"));
    expect(pt(game, mine)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, theirs)).toEqual({ power: 4, toughness: 4 });
  });

  it("only the opponents' creatures when cast for its mayhem cost", () => {
    const { game, a } = table();
    const mine = spawn(game, "Colossal Dreadmaw");
    const theirs = spawn(game, "Colossal Dreadmaw", B);
    const quicksand = toHand(game, "Sandman's Quicksand");
    discard(game, a, quicksand);
    lands(game, "Swamp", 4);
    cast(game, quicksand, { via: "mayhem" });
    expect(pt(game, mine)).toEqual({ power: 6, toughness: 6 });
    expect(pt(game, theirs)).toEqual({ power: 4, toughness: 4 });
    expect(zone(game, quicksand)).toBe("graveyard");
  });
});
