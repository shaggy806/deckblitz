/**
 * Set walk batch 82, part d (2026-10-15): Final Fantasy (FIN) and Final Fantasy Commander (FIC), the rest of the sets.
 * Written on the shared table in `harness.ts`.
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
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickPermanents,
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
  watchTargets,
  zone,
} from "./harness.js";

const HERO = "Hero Token (Black Mage's Rod)";

/** `id` becomes an artifact creature until end of turn — a crewed Vehicle. */
const crewed = (game: Game, id: ObjectId): void =>
  game.debugApplyEffect(A, { kind: "add-types", target: 0, addTypes: ["artifact", "creature"], duration: "end-of-turn" }, [
    ref(id),
  ]);

const castOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((o) => o.kind === "cast-spell" && o.card === card);

describe("Travel the Overworld", () => {
  it("costs {1} less for each Town you control, then draws four", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const travel = toHand(game, "Travel the Overworld");
    // Seven mana, five Islands: not without Towns.
    expect(() => cast(game, travel)).toThrow();
    spawn(game, "Capital City", A, { tapped: true });
    spawn(game, "Crossroads Village", A, { tapped: true });
    const before = hand(game).length;
    cast(game, travel);
    expect(hand(game).length).toBe(before - 1 + 4);
  });
});

describe("Shantotto, Tactician Magician", () => {
  it("gets +X/+0 for the mana spent on a noncreature spell, and draws when X is 4 or more", () => {
    const { game } = table();
    const shantotto = spawn(game, "Shantotto, Tactician Magician");
    lands(game, "Island", 7);
    const divination = toHand(game, "Divination");
    let before = hand(game).length;
    cast(game, divination);
    expect(pt(game, shantotto)).toEqual({ power: 3, toughness: 4 });
    expect(hand(game).length).toBe(before - 1 + 2);
    const concentrate = toHand(game, "Concentrate");
    before = hand(game).length;
    cast(game, concentrate);
    expect(pt(game, shantotto)).toEqual({ power: 7, toughness: 4 });
    // Three from Concentrate, one from Shantotto.
    expect(hand(game).length).toBe(before - 1 + 4);
  });

  it("doesn't trigger on a creature spell", () => {
    const { game } = table();
    const shantotto = spawn(game, "Shantotto, Tactician Magician");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(pt(game, shantotto)).toEqual({ power: 0, toughness: 4 });
  });
});

describe("Airship Crash", () => {
  it("destroys a creature with flying but can't target one without", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const drake = spawn(game, "Wind Drake", B);
    const crash = toHand(game, "Airship Crash");
    expect(() => cast(game, crash, { targets: [ref(bears)] })).toThrow();
    cast(game, crash, { targets: [ref(drake)] });
    expect(zone(game, drake)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Giott, King of the Dwarves", () => {
  it("loots when it or another Dwarf enters and when an Equipment enters, not for other creatures", () => {
    const { game, a } = table();
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    const discards: ObjectId[] = [];
    a.chooseDiscardsFn = (cards) => {
      discards.push(cards[0].id);
      return [cards[0].id];
    };
    toHand(game, "Lightning Bolt");
    toHand(game, "Lightning Bolt");
    toHand(game, "Lightning Bolt");
    enter(game, "Giott, King of the Dwarves");
    expect(asked).toBe(1);
    enter(game, "Axgard Cavalry");
    expect(asked).toBe(2);
    enter(game, "Bonesplitter");
    expect(asked).toBe(3);
    enter(game, "Grizzly Bears");
    expect(asked).toBe(3);
    expect(discards).toHaveLength(3);
    for (const id of discards) expect(zone(game, id)).toBe("graveyard");
  });
});

describe("Slash of Light", () => {
  it("deals damage equal to creatures you control plus Equipment you control", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Silvercoat Lion");
    spawn(game, "Bonesplitter");
    lands(game, "Plains", 2);
    const elemental = spawn(game, "Air Elemental", B);
    cast(game, toHand(game, "Slash of Light"), { targets: [ref(elemental)] });
    expect(game.state.objects[elemental].damageMarked).toBe(3);
  });
});

describe("Summon: Esper Ramuh", () => {
  it("bolts for the noncreature, nonland cards in your graveyard, then pumps Wizards on II and III", () => {
    const { game } = table();
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Divination");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Forest");
    const giant = spawn(game, "Hill Giant", B);
    const mage = spawn(game, "Alabaster Mage");
    lands(game, "Mountain", 4);
    const ramuh = toHand(game, "Summon: Esper Ramuh");
    cast(game, ramuh);
    expect(counters(game, ramuh, "lore")).toBe(1);
    expect(game.state.objects[giant].damageMarked).toBe(2);
    toStep(game, "precombat-main");
    settle(game);
    expect(counters(game, ramuh, "lore")).toBe(2);
    expect(pt(game, mage)).toEqual({ power: 3, toughness: 1 });
    expect(pt(game, ramuh)).toEqual({ power: 4, toughness: 3 });
    toStep(game, "precombat-main");
    settle(game);
    expect(zone(game, ramuh)).toBe("graveyard");
    expect(pt(game, mage)).toEqual({ power: 3, toughness: 1 });
  });
});

