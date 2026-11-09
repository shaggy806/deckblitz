/**
 * Batch 265, group B: cards freed by the built need-key families (becomes-target
 * players, token creation, becomes-attached, animate supertypes, cast-now's
 * alternative costs, graveyard and exile permissions). One test for the clause
 * of each most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import type { Action } from "../actions.js";
import { effectiveSupertypes } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  activate,
  attack,
  B,
  cast,
  controller,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
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
  zone,
} from "./harness.js";

const castable = (game: Game, card: ObjectId, targets: readonly (PlayerId | ObjectId)[] = [], player: PlayerId = A): boolean =>
  game.canDispatch({ type: "cast-spell", player, card, targets: targets.map(ref) } as Action) === null;
const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const superOf = (game: Game, id: ObjectId): readonly string[] =>
  effectiveSupertypes(game.state, game.registry, game.state.objects[id]);
const nameOf = (game: Game, id: ObjectId): string => game.state.objects[id].cardName;

describe("Rayne, Academy Chancellor", () => {
  it("an opponent targeting you draws one, or two while Rayne is enchanted", () => {
    const { game, a } = table();
    const rayne = spawn(game, "Rayne, Academy Chancellor");
    pickModes(a, 0);
    nextTurn(game);
    lands(game, "Mountain", 2, B);
    let before = hand(game).length;
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(A)] });
    expect(hand(game).length).toBe(before + 1);
    const aura = spawn(game, "Pacifism");
    game.state.objects[aura].attachedTo = rayne;
    before = hand(game).length;
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(A)] });
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Rosie Cotton of South Lane", () => {
  it("each token you create puts a counter on another creature you control", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    const rosie = enter(game, "Rosie Cotton of South Lane");
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
    expect(counters(game, bear)).toBe(1);
    expect(counters(game, rosie)).toBe(0);
  });
});

describe("Voldaren Bloodcaster", () => {
  it("transforms when a Blood token makes five", () => {
    const { game } = table();
    const caster = spawn(game, "Voldaren Bloodcaster");
    game.debugApplyEffect(A, { kind: "create-token", token: "Blood Token", count: 4 }, []);
    settle(game);
    expect(game.state.objects[caster].face ?? 0).toBe(0);
    expect(nameOf(game, caster)).toBe("Voldaren Bloodcaster");
    game.debugApplyEffect(A, { kind: "create-token", token: "Blood Token", count: 1 }, []);
    settle(game);
    expect(game.state.objects[caster].face).toBe(1);
  });
  it("a nontoken creature of yours dying makes a Blood token; a token's doesn't", () => {
    const { game } = table();
    spawn(game, "Voldaren Bloodcaster");
    const bear = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    settle(game);
    const [token] = named(game, "Soldier Token", A);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(token)]);
    settle(game);
    expect(tokensNamed(game, "Blood Token", A)).toBe(0);
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [ref(bear)]);
    settle(game);
    expect(tokensNamed(game, "Blood Token", A)).toBe(1);
  });
});

describe("Treacherous Greed", () => {
  it("needs a creature that dealt damage this turn to sacrifice", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    lands(game, "Swamp", 2);
    const greed = toHand(game, "Treacherous Greed");
    expect(castable(game, greed)).toBe(false);
    attack(game, a, [bear]);
    expect(castable(game, greed)).toBe(true);
    const before = hand(game).length;
    cast(game, greed, { sacrifice: bear });
    expect(zone(game, bear)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 2);
    expect(life(game, B)).toBe(20 - 2 - 3);
    expect(life(game)).toBe(23);
  });
});

describe("Disappearing Act", () => {
  it("returns a permanent you control as it's cast", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Island", 3);
    lands(game, "Mountain", 1);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)], settle: false });
    pickPermanents(a, bear);
    cast(game, toHand(game, "Disappearing Act"), { targets: [ref(shock)] });
    expect(zone(game, bear)).toBe("hand");
    expect(zone(game, shock)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Kianne, Dean of Substance // Imbraham, Dean of Theory", () => {
  it("a land goes to hand, a nonland card stays exiled with a study counter", () => {
    const { game } = table();
    const kianne = spawn(game, "Kianne, Dean of Substance");
    const shock = toLibrary(game, "Shock");
    activate(game, kianne, 0);
    expect(zone(game, shock)).toBe("exile");
    expect(counters(game, shock, "study")).toBe(1);
    nextTurn(game);
    nextTurn(game);
    const forest = toLibrary(game, "Forest");
    activate(game, kianne, 0);
    expect(zone(game, forest)).toBe("hand");
  });
  it("the Fractal counts different mana values among study cards", () => {
    const { game } = table();
    const kianne = spawn(game, "Kianne, Dean of Substance");
    for (const name of ["Shock", "Lightning Bolt", "Grizzly Bears"]) {
      const card = toExile(game, name);
      game.state.objects[card].counters.study = 1;
    }
    toExile(game, "Divination");
    lands(game, "Forest", 5);
    activate(game, kianne, 1);
    const [fractal] = named(game, "Fractal Token", A);
    expect(counters(game, fractal)).toBe(2);
  });
});

describe("Cacophony Unleashed", () => {
  it("cast: destroys nonenchantment creatures, then becomes a legendary 6/6", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 7);
    const cacophony = toHand(game, "Cacophony Unleashed");
    cast(game, cacophony);
    expect(zone(game, bear)).toBe("graveyard");
    expect(pt(game, cacophony)).toEqual({ power: 6, toughness: 6 });
    expect(superOf(game, cacophony)).toContain("legendary");
    expect(keywords(game, cacophony).has("deathtouch")).toBe(true);
  });
  it("put onto the battlefield, it destroys nothing", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    enter(game, "Cacophony Unleashed");
    expect(zone(game, bear)).toBe("battlefield");
  });
});

describe("Genju of the Realm", () => {
  it("makes the land a legendary 8/12 trampler", () => {
    const { game } = table();
    const land = spawn(game, "Wastes");
    const genju = spawn(game, "Genju of the Realm");
    game.state.objects[genju].attachedTo = land;
    lands(game, "Plains", 2);
    activate(game, genju, 0);
    expect(pt(game, land)).toEqual({ power: 8, toughness: 12 });
    expect(superOf(game, land)).toContain("legendary");
    expect(subtypes(game, land)).toContain("Spirit");
  });
});

describe("Origin of Spider-Man", () => {
  it("chapter II: a counter, and a legendary Spider Hero", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    const saga = toHand(game, "Origin of Spider-Man");
    cast(game, saga);
    expect(tokensNamed(game, "2/1 Green Spider Token (Reach)", A)).toBe(1);
    pickTargets(a, bear);
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(counters(game, bear)).toBe(1);
    expect(superOf(game, bear)).toContain("legendary");
    expect(subtypes(game, bear)).toEqual(expect.arrayContaining(["Bear", "Spider", "Hero"]));
  });
});

describe("Assimilation Aegis", () => {
  it("the equipped creature becomes a copy of the exiled creature card, while attached", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    const bear = spawn(game, "Grizzly Bears");
    pickTargets(a, giant);
    const aegis = enter(game, "Assimilation Aegis");
    expect(zone(game, giant)).toBe("exile");
    lands(game, "Wastes", 2);
    activate(game, aegis, 0, { targets: [ref(bear)] });
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 3 });
    expect(subtypes(game, bear)).toContain("Giant");
  });
});

describe("Barreling Attack", () => {
  it("+1/+1 for each creature blocking it", () => {
    const { game, a, b } = table();
    const bear = spawn(game, "Grizzly Bears");
    const w1 = spawn(game, "Wall of Wood", B);
    const w2 = spawn(game, "Wall of Wood", B);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Barreling Attack"), { targets: [ref(bear)] });
    expect(keywords(game, bear).has("trample")).toBe(true);
    b.declareBlockersFn = () => [
      { blocker: w1, attacker: bear },
      { blocker: w2, attacker: bear },
    ];
    a.declareAttackersFn = () => [{ attacker: bear, defender: B }];
    toStep(game, "combat-damage");
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Xander's Pact", () => {
  it("each opponent's top card may be cast this turn for life", () => {
    const { game } = table();
    const bolt = toLibrary(game, "Lightning Bolt", B);
    lands(game, "Swamp", 6);
    cast(game, toHand(game, "Xander's Pact"));
    expect(zone(game, bolt)).toBe("exile");
    cast(game, bolt, { targets: [ref(B)], via: "impulse", altCost: true });
    expect(life(game)).toBe(19);
    expect(life(game, B)).toBe(17);
  });
});

describe("Overburden", () => {
  it("the player whose creature entered returns one of their lands", () => {
    const { game } = table();
    spawn(game, "Overburden");
    const land = spawn(game, "Forest", B);
    enter(game, "Grizzly Bears", B);
    expect(zone(game, land)).toBe("hand");
    const mine = spawn(game, "Forest");
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    settle(game);
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Imbraham, Dean of Theory", () => {
  it("X = 0 still puts a study card you own into your hand", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const imbraham = toHand(game, "Kianne, Dean of Substance");
    cast(game, imbraham, { face: 1 });
    game.state.objects[imbraham].summoningSick = false;
    const card = toExile(game, "Shock");
    game.state.objects[card].counters.study = 1;
    lands(game, "Island", 2);
    pickFromZone(a, card);
    activate(game, imbraham, 0, { x: 0 });
    expect(zone(game, card)).toBe("hand");
  });
});

describe("Venser's Diffusion", () => {
  it("returns a suspended card from exile", () => {
    const { game } = table();
    const card = toExile(game, "Ancestral Vision");
    game.state.objects[card].counters.time = 3;
    game.state.objects[card].suspended = true;
    lands(game, "Island", 3);
    cast(game, toHand(game, "Venser's Diffusion"), { targets: [ref(card)] });
    expect(zone(game, card)).toBe("hand");
  });
});

describe("Aang, Airbending Master", () => {
  it("creatures leaving without dying give one experience counter; upkeep makes that many Allies", () => {
    const { game } = table();
    spawn(game, "Aang, Airbending Master");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    game.debugApplyEffect(A, { kind: "return-to-hand-all", filter: { name: "Grizzly Bears" } }, []);
    settle(game);
    expect(game.state.players[A].counters?.experience ?? 0).toBe(1);
    void bears;
    toStep(game, "upkeep");
    settle(game);
    expect(tokensNamed(game, "Ally Token", A)).toBe(1);
  });
});

describe("Jace, Vryn's Prodigy", () => {
  it("with five cards in the graveyard after the loot, returns transformed", () => {
    const { game } = table();
    const jace = spawn(game, "Jace, Vryn's Prodigy");
    for (let i = 0; i < 4; i++) toGraveyard(game, "Wastes");
    activate(game, jace, 0);
    const [walker] = named(game, "Jace, Vryn's Prodigy", A);
    expect(game.state.objects[walker].face).toBe(1);
    expect(counters(game, walker, "loyalty")).toBe(5);
  });
  it("−3: the card cast from the graveyard is exiled after", () => {
    const { game } = table();
    const card = toGraveyard(game, "Jace, Vryn's Prodigy");
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0, transformed: true }, [ref(card)]);
    settle(game);
    const [walker] = named(game, "Jace, Vryn's Prodigy", A);
    const shock = toGraveyard(game, "Shock");
    activate(game, walker, 1, { targets: [ref(shock)] });
    lands(game, "Mountain", 1);
    cast(game, shock, { targets: [ref(B)], via: "graveyard-permission" });
    expect(life(game, B)).toBe(18);
    expect(zone(game, shock)).toBe("exile");
  });
});

describe("Enormous Energy Blade", () => {
  it("taps the creature it becomes attached to", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    const blade = spawn(game, "Enormous Energy Blade");
    lands(game, "Wastes", 2);
    activate(game, blade, 0, { targets: [ref(bear)] });
    expect(tapped(game, bear)).toBe(true);
    expect(pt(game, bear)).toEqual({ power: 6, toughness: 2 });
  });
});

describe("Cloudspire Coordinator", () => {
  it("X counts the Vehicles that entered under you this turn", () => {
    const { game } = table();
    const pilot = spawn(game, "Cloudspire Coordinator");
    enter(game, "Smuggler's Copter");
    enter(game, "Smuggler's Copter");
    activate(game, pilot, 0);
    expect(tokensNamed(game, "Pilot Token", A)).toBe(2);
  });
});

describe("Aang, Swift Savior", () => {
  it("airbends a spell off the stack", () => {
    const { game, a } = table();
    nextTurn(game);
    lands(game, "Mountain", 1, B);
    const shock = toHand(game, "Shock", B);
    cast(game, shock, { player: B, targets: [ref(A)], settle: false });
    pickTargets(a, shock);
    enter(game, "Aang, Swift Savior");
    expect(zone(game, shock)).toBe("exile");
    expect(life(game)).toBe(20);
  });
});

describe("Evershrike", () => {
  it("with no Aura put on it (X = 0 allows none), it's exiled", () => {
    const { game, a } = table();
    const shrike = toGraveyard(game, "Evershrike");
    const aura = toHand(game, "Holy Strength");
    lands(game, "Plains", 2);
    let offered: readonly ObjectId[] = [aura];
    a.chooseFromZoneFn = (_view, eligible) => {
      offered = eligible;
      return [];
    };
    activate(game, shrike, 0, { x: 0 });
    expect(offered).toEqual([]);
    expect(zone(game, aura)).toBe("hand");
    expect(named(game, "Evershrike", A).filter((id) => zone(game, id) === "battlefield")).toEqual([]);
  });
  // Its filter's bare `n: "x"` is the activation's X: a look-and-choose's filter
  // read 0 there until it was bound as the effect began (B265).
  it("with an Aura put on it, it stays, +2/+2", () => {
    const { game, a } = table();
    const shrike = toGraveyard(game, "Evershrike");
    const aura = toHand(game, "Holy Strength");
    lands(game, "Plains", 3);
    pickFromZone(a, aura);
    activate(game, shrike, 0, { x: 1 });
    const [on] = named(game, "Evershrike", A);
    expect(zone(game, on)).toBe("battlefield");
    expect(pt(game, on)).toEqual({ power: 5, toughness: 6 });
  });
});

describe("Wild Evocation", () => {
  it("the upkeep player's random land goes onto the battlefield", () => {
    const { game } = table();
    // Bob's hand is all Wastes.
    spawn(game, "Wild Evocation");
    const before = hand(game, B).length;
    nextTurn(game, "draw");
    settle(game);
    const wastes = named(game, "Wastes", B).filter((id) => zone(game, id) === "battlefield");
    expect(wastes.length).toBe(1);
    expect(controller(game, wastes[0])).toBe(B);
    expect(hand(game, B).length).toBe(before - 1 + 1);
  });
});

describe("Summon: Esper Valigarmanda", () => {
  it("chapter I exiles one instant or sorcery card from each graveyard", () => {
    const { game } = table();
    const mine = toGraveyard(game, "Shock");
    const theirs = toGraveyard(game, "Divination", B);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Summon: Esper Valigarmanda"));
    expect(zone(game, mine)).toBe("exile");
    expect(zone(game, theirs)).toBe("exile");
    expect(graveyard(game).length).toBe(0);
  });
});

describe("Jadzi, Oracle of Arcavios // Journey to the Oracle", () => {
  it("magecraft: a land revealed goes onto the battlefield", () => {
    const { game } = table();
    spawn(game, "Jadzi, Oracle of Arcavios");
    const forest = toLibrary(game, "Forest");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(zone(game, forest)).toBe("battlefield");
  });
  it("magecraft: a nonland card may be cast for {1}", () => {
    const { game, a } = table();
    spawn(game, "Jadzi, Oracle of Arcavios");
    const giant = toLibrary(game, "Hill Giant");
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 1);
    a.chooseCastNowFn = () => ({ type: "cast-spell", player: A, card: giant, targets: [], via: "effect" });
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(zone(game, giant)).toBe("battlefield");
  });
  it("Journey: with eight lands, a discard returns it to hand", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const forests = [0, 1, 2, 3].map(() => toHand(game, "Forest"));
    const journey = toHand(game, "Jadzi, Oracle of Arcavios");
    let asked = 0;
    a.chooseModesFn = () => { asked++; return [0]; };
    pickFromZone(a, ...forests);
    cast(game, journey, { face: 1 });
    expect(named(game, "Forest", A).filter((id) => zone(game, id) === "battlefield").length).toBe(8);
    expect(asked).toBe(1);
    expect(zone(game, journey)).toBe("hand");
  });
});

describe("Bloodbat Summoner", () => {
  it("at the beginning of combat a Blood token becomes a 2/2 flying, hasty Bat", () => {
    const { game, a } = table();
    const card = toGraveyard(game, "Voldaren Bloodcaster");
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0, transformed: true }, [ref(card)]);
    game.debugApplyEffect(A, { kind: "create-token", token: "Blood Token", count: 1 }, []);
    settle(game);
    const [blood] = named(game, "Blood Token", A);
    pickTargets(a, blood);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, blood)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, blood).has("haste")).toBe(true);
    expect(subtypes(game, blood)).toEqual(expect.arrayContaining(["Blood", "Bat"]));
  });
});

describe("Invert Polarity", () => {
  it("the spell is either stolen or countered", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 2);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)], settle: false });
    cast(game, toHand(game, "Invert Polarity"), { targets: [ref(shock)] });
    expect(zone(game, shock)).toBe("graveyard");
    expect(life(game, B) === 18 || life(game, B) === 20).toBe(true);
  });
});

describe("Wizard's Spellbook", () => {
  it("exiles the card linked to the Book", () => {
    const { game } = table();
    const book = spawn(game, "Wizard's Spellbook");
    const shock = toGraveyard(game, "Shock", B);
    activate(game, book, 0, { targets: [ref(shock)] });
    expect(zone(game, shock)).toBe("exile");
    expect(game.state.objects[shock].exiledWith?.source).toBe(book);
  });
});

describe("Jace Reawakened", () => {
  it("can't be cast in your first three turns; can in your fourth", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const jace = toHand(game, "Jace Reawakened");
    expect(castable(game, jace)).toBe(false);
    for (let i = 0; i < 6; i++) nextTurn(game);
    expect(game.state.players[A].turnsTaken).toBe(4);
    expect(castable(game, jace)).toBe(true);
  });
  it("−6: each spell you cast this turn is copied", () => {
    const { game } = table();
    const jace = spawn(game, "Jace Reawakened");
    game.state.objects[jace].counters.loyalty = 6;
    activate(game, jace, 2);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
  });
});

describe("Timebender", () => {
  it("turned face up: removes two time counters from a suspended card", () => {
    const { game, a } = table();
    const bender = spawn(game, "Timebender");
    game.debugApplyEffect(A, { kind: "turn-face-down", target: 0 }, [ref(bender)]);
    settle(game);
    const card = toExile(game, "Ancestral Vision");
    game.state.objects[card].counters.time = 3;
    game.state.objects[card].suspended = true;
    pickModes(a, 0);
    pickTargets(a, card);
    game.debugApplyEffect(A, { kind: "turn-face-up", target: 0 }, [ref(bender)]);
    settle(game);
    expect(counters(game, card, "time")).toBe(1);
  });
});

describe("Aang and La, Ocean's Fury", () => {
  it("attacking puts a counter on each tapped creature you control", () => {
    const { game, a } = table();
    const card = toGraveyard(game, "Aang, Swift Savior");
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0, transformed: true }, [ref(card)]);
    settle(game);
    game.state.objects[card].summoningSick = false;
    const tappedBear = spawn(game, "Grizzly Bears", A, { tapped: true });
    const bear = spawn(game, "Grizzly Bears");
    attack(game, a, [card]);
    expect(counters(game, card)).toBe(1);
    expect(counters(game, tappedBear)).toBe(1);
    expect(counters(game, bear)).toBe(0);
  });
});
