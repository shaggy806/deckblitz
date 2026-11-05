/**
 * Batch 258, group A: the cards freed by the outside-the-game, repeat-modes,
 * skip-draw, shuffle-hand-and-graveyard, look-and-choose-target and other
 * families. One test per card whose behaviour is more than a stat line or a
 * copy of a tested pattern.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
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
  loyalty,
  named,
  nextTurn,
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
  toExile,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  toStep,
  types,
  watchTargets,
  zone,
} from "./harness.js";

const attach = (game: Game, host: ObjectId, attachment: ObjectId): void => {
  game.debugApplyEffect(game.state.objects[attachment].controller, { kind: "attach", target: 0, attachment: 1 }, [ref(host), ref(attachment)]);
  settle(game);
};
const outsideCard = (game: Game, name: string): ObjectId => {
  const found = Object.values(game.state.objects).find((o) => o.cardName === name && o.zone === "outside");
  if (found === undefined) throw new Error(`${name} isn't outside the game`);
  return found.id;
};

describe("Infernal Kirin", () => {
  it("makes the target player reveal and discard every card with that spell's mana value", () => {
    const { game, a } = table();
    spawn(game, "Infernal Kirin");
    lands(game, "Mountain", 1);
    const one = toHand(game, "Shock", B);
    const three = toHand(game, "Divination", B);
    const before = hand(game, B).length;
    pickTargets(a, B);
    cast(game, toHand(game, "Lava Spike"), { targets: [ref(B)] });
    expect(zone(game, one)).toBe("graveyard");
    expect(zone(game, three)).toBe("hand");
    expect(hand(game, B).length).toBe(before - 1);
  });
});

describe("Loamcrafter Faun", () => {
  it("returns up to as many nonland permanent cards as lands were discarded", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const ring = toGraveyard(game, "Sol Ring");
    const forest = toGraveyard(game, "Forest");
    const shock = toGraveyard(game, "Shock");
    let offeredDiscards = 0;
    a.chooseDiscardsFn = (cards) => {
      offeredDiscards = cards.length;
      return [cards[0].id];
    };
    const seen = watchTargets(a, () => [bears]);
    enter(game, "Loamcrafter Faun");
    expect(offeredDiscards).toBe(8);
    expect(seen.asked).toBe(1);
    expect(seen.offered.length).toBe(1);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([bears, ring]));
    expect(seen.offered[0]).not.toContain(forest);
    expect(seen.offered[0]).not.toContain(shock);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, ring)).toBe("graveyard");
  });
});

describe("Disciple of Deceit", () => {
  it("searches only for the discarded nonland card's mana value", () => {
    const { game, a } = table();
    const disciple = spawn(game, "Disciple of Deceit", A, { tapped: true });
    const divination = toHand(game, "Divination");
    const helix = toHand(game, "Lightning Helix");
    const murder = toLibrary(game, "Murder");
    toLibrary(game, "Shock");
    let offered: readonly string[] = [];
    a.chooseDiscardsFn = (cards) => {
      offered = cards.map((c) => c.id);
      return [divination];
    };
    pickModes(a, 0);
    const search = pickFromZone(a, murder);
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(disciple)]);
    settle(game);
    expect([...offered].sort()).toEqual([divination, helix].sort());
    expect(search.offered).toEqual([murder]);
    expect(zone(game, murder)).toBe("hand");
  });
});

describe("Serum-Core Chimera", () => {
  it("draws, then a nonland discard deals 3 to a target chosen for the reflexive ability", () => {
    const { game, a } = table();
    const chimera = spawn(game, "Serum-Core Chimera");
    game.state.objects[chimera].counters.oil = 3;
    const bears = spawn(game, "Grizzly Bears", B);
    const shock = toHand(game, "Shock");
    pickModes(a, 0);
    a.chooseDiscardsFn = () => [shock];
    pickTargets(a, bears);
    activate(game, chimera, 0);
    expect(counters(game, chimera, "oil")).toBe(0);
    expect(zone(game, shock)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Fungal Colossus", () => {
  it("costs {1} less for each differently named land", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 1);
    const colossus = toHand(game, "Fungal Colossus");
    expect(() => cast(game, colossus)).toThrow(); // Two names: {4}{G}, three lands.
    lands(game, "Swamp", 1);
    lands(game, "Plains", 1);
    // Four names: {2}{G}, five lands.
    cast(game, colossus);
    expect(zone(game, colossus)).toBe("battlefield");
    expect(game.battlefield.filter((id) => types(game, id).includes("land") && game.state.objects[id].tapped).length).toBe(3);
  });
});

describe("Bamboozle", () => {
  it("puts the two the caster chooses into the target player's graveyard, the rest back on top", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const cards = ["Shock", "Grizzly Bears", "Hill Giant", "Sol Ring"].map((n) => toLibrary(game, n, B));
    // Asked twice: the two for the graveyard, then the rest's order.
    let offered = 0;
    a.chooseFromZoneFn = (_view, eligible) => {
      if (eligible.length === 4) {
        offered = eligible.length;
        return [cards[0], cards[1]];
      }
      return eligible;
    };
    const before = graveyard(game, B).length;
    cast(game, toHand(game, "Bamboozle"), { targets: [ref(B)] });
    expect(offered).toBe(4);
    expect(graveyard(game, B).length).toBe(before + 2);
    const library = game.state.zones.perPlayer[B].library;
    expect(library.slice(0, 2)).toEqual(expect.arrayContaining([cards[2], cards[3]]));
  });
});

describe("Portent", () => {
  it("draws at the next turn's upkeep", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    pickModes(a);
    cast(game, toHand(game, "Portent"), { targets: [ref(B)] });
    const before = hand(game).length;
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep" && s.zones.shared.stack.length === 0 && s.priority.holder === B);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Grub's Command", () => {
  it("mills the target player, each milled Goblin going to their hand; a Goblin already there stays", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 2);
    const old = toGraveyard(game, "Goblin Guide", B);
    const milled = ["Goblin Guide", "Shock", "Goblin Piker", "Grizzly Bears", "Hill Giant"].map((n) => toLibrary(game, n, B));
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game, B).length;
    cast(game, toHand(game, "Grub's Command"), { modes: [1, 3], targets: [ref(A), ref(B)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("haste")).toBe(true);
    expect(hand(game, B).length).toBe(before + 2);
    expect(zone(game, milled[0])).toBe("hand");
    expect(zone(game, milled[2])).toBe("hand");
    expect(zone(game, milled[1])).toBe("graveyard");
    expect(zone(game, old)).toBe("graveyard");
  });

  it("copies a Goblin you control and destroys", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 2);
    const guide = spawn(game, "Goblin Guide");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Grub's Command"), { modes: [0, 2], targets: [ref(guide), ref(giant)] });
    expect(named(game, "Goblin Guide", A).length).toBe(2);
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Vexing Arcanix", () => {
  it("the target player names; a hit goes to hand, a miss to the graveyard with 2 damage, an empty library neither", () => {
    const { game, b } = table();
    lands(game, "Wastes", 9);
    b.chooseCardNameFn = () => "Grizzly Bears";
    const hit = toLibrary(game, "Grizzly Bears", B);
    activate(game, spawn(game, "Vexing Arcanix"), 0, { targets: [ref(B)] });
    expect(zone(game, hit)).toBe("hand");
    expect(life(game, B)).toBe(20);

    const miss = toLibrary(game, "Shock", B);
    activate(game, spawn(game, "Vexing Arcanix"), 0, { targets: [ref(B)] });
    expect(zone(game, miss)).toBe("graveyard");
    expect(life(game, B)).toBe(18);

    game.debugApplyEffect(A, { kind: "mill", target: "each-opponent", amount: 60 }, []);
    settle(game);
    activate(game, spawn(game, "Vexing Arcanix"), 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
  });
});

describe("Cosmium Confluence", () => {
  it("the second mode may choose the Cave the first just fetched, chosen as it resolves, twice over", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    const cave = toLibrary(game, "Captivating Cave");
    pickFromZone(a, cave);
    a.choosePermanentsFn = (_view, eligible) => [eligible[0]];
    cast(game, toHand(game, "Cosmium Confluence"), { modes: [0, 1, 1] });
    expect(zone(game, cave)).toBe("battlefield");
    expect(game.state.objects[cave].tapped).toBe(true);
    expect(counters(game, cave)).toBe(6);
    expect(pt(game, cave)).toEqual({ power: 6, toughness: 6 });
    expect(types(game, cave)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(subtypes(game, cave)).toEqual(expect.arrayContaining(["Cave", "Elemental"]));
    expect(keywords(game, cave).has("haste")).toBe(true);
  });
});

describe("Maestros Confluence", () => {
  it("returns only a monocolored card, and repeats a mode on one target", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 2);
    const shock = toGraveyard(game, "Shock");
    const helix = toGraveyard(game, "Lightning Helix");
    const giant = spawn(game, "Hill Giant", B);
    const confluence = toHand(game, "Maestros Confluence");
    expect(() => cast(game, confluence, { modes: [0, 1, 1], targets: [ref(helix), ref(giant), ref(giant)] })).toThrow();
    cast(game, confluence, { modes: [0, 1, 1], targets: [ref(shock), ref(giant), ref(giant)] });
    expect(zone(game, shock)).toBe("hand");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Planewide Celebration", () => {
  it("makes all-color 2/2 Citizens and gains life for each time chosen", () => {
    const { game } = table();
    lands(game, "Forest", 7);
    cast(game, toHand(game, "Planewide Celebration"), { modes: [0, 0, 3, 3] });
    expect(life(game, A)).toBe(28);
    expect(tokensNamed(game, "All-Color Citizen Token", A)).toBe(2);
    const token = named(game, "All-Color Citizen Token", A)[0];
    expect(pt(game, token)).toEqual({ power: 2, toughness: 2 });
    expect(subtypes(game, token)).toContain("Citizen");
  });
});

describe("Batwing Brume", () => {
  it("{B} spent: each player loses 1 life for each attacking creature they control, and damage is dealt", () => {
    const { game, a } = table();
    const [one, two] = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    lands(game, "Swamp", 2);
    a.declareAttackersFn = () => [one, two].map((attacker) => ({ attacker, defender: B }));
    toStep(game, "declare-blockers");
    cast(game, toHand(game, "Batwing Brume"));
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(20);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(16);
  });

  it("{W} spent: all combat damage is prevented, and no life is lost", () => {
    const { game, a } = table();
    const one = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    a.declareAttackersFn = () => [{ attacker: one, defender: B }];
    toStep(game, "declare-blockers");
    cast(game, toHand(game, "Batwing Brume"));
    expect(life(game, A)).toBe(20);
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(20);
  });
});

describe("Spiteful Repossession", () => {
  it("deals each opponent the land difference, only those with more, then makes that many Treasures", () => {
    const { game } = table({ players: 3 });
    lands(game, "Mountain", 5);
    lands(game, "Wastes", 8, B);
    lands(game, "Wastes", 2, C);
    cast(game, toHand(game, "Spiteful Repossession"));
    expect(life(game, B)).toBe(17);
    expect(life(game, C)).toBe(20);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(3);
  });
});

describe("Matzalantli, the Great Door", () => {
  it("transforms only with four permanent types in the graveyard; The Core makes X of one colour", () => {
    const { game } = table();
    const door = spawn(game, "Matzalantli, the Great Door");
    lands(game, "Wastes", 4);
    toGraveyard(game, "Sol Ring");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Glorious Anthem");
    toGraveyard(game, "Shock");
    toGraveyard(game, "Divination");
    expect(() => activate(game, door, 1)).toThrow();
    toGraveyard(game, "Wastes");
    activate(game, door, 1);
    expect(types(game, door)).toContain("land");
    expect(game.state.objects[door].tapped).toBe(true);
    toStep(game, "precombat-main");
    expect(game.state.turn.number).toBeGreaterThan(1);
    activate(game, door, 0);
    expect(game.state.players[A].manaPool.length).toBe(4);
  });
});

describe("Delirium", () => {
  it("only on an opponent's turn: taps a creature that player controls, which damages them for its power", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 1);
    const giant = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Grizzly Bears");
    const delirium = toHand(game, "Delirium");
    expect(() => cast(game, delirium, { targets: [ref(giant)] })).toThrow();
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep" && s.priority.holder === A);
    expect(() => cast(game, delirium, { targets: [ref(mine)] })).toThrow();
    cast(game, delirium, { targets: [ref(giant)] });
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(life(game, B)).toBe(17);
  });
});

describe("Sanctuary Warden", () => {
  it("enters with two shield counters; removing one as it enters draws and makes a Citizen", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const before = hand(game).length;
    const warden = enter(game, "Sanctuary Warden");
    expect(counters(game, warden, "shield")).toBe(1);
    expect(hand(game).length).toBe(before + 1);
    expect(tokensNamed(game, "Citizen Token", A)).toBe(1);
  });
});

describe("Immortus, Master of Eternity", () => {
  it("power-up shuffles each hand and graveyard away and draws seven, with a counter on him", () => {
    const { game } = table();
    const immortus = spawn(game, "Immortus, Master of Eternity");
    lands(game, "Island", 7);
    const old = toGraveyard(game, "Shock", B);
    activate(game, immortus, 1);
    expect(hand(game, A).length).toBe(7);
    expect(hand(game, B).length).toBe(7);
    expect(zone(game, old)).not.toBe("graveyard");
    expect(counters(game, immortus)).toBe(1);
  });

  it("makes {U} for each card drawn this turn", () => {
    const { game } = table();
    const immortus = spawn(game, "Immortus, Master of Eternity");
    game.debugApplyEffect(A, { kind: "draw", amount: 2 }, []);
    settle(game);
    activate(game, immortus, 0);
    // These two and the draw step's.
    expect(game.state.players[A].manaPool.length).toBe(3);
  });
});

describe("Step Between Worlds", () => {
  it("each player chooses first, and only those who said yes shuffle and draw; then it's exiled", () => {
    const { game, a, b } = table();
    lands(game, "Island", 5);
    pickModes(a, 0);
    pickModes(b);
    const mine = toGraveyard(game, "Shock");
    const theirs = toGraveyard(game, "Shock", B);
    const step = toHand(game, "Step Between Worlds");
    const before = hand(game, B).length;
    cast(game, step);
    expect(hand(game, A).length).toBe(7);
    expect(zone(game, mine)).not.toBe("graveyard");
    expect(hand(game, B).length).toBe(before);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, step)).toBe("exile");
  });
});

describe("Turtles in Time", () => {
  it("returns creatures first, so a returned one can be shuffled away", () => {
    const { game, a, b } = table();
    lands(game, "Island", 7);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickModes(b);
    const turtles = toHand(game, "Turtles in Time");
    cast(game, turtles);
    expect(zone(game, theirs)).toBe("hand");
    expect(zone(game, mine)).toBe("library");
    expect(hand(game, A).length).toBe(7);
    expect(zone(game, turtles)).toBe("exile");
  });
});

describe("Invasion of Arcavios", () => {
  it("offers the graveyard and outside the game together, and takes a sideboard card", () => {
    const { game, a } = table({ sideboard: ["Shock"] });
    const sideboard = outsideCard(game, "Shock");
    const divination = toGraveyard(game, "Divination");
    const inLibrary = toLibrary(game, "Lightning Helix");
    pickModes(a, 3);
    const pick = pickFromZone(a, sideboard);
    enter(game, "Invasion of Arcavios");
    expect(pick.offered).toEqual(expect.arrayContaining([sideboard, divination]));
    expect(pick.offered).not.toContain(inLibrary);
    expect(zone(game, sideboard)).toBe("hand");
  });

  it("searches all three at once", () => {
    const { game, a } = table({ sideboard: ["Shock"] });
    const sideboard = outsideCard(game, "Shock");
    const divination = toGraveyard(game, "Divination");
    const inLibrary = toLibrary(game, "Lightning Helix");
    pickModes(a, 0);
    const pick = pickFromZone(a, inLibrary);
    enter(game, "Invasion of Arcavios");
    expect(pick.offered).toEqual(expect.arrayContaining([sideboard, divination, inLibrary]));
    expect(zone(game, inLibrary)).toBe("hand");
  });

  it("outside the game alone", () => {
    const { game, a } = table({ sideboard: ["Shock", "Grizzly Bears"] });
    const sideboard = outsideCard(game, "Shock");
    pickModes(a, 6);
    const pick = pickFromZone(a, sideboard);
    toGraveyard(game, "Divination");
    enter(game, "Invasion of Arcavios");
    expect(pick.offered).toEqual([sideboard]);
    expect(zone(game, sideboard)).toBe("hand");
  });

  it("Invocation of the Founders copies a spell cast from hand", () => {
    const { game, a } = table();
    // The back face, as the Siege turns over; its "search" finds nothing.
    pickModes(a, 6);
    const siege = enter(game, "Invasion of Arcavios");
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(siege)]);
    settle(game);
    expect(types(game, siege)).toEqual(["enchantment"]);
    lands(game, "Mountain", 1);
    pickModes(a, 0);
    pickTargets(a, B);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
  });
});

describe("Ring of Ma'rûf", () => {
  it("replaces the next draw with a card from outside the game, once", () => {
    const { game, a } = table({ sideboard: ["Shock"] });
    const sideboard = outsideCard(game, "Shock");
    lands(game, "Wastes", 5);
    const ring = spawn(game, "Ring of Ma'rûf");
    pickFromZone(a, sideboard);
    activate(game, ring, 0);
    expect(zone(game, ring)).toBe("exile");
    expect(zone(game, sideboard)).toBe("outside");
    const before = hand(game).length;
    const library = game.state.zones.perPlayer[A].library.length;
    game.debugApplyEffect(A, { kind: "draw", amount: 2 }, []);
    settle(game);
    expect(zone(game, sideboard)).toBe("hand");
    expect(hand(game).length).toBe(before + 2);
    expect(game.state.zones.perPlayer[A].library.length).toBe(library - 1);
  });
});

describe("Chain of Silence", () => {
  it("prevents all damage the creature would deal this turn; declining the sacrifice ends it", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a);
    cast(game, toHand(game, "Chain of Silence"), { targets: [ref(bears)] });
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(20);
  });
});

describe("Inquisitor's Snare", () => {
  it("prevents all damage the attacker would deal, destroying it only if black or red", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    const guide = spawn(game, "Goblin Guide");
    a.declareAttackersFn = () => [bears, guide].map((attacker) => ({ attacker, defender: B }));
    toStep(game, "declare-blockers");
    cast(game, toHand(game, "Inquisitor's Snare"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    cast(game, toHand(game, "Inquisitor's Snare"), { targets: [ref(guide)] });
    expect(zone(game, guide)).toBe("graveyard");
    toStep(game, "postcombat-main");
    expect(life(game, B)).toBe(20);
  });
});

describe("Garruk, Savage Herald", () => {
  type Offer = Extract<LegalAction, { kind: "assign-combat-damage" }>;

  it("−7 reaches the creatures you control as it resolves, not one arriving later", () => {
    const { game, a, b } = table();
    const garruk = spawn(game, "Garruk, Savage Herald");
    const first = spawn(game, "Grizzly Bears");
    loyalty(game, garruk, -7, { atLeast: 7 });
    const later = spawn(game, "Grizzly Bears");
    const [wallOne, wallTwo] = [spawn(game, "Wall of Denial", B), spawn(game, "Wall of Denial", B)];
    b.declareBlockersFn = () => [
      { blocker: wallOne, attacker: first },
      { blocker: wallTwo, attacker: later },
    ];
    const offers: Offer[] = [];
    a.assignCombatDamageFn = (view) => {
      offers.push(view.legalActions().find((o): o is Offer => o.kind === "assign-combat-damage")!);
      return "unblocked";
    };
    attack(game, a, [first, later]);
    expect(offers).toHaveLength(1);
    expect(offers[0]).toMatchObject({ mayUnblocked: true, blockers: [wallOne] });
    expect(life(game, B)).toBe(18);
  });

  it("+1 takes a creature card and bottoms anything else", () => {
    const { game } = table();
    const shock = toLibrary(game, "Shock");
    loyalty(game, spawn(game, "Garruk, Savage Herald"), 1);
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(shock);

    const bears = toLibrary(game, "Grizzly Bears");
    loyalty(game, spawn(game, "Garruk, Savage Herald"), 1);
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Speed, Young Avenger", () => {
  it("paying {1} makes a target haste creature blockable only by creatures with haste", () => {
    const { game, a } = table();
    const speed = spawn(game, "Speed, Young Avenger");
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const guide = spawn(game, "Goblin Guide", B);
    pickModes(a, 0);
    pickTargets(a, speed);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    blockOffer(game, a, [speed]);
    expect(game.canDispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: bears, attacker: speed }] })).not.toBeNull();
    expect(game.canDispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: guide, attacker: speed }] })).toBeNull();
  });
});

describe("Spirespine", () => {
  it("bestowed, the enchanted creature gets +4/+1 and must block", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    const attacker = spawn(game, "Hill Giant");
    cast(game, toHand(game, "Spirespine"), { targets: [ref(bears)], overload: true });
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 3 });
    const offer = blockOffer(game, a, [attacker]);
    expect(offer.blockRequirements).toEqual([{ blocker: bears }]);
  });

  it("on its own it must block", () => {
    const { game, a } = table();
    const spine = spawn(game, "Spirespine", B);
    const offer = blockOffer(game, a, [spawn(game, "Hill Giant")]);
    expect(offer.blockRequirements).toEqual([{ blocker: spine }]);
  });
});

describe("Infernal Sovereign", () => {
  it("draws and loses 1 life on a land played, and skips your draw step", () => {
    const { game } = table();
    spawn(game, "Infernal Sovereign");
    const land = toHand(game, "Wastes");
    const before = hand(game).length;
    game.dispatch({ type: "play-land", player: A, card: land });
    settle(game);
    expect(hand(game).length).toBe(before);
    expect(life(game, A)).toBe(19);
    nextTurn(game);
    toStep(game, "precombat-main");
    expect(hand(game).length).toBe(before);
  });
});

describe("Null Profusion", () => {
  it("draws on a card played, skips the draw step, and holds the hand to two", () => {
    const { game } = table();
    spawn(game, "Null Profusion");
    const land = toHand(game, "Wastes");
    const before = hand(game).length;
    game.dispatch({ type: "play-land", player: A, card: land });
    settle(game);
    expect(hand(game).length).toBe(before);
    nextTurn(game);
    expect(hand(game).length).toBe(2);
    toStep(game, "precombat-main");
    expect(hand(game).length).toBe(2);
  });
});

describe("Ayesha Tanaka, Armorer", () => {
  it("puts artifacts of mana value up to her power onto the battlefield tapped, the rest on the bottom", () => {
    const { game, a } = table();
    const ayesha = spawn(game, "Ayesha Tanaka, Armorer");
    const relic = toLibrary(game, "Darksteel Ingot");
    const stone = toLibrary(game, "Mind Stone");
    const ring = toLibrary(game, "Sol Ring");
    const bears = toLibrary(game, "Grizzly Bears");
    const pick = pickFromZone(a, ring, stone);
    attack(game, a, [ayesha]);
    expect(pick.offered).toEqual(expect.arrayContaining([ring, stone]));
    expect(pick.offered).not.toContain(relic);
    expect(pick.offered).not.toContain(bears);
    expect(zone(game, ring)).toBe("battlefield");
    expect(game.state.objects[stone].tapped).toBe(true);
    const library = game.state.zones.perPlayer[A].library;
    expect(library.slice(-2)).toEqual(expect.arrayContaining([relic, bears]));
  });

  it("can't be blocked as long as defending player controls three artifacts", () => {
    const { game, a } = table();
    const ayesha = spawn(game, "Ayesha Tanaka, Armorer");
    const wall = spawn(game, "Grizzly Bears", B);
    ["Sol Ring", "Mind Stone"].forEach((n) => spawn(game, n, B));
    pickFromZone(a);
    const offer = blockOffer(game, a, [ayesha]);
    expect(offer).toBeDefined();
    expect(game.canDispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: wall, attacker: ayesha }] })).toBeNull();
  });

  it("…with three, no one is asked to block her", () => {
    const { game, a } = table();
    const ayesha = spawn(game, "Ayesha Tanaka, Armorer");
    spawn(game, "Grizzly Bears", B);
    ["Sol Ring", "Mind Stone", "Sol Ring"].forEach((n) => spawn(game, n, B));
    pickFromZone(a);
    attack(game, a, [ayesha]);
    expect(life(game, B)).toBe(18);
  });
});

describe("Kaya, Orzhov Usurper", () => {
  it("−5 counts the cards the target player owns in exile, and gains that much", () => {
    const { game } = table();
    const kaya = spawn(game, "Kaya, Orzhov Usurper");
    toExile(game, "Shock", B);
    toExile(game, "Grizzly Bears", B);
    toExile(game, "Shock", A);
    loyalty(game, kaya, -5, { atLeast: 5, targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });

  it("+1 gains 2 life only if a creature card was exiled, from one graveyard", () => {
    const { game } = table();
    const kaya = spawn(game, "Kaya, Orzhov Usurper");
    const shock = toGraveyard(game, "Shock", B);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const other = toGraveyard(game, "Shock", A);
    expect(() => loyalty(game, kaya, 1, { targets: [ref(shock), ref(other)] })).toThrow();
    loyalty(game, kaya, 1, { targets: [ref(shock), ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(life(game, A)).toBe(22);
  });
});

describe("Serpentine Curve", () => {
  it("counts your instants and sorceries in exile and in your graveyard, plus one", () => {
    const { game } = table();
    lands(game, "Island", 4);
    toGraveyard(game, "Divination");
    toExile(game, "Shock");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Lightning Helix", B);
    cast(game, toHand(game, "Serpentine Curve"));
    expect(counters(game, named(game, "Fractal Token", A)[0])).toBe(3);
  });
});

describe("Light of Judgment", () => {
  it("offers only Equipment attached to the target, chosen as it resolves", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    const giant = spawn(game, "Hill Giant", B);
    const other = spawn(game, "Grizzly Bears", B);
    const onGiant = spawn(game, "Bonesplitter", B);
    const onOther = spawn(game, "Bonesplitter", B);
    attach(game, giant, onGiant);
    attach(game, other, onOther);
    const pick = pickPermanents(a, onGiant);
    cast(game, toHand(game, "Light of Judgment"), { targets: [ref(giant)] });
    expect(pick.offered).toEqual([onGiant]);
    expect(zone(game, onGiant)).toBe("graveyard");
    expect(zone(game, onOther)).toBe("battlefield");
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Scarab of the Unseen", () => {
  it("returns the Auras on a permanent you own, and draws at the next upkeep", () => {
    const { game } = table();
    const scarab = spawn(game, "Scarab of the Unseen");
    const bears = spawn(game, "Grizzly Bears");
    const aura = spawn(game, "Pacifism", B);
    attach(game, bears, aura);
    const theirs = spawn(game, "Hill Giant", B);
    expect(() => activate(game, scarab, 0, { targets: [ref(theirs)] })).toThrow();
    const before = hand(game).length;
    activate(game, scarab, 0, { targets: [ref(bears)] });
    expect(zone(game, aura)).toBe("hand");
    expect(game.state.zones.perPlayer[B].hand).toContain(aura);
    expect(zone(game, scarab)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep" && s.zones.shared.stack.length === 0 && s.priority.holder === B);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Golden Argosy", () => {
  it("exiles what crewed it and returns them tapped, together, at the next end step", () => {
    const { game, a } = table();
    const argosy = spawn(game, "Golden Argosy");
    const crew = spawn(game, "Grizzly Bears");
    const bystander = spawn(game, "Grizzly Bears");
    game.dispatch({ type: "activate-ability", player: A, source: argosy, abilityIndex: 0, targets: [], tap: [crew] });
    settle(game);
    expect(types(game, argosy)).toContain("creature");
    attack(game, a, [argosy]);
    expect(zone(game, crew)).toBe("exile");
    expect(zone(game, bystander)).toBe("battlefield");
    nextTurn(game);
    const back = named(game, "Grizzly Bears", A).filter((id) => id !== bystander);
    expect(back.length).toBe(1);
    expect(game.state.objects[back[0]].tapped).toBe(true);
  });
});

describe("Evil Twin", () => {
  it("enters as a copy with the ability, which reads the copied name", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Island", 3);
    lands(game, "Swamp", 3);
    a.chooseCopyFn = () => theirs;
    const twin = toHand(game, "Evil Twin");
    cast(game, twin);
    expect(pt(game, twin)).toEqual({ power: 2, toughness: 2 });
    toStep(game, "precombat-main");
    expect(() => activate(game, twin, 0, { targets: [ref(giant)] })).toThrow();
    activate(game, twin, 0, { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Outbreak", () => {
  it("is cast by discarding a Swamp, and shrinks only the chosen type", () => {
    const { game, a } = table();
    const swamp = toHand(game, "Swamp");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    a.chooseCreatureTypeFn = () => "Bear";
    cast(game, toHand(game, "Outbreak"), { altCost: true });
    expect(zone(game, swamp)).toBe("graveyard");
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Disrupting Shoal", () => {
  it("exiling a blue card sets X: it counters a spell of that mana value", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)], settle: false });
    const exiled = toHand(game, "Reach Through Mists");
    cast(game, toHand(game, "Disrupting Shoal"), { targets: [ref(shock)], altCost: true, x: 1 });
    expect(zone(game, exiled)).toBe("exile");
    expect(zone(game, shock)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });

  it("…and does nothing to a spell of another mana value", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)], settle: false });
    toHand(game, "Divination");
    cast(game, toHand(game, "Disrupting Shoal"), { targets: [ref(shock)], altCost: true, x: 3 });
    expect(life(game, B)).toBe(18);
  });

  it("paid for with mana, X is the X chosen", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Island", 3);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Disrupting Shoal"), { targets: [ref(shock)], x: 1 });
    expect(life(game, B)).toBe(20);
  });
});

describe("Cloud, Planet's Champion", () => {
  it("has double strike and indestructible only on your turn while equipped", () => {
    const { game } = table();
    const cloud = spawn(game, "Cloud, Planet's Champion");
    expect(keywords(game, cloud).has("double-strike")).toBe(false);
    attach(game, cloud, spawn(game, "Bonesplitter"));
    expect(keywords(game, cloud).has("double-strike")).toBe(true);
    expect(keywords(game, cloud).has("indestructible")).toBe(true);
    nextTurn(game);
    expect(keywords(game, cloud).has("double-strike")).toBe(false);
  });
});

describe("Fighter Class", () => {
  it("level 3: whenever a creature you control attacks, the target blocks that creature", () => {
    const { game, a } = table();
    lands(game, "Plains", 4);
    lands(game, "Mountain", 4);
    const found = toLibrary(game, "Bonesplitter");
    pickFromZone(a, found);
    const fighter = enter(game, "Fighter Class");
    expect(zone(game, found)).toBe("hand");
    activate(game, fighter, 0);
    activate(game, fighter, 1);
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Grizzly Bears", B);
    pickTargets(a, wall);
    const offer = blockOffer(game, a, [bears]);
    expect(offer.blockRequirements).toEqual([{ blocker: wall, attacker: bears }]);
  });
});

describe("Chocobo Kick", () => {
  it("kicked by returning a land, it deals twice the power", () => {
    const { game } = table();
    const land = lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const wall = spawn(game, "Wall of Denial", B);
    expect(wall).toBeDefined();
    cast(game, toHand(game, "Chocobo Kick"), { targets: [ref(bears), ref(giant)], kicked: true });
    expect(zone(game, giant)).toBe("graveyard");
    expect(land.filter((id) => zone(game, id) === "hand").length).toBe(1);
  });

  it("unkicked, its power once", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Chocobo Kick"), { targets: [ref(bears), ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked).toBe(2);
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });
});

describe("Primal Growth", () => {
  it("kicked by a sacrifice, it fetches up to two basic lands", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    const found = [toLibrary(game, "Plains"), toLibrary(game, "Island")];
    pickFromZone(a, ...found);
    cast(game, toHand(game, "Primal Growth"), { kicked: true });
    expect(zone(game, bears)).toBe("graveyard");
    expect(found.map((id) => zone(game, id))).toEqual(["battlefield", "battlefield"]);
  });
});

describe("Ashiok, Nightmare Weaver", () => {
  it("+2 exiles target opponent's top three; −X puts one of mana value X onto the battlefield as a Nightmare", () => {
    const { game } = table();
    const ashiok = spawn(game, "Ashiok, Nightmare Weaver");
    const giant = toLibrary(game, "Hill Giant", B);
    const bears = toLibrary(game, "Grizzly Bears", B);
    const shock = toLibrary(game, "Shock", B);
    loyalty(game, ashiok, 2, { targets: [ref(B)] });
    expect([giant, bears, shock].map((id) => zone(game, id))).toEqual(["exile", "exile", "exile"]);
    nextTurn(game);
    toStep(game, "precombat-main");
    loyalty(game, ashiok, "-x", { x: 2 });
    const mine = named(game, "Grizzly Bears", A);
    expect(mine.length).toBe(1);
    expect(subtypes(game, mine[0])).toEqual(expect.arrayContaining(["Bear", "Nightmare"]));
    expect(zone(game, giant)).toBe("exile");
    expect(counters(game, ashiok, "loyalty")).toBe(3);
  });

  it("−X for all its loyalty still reaches the card it exiled, though Ashiok is gone", () => {
    const { game } = table();
    const ashiok = spawn(game, "Ashiok, Nightmare Weaver");
    toLibrary(game, "Hill Giant", B);
    loyalty(game, ashiok, 2, { targets: [ref(B)] });
    nextTurn(game);
    toStep(game, "precombat-main");
    game.state.objects[ashiok].counters.loyalty = 4;
    loyalty(game, ashiok, "-x", { x: 4 });
    expect(zone(game, ashiok)).toBe("graveyard");
    expect(named(game, "Hill Giant", A).length).toBe(1);
  });

  it("−10 exiles every opponent's hand and graveyard, linked for the −X", () => {
    const { game } = table({ players: 3 });
    const ashiok = spawn(game, "Ashiok, Nightmare Weaver");
    const inHand = toHand(game, "Grizzly Bears", B);
    const inGraveyard = toGraveyard(game, "Hill Giant", C);
    loyalty(game, ashiok, -10, { atLeast: 13 });
    expect(zone(game, inHand)).toBe("exile");
    expect(zone(game, inGraveyard)).toBe("exile");
    expect(hand(game, B).length).toBe(0);
    expect(hand(game, A).length).toBeGreaterThan(0);
    game.advanceUntil((s) => s.turn.number === 4 && s.turn.step === "precombat-main" && s.priority.holder === A);
    loyalty(game, ashiok, "-x", { x: 2 });
    expect(named(game, "Grizzly Bears", A).length).toBe(1);
  });
});