describe("Barret Wallace", () => {
  it("deals damage to defending player for each equipped creature you control as it attacks", () => {
    const { game, a } = table();
    const barret = spawn(game, "Barret Wallace");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Silvercoat Lion");
    const splitter = spawn(game, "Bonesplitter");
    lands(game, "Plains", 1);
    activate(game, splitter, 0, { targets: [ref(bears)] });
    attack(game, a, [barret]);
    // 4 combat damage, 1 for the one equipped creature (not attacking).
    expect(life(game, B)).toBe(15);
  });
});

describe("Prompto Argentum", () => {
  it("makes a Treasure for a noncreature spell with four or more mana spent on it, not three", () => {
    const { game } = table();
    spawn(game, "Prompto Argentum");
    lands(game, "Island", 7);
    cast(game, toHand(game, "Divination"));
    expect(tokensNamed(game, "Treasure Token")).toBe(0);
    cast(game, toHand(game, "Concentrate"));
    expect(tokensNamed(game, "Treasure Token")).toBe(1);
  });
});

describe("Seifer Almasy", () => {
  it("gives a creature attacking alone double strike", () => {
    const { game, a } = table();
    const seifer = spawn(game, "Seifer Almasy");
    attack(game, a, [seifer]);
    expect(life(game, B)).toBe(14);
  });

  it("casts an instant or sorcery card with mana value 3 or less from your graveyard free, exiling it after", () => {
    const { game, a } = table();
    const seifer = spawn(game, "Seifer Almasy");
    const bears = spawn(game, "Grizzly Bears");
    const divination = toGraveyard(game, "Divination");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const concentrate = toGraveyard(game, "Concentrate");
    const seen = watchTargets(a, () => [divination]);
    a.chooseCastNowFn = (_view, offer) => ({
      type: "cast-spell",
      player: A,
      card: divination,
      targets: [],
      via: offer.casts.find((c) => c.card === divination)!.via,
      ...(offer.free ? { free: true } : {}),
    });
    const before = hand(game).length;
    // Not alone, so no double strike: 3 + 2.
    attack(game, a, [seifer, bears]);
    expect(life(game, B)).toBe(15);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([divination, bolt]));
    expect(seen.offered[0]).not.toContain(concentrate);
    expect(hand(game).length).toBe(before + 2);
    expect(zone(game, divination)).toBe("exile");
  });
});

describe("Ignis Scientia", () => {
  it("may put a land from the top six onto the battlefield tapped as it enters", () => {
    const { game, a } = table({ deck: "Grizzly Bears" });
    const forest = toLibrary(game, "Forest");
    pickFromZone(a, forest);
    enter(game, "Ignis Scientia");
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
  });

  it("exiles a card from a graveyard, making a Food only for a creature card", () => {
    const { game } = table();
    const ignis = spawn(game, "Ignis Scientia");
    lands(game, "Forest", 4);
    lands(game, "Island", 2);
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    activate(game, ignis, 0, { targets: [ref(bolt)] });
    expect(zone(game, bolt)).toBe("exile");
    expect(tokensNamed(game, "Food Token")).toBe(0);
    game.state.objects[ignis].tapped = false;
    const bears = toGraveyard(game, "Grizzly Bears", B);
    activate(game, ignis, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, "Food Token")).toBe(1);
  });
});

describe("Thief's Knife", () => {
  it("makes a Rogue Hero wearing it; its wearer draws on combat damage to a player", () => {
    const { game, a } = table();
    lands(game, "Island", 7);
    const knife = toHand(game, "Thief's Knife");
    cast(game, knife);
    const [hero] = named(game, HERO);
    expect(game.state.objects[knife].attachedTo).toBe(hero);
    expect(pt(game, hero)).toEqual({ power: 2, toughness: 2 });
    expect(subtypes(game, hero)).toEqual(expect.arrayContaining(["Hero", "Rogue"]));
    const bears = spawn(game, "Grizzly Bears");
    activate(game, knife, 0, { targets: [ref(bears)] });
    expect(game.state.objects[knife].attachedTo).toBe(bears);
    const before = hand(game).length;
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(17);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Cargo Ship", () => {
  it("makes {C} only for an artifact spell or an artifact's ability", () => {
    const { game } = table();
    spawn(game, "Cargo Ship");
    lands(game, "Island", 1);
    const think = toHand(game, "Think Twice");
    expect(() => cast(game, think)).toThrow();
    const ring = toHand(game, "Sol Ring");
    cast(game, ring);
    expect(zone(game, ring)).toBe("battlefield");
  });
});

describe("Warrior's Sword", () => {
  it("makes a 4/3 Warrior Hero wearing it", () => {
    const { game } = table();
    const sword = enter(game, "Warrior's Sword");
    const [hero] = named(game, HERO);
    expect(game.state.objects[sword].attachedTo).toBe(hero);
    expect(pt(game, hero)).toEqual({ power: 4, toughness: 3 });
    expect(subtypes(game, hero)).toContain("Warrior");
  });
});

describe("Sage's Nouliths", () => {
  it("its wearer untaps target attacking creature as it attacks", () => {
    const { game, a } = table();
    lands(game, "Island", 5);
    const nouliths = toHand(game, "Sage's Nouliths");
    cast(game, nouliths);
    const [hero] = named(game, HERO);
    expect(pt(game, hero)).toEqual({ power: 2, toughness: 1 });
    expect(subtypes(game, hero)).toContain("Cleric");
    const bears = spawn(game, "Grizzly Bears");
    const lion = spawn(game, "Silvercoat Lion");
    activate(game, nouliths, 0, { targets: [ref(bears)] });
    pickTargets(a, lion);
    attack(game, a, [bears, lion]);
    expect(life(game, B)).toBe(15);
    expect(game.state.objects[lion].tapped).toBe(false);
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Dark Knight's Greatsword", () => {
  it("makes a 4/1 Knight Hero wearing it; equips for 3 life, once each turn", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const sword = toHand(game, "Dark Knight's Greatsword");
    cast(game, sword);
    const [hero] = named(game, HERO);
    expect(pt(game, hero)).toEqual({ power: 4, toughness: 1 });
    expect(subtypes(game, hero)).toContain("Knight");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, sword, 0, { targets: [ref(bears)] });
    expect(life(game, A)).toBe(17);
    expect(game.state.objects[sword].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 2 });
    expect(() => activate(game, sword, 0, { targets: [ref(hero)] })).toThrow();
  });
});

describe("From Father to Son", () => {
  it("tutors a Vehicle to hand, or onto the battlefield when cast from the graveyard", () => {
    const { game, a } = table();
    const ship = toLibrary(game, "Cargo Ship");
    const train = toLibrary(game, "Phantom Train");
    lands(game, "Plains", 9);
    const spell = toHand(game, "From Father to Son");
    pickFromZone(a, ship);
    cast(game, spell);
    expect(zone(game, ship)).toBe("hand");
    expect(zone(game, spell)).toBe("graveyard");
    pickFromZone(a, train);
    cast(game, spell, { via: "flashback" });
    expect(zone(game, train)).toBe("battlefield");
    expect(zone(game, spell)).toBe("exile");
  });
});

describe("The Lunar Whale", () => {
  it("lets you play the top card of your library only once it has attacked this turn", () => {
    const { game, a } = table();
    const whale = spawn(game, "The Lunar Whale");
    const bolt = toLibrary(game, "Lightning Bolt");
    lands(game, "Mountain", 1);
    expect(castOffers(game, bolt)).toHaveLength(0);
    crewed(game, whale);
    attack(game, a, [whale]);
    expect(life(game, B)).toBe(17);
    expect(castOffers(game, bolt).map((o) => o.kind === "cast-spell" && o.via)).toContain("library-top");
    cast(game, bolt, { targets: [ref(B)], via: "library-top" });
    expect(life(game, B)).toBe(14);
  });
});

describe("Ultimecia, Time Sorceress", () => {
  it("surveils 2 as it enters", () => {
    const { game, a } = table();
    let seen: readonly ObjectId[] = [];
    a.chooseScryFn = (_view, cards) => {
      seen = cards;
      return [];
    };
    enter(game, "Ultimecia, Time Sorceress");
    expect(seen).toHaveLength(2);
  });

  it("at your end step, may pay {4}{U}{U}{B}{B} and exile eight graveyard cards to transform and take an extra turn", () => {
    const { game, a } = table();
    const ultimecia = spawn(game, "Ultimecia, Time Sorceress");
    const cards = Array.from({ length: 9 }, () => toGraveyard(game, "Lightning Bolt"));
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    lands(game, "Wastes", 4);
    pickModes(a, 0);
    pickFromZone(a, ...cards.slice(0, 8));
    toStep(game, "end");
    settle(game);
    expect(game.state.objects[ultimecia].face).toBe(1);
    expect(cards.slice(0, 8).every((id) => zone(game, id) === "exile")).toBe(true);
    expect(zone(game, cards[8])).toBe("graveyard");
    expect(pt(game, ultimecia)).toEqual({ power: 7, toughness: 7 });
    expect(keywords(game, ultimecia).has("menace")).toBe(true);
    expect(game.state.extraTurns).toEqual([A]);
  });

  it("isn't offered with fewer than eight cards in your graveyard", () => {
    const { game, a } = table();
    const ultimecia = spawn(game, "Ultimecia, Time Sorceress");
    for (let i = 0; i < 7; i += 1) toGraveyard(game, "Lightning Bolt");
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    lands(game, "Wastes", 4);
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    toStep(game, "end");
    settle(game);
    expect(asked).toBe(0);
    expect(game.state.objects[ultimecia].face ?? 0).toBe(0);
    expect(graveyard(game)).toHaveLength(7);
  });
});

describe("Sidequest: Play Blitzball", () => {
  it("pumps at the beginning of combat, then transforms and attaches itself once a player took 6 combat damage", () => {
    const { game, a } = table();
    const sidequest = spawn(game, "Sidequest: Play Blitzball");
    const elemental = spawn(game, "Air Elemental");
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    pickTargets(a, elemental);
    pickPermanents(a, bears);
    attack(game, a, [elemental]);
    expect(life(game, B)).toBe(14);
    expect(game.state.objects[sidequest].face).toBe(1);
    expect(types(game, sidequest)).toContain("artifact");
    expect(game.state.objects[sidequest].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, bears).has("double-strike")).toBe(true);
  });

  it("stays a Sidequest when no player was dealt 6 combat damage", () => {
    const { game, a } = table();
    const sidequest = spawn(game, "Sidequest: Play Blitzball");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(16);
    expect(game.state.objects[sidequest].face ?? 0).toBe(0);
  });
});

describe("The Crystal's Chosen", () => {
  it("makes four Heroes, then puts a +1/+1 counter on each creature you control", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Plains", 7);
    cast(game, toHand(game, "The Crystal's Chosen"));
    expect(tokensNamed(game, HERO)).toBe(4);
    for (const hero of named(game, HERO)) expect(pt(game, hero)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(counters(game, giant)).toBe(0);
  });
});

describe("Garland, Knight of Cornelia // Chaos, the Endless", () => {
  it("surveils 1 whenever you cast a noncreature spell", () => {
    const { game, a } = table();
    spawn(game, "Garland, Knight of Cornelia");
    lands(game, "Island", 3);
    let seen: readonly ObjectId[] = [];
    a.chooseScryFn = (_view, cards) => {
      seen = cards;
      return [...cards];
    };
    cast(game, toHand(game, "Divination"));
    expect(seen).toHaveLength(1);
    expect(zone(game, seen[0])).toBe("graveyard");
  });

  it("returns from the graveyard transformed into Chaos, which goes to the library's bottom when it dies", () => {
    const { game } = table();
    const garland = toGraveyard(game, "Garland, Knight of Cornelia");
    lands(game, "Swamp", 4);
    lands(game, "Mountain", 3);
    activate(game, garland, 0);
    expect(zone(game, garland)).toBe("battlefield");
    expect(game.state.objects[garland].face).toBe(1);
    expect(pt(game, garland)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, garland).has("flying")).toBe(true);
    destroy(game, garland);
    expect(zone(game, garland)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(garland);
  });
});

describe("Phantom Train", () => {
  it("sacrifices another artifact or creature for a +1/+1 counter, becoming a Spirit artifact creature this turn", () => {
    const { game } = table();
    const train = spawn(game, "Phantom Train");
    const bears = spawn(game, "Grizzly Bears");
    const activation = (sacrifice: ObjectId) =>
      game.dispatch({ type: "activate-ability", player: A, source: train, abilityIndex: 0, targets: [], sacrifice });
    // Another artifact or creature: never the Train itself.
    expect(() => activation(train)).toThrow();
    activation(bears);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, train)).toBe(1);
    expect(types(game, train)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, train)).toEqual(expect.arrayContaining(["Vehicle", "Spirit"]));
    expect(pt(game, train)).toEqual({ power: 5, toughness: 5 });
    toStep(game, "precombat-main");
    expect(types(game, train)).not.toContain("creature");
    expect(counters(game, train)).toBe(1);
  });
});

