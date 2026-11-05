/**
 * Batch 259, group A: cards freed by built need keys (cost:loyalty-x through
 * effect:random-card-from-hand). One test per clause most likely to be wrong.
 */

import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import { computeCharacteristics } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  activate,
  attack,
  B,
  C,
  cast,
  counters,
  destroy,
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
  registryOf,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  tokensNamed,
  toLibrary,
  toStep,
  types,
  watchTargets,
  zone,
} from "./harness.js";

const colors = (game: Game, id: ObjectId): readonly string[] => [...computeCharacteristics(game.state, registryOf(game), id).colors];
const library = (game: Game, p: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[p].library;
const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

/** A real token (`spawn` makes the name's card, not a token). */
function token(game: Game, name: string, p: PlayerId = A): ObjectId {
  const before = new Set(named(game, name, p));
  game.debugApplyEffect(p, { kind: "create-token", token: name, count: 1 }, []);
  settle(game);
  return named(game, name, p).find((id) => !before.has(id)) as ObjectId;
}

/** Liliana flipped by a creature dying: her back face, 3 loyalty, its Zombie made. */
function flippedLiliana(game: Game): ObjectId {
  const liliana = spawn(game, "Liliana, Heretical Healer");
  destroy(game, spawn(game, "Grizzly Bears"));
  return liliana;
}

describe("−X planeswalkers", () => {
  it("Chandra, Chill of Compliance: surveil's noncreature, nonland card goes to hand, a creature stays", () => {
    const { game, a } = table();
    const chandra = spawn(game, "Chandra, Chill of Compliance");
    const shock = toLibrary(game, "Shock");
    a.chooseScryFn = (_v, cards) => cards.filter((id) => id === shock);
    const before = hand(game).length;
    activate(game, chandra, 0, {});
    expect(zone(game, shock)).toBe("hand");
    expect(hand(game).length).toBe(before + 1);

    const other = table();
    const c2 = spawn(other.game, "Chandra, Chill of Compliance");
    const bears = toLibrary(other.game, "Grizzly Bears");
    other.a.chooseScryFn = (_v, cards) => cards.filter((id) => id === bears);
    activate(other.game, c2, 0, {});
    expect(zone(other.game, bears)).toBe("graveyard");
  });

  it("Chandra, Chill of Compliance: −X taps and puts X stun counters, X off her loyalty", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra, Chill of Compliance");
    const bears = spawn(game, "Grizzly Bears", B);
    loyalty(game, chandra, "-x", { atLeast: 3, x: 2, targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(counters(game, bears, "stun")).toBe(2);
    expect(counters(game, chandra, "loyalty")).toBe(1);
  });

  it("Jace, the Perfected Mind: −X mills three times X; −2 draws three past twenty in a graveyard", () => {
    const { game } = table();
    const jace = spawn(game, "Jace, the Perfected Mind");
    const before = library(game, B).length;
    loyalty(game, jace, "-x", { atLeast: 5, x: 2, targets: [ref(B)] });
    expect(library(game, B).length).toBe(before - 6);

    const two = table();
    const j2 = spawn(two.game, "Jace, the Perfected Mind");
    for (let i = 0; i < 17; i += 1) toGraveyard(two.game, "Wastes", B);
    const held = hand(two.game).length;
    loyalty(two.game, j2, -2, { atLeast: 5, targets: [ref(B)] });
    expect(hand(two.game).length).toBe(held + 3);

    const three = table();
    const j3 = spawn(three.game, "Jace, the Perfected Mind");
    const held3 = hand(three.game).length;
    loyalty(three.game, j3, -2, { atLeast: 5, targets: [ref(B)] });
    expect(hand(three.game).length).toBe(held3 + 1);
  });

  it("Liliana, Heretical Healer: two dying at once flip her once, one Zombie", () => {
    const { game } = table();
    const liliana = spawn(game, "Liliana, Heretical Healer");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { subtype: "Bear" } }, []);
    settle(game);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
    expect(types(game, liliana)).toEqual(["planeswalker"]);
    expect(counters(game, liliana, "loyalty")).toBe(3);
  });

  it("Liliana, Heretical Healer: a token dying doesn't flip her", () => {
    const { game } = table();
    const liliana = spawn(game, "Liliana, Heretical Healer");
    destroy(game, token(game, "Soldier Token"));
    expect(types(game, liliana)).toEqual(["creature"]);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(0);
  });

  it("Liliana, Defiant Necromancer: −X takes only a nonlegendary creature card of exactly X", () => {
    const { game } = table();
    const liliana = flippedLiliana(game);
    expect(counters(game, liliana, "loyalty")).toBe(3);
    const bears = toGraveyard(game, "Hill Giant");
    const legend = toGraveyard(game, "Diaochan, Artful Beauty");
    expect(() => activate(game, liliana, 1, { x: 2, targets: [ref(bears)] })).toThrow();
    expect(() => activate(game, liliana, 1, { x: 4, targets: [ref(legend)] })).toThrow();
    game.state.objects[liliana].counters.loyalty = 4;
    activate(game, liliana, 1, { x: 4, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, liliana, "loyalty")).toBe(0);
  });

  it("Liliana, Defiant Necromancer: the emblem returns any creature that dies at the next end step, under your control", () => {
    const { game } = table();
    const liliana = flippedLiliana(game);
    game.state.objects[liliana].counters.loyalty = 8;
    activate(game, liliana, 2, {});
    const bears = spawn(game, "Grizzly Bears", B);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("graveyard");
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
  });

  it("Nahiri, Storm of Stone: first strike and the equip discount during your turn only; −X needs a tapped creature", () => {
    const { game } = table();
    const nahiri = spawn(game, "Nahiri, Storm of Stone");
    const bears = spawn(game, "Grizzly Bears");
    const knife = spawn(game, "Rakdos Riteknife");
    lands(game, "Wastes", 1);
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    activate(game, knife, 1, { targets: [ref(bears)] });
    expect(game.state.objects[knife].attachedTo).toBe(bears);
    const victim = spawn(game, "Grizzly Bears", B);
    expect(() => loyalty(game, nahiri, "-x", { atLeast: 6, x: 2, targets: [ref(victim)] })).toThrow();
    nextTurn(game);
    expect(keywords(game, bears).has("first-strike")).toBe(false);
  });

  it("Sorin, Grim Nemesis: +1 costs each opponent the card's mana value; −9 counts the highest life total", () => {
    const { game } = table({ players: 3 });
    const sorin = spawn(game, "Sorin, Grim Nemesis");
    const elemental = toLibrary(game, "Air Elemental");
    loyalty(game, sorin, 1, { atLeast: 6 });
    expect(zone(game, elemental)).toBe("hand");
    expect(life(game, B)).toBe(15);
    expect(life(game, C)).toBe(15);
    expect(life(game)).toBe(20);

    const two = table();
    const s2 = spawn(two.game, "Sorin, Grim Nemesis");
    two.game.state.players[B].life = 7;
    two.game.state.players[A].life = 12;
    loyalty(two.game, s2, -9, { atLeast: 9 });
    expect(tokensNamed(two.game, "Vampire Knight Token", A)).toBe(12);
  });

  it("Tamiyo, Compleated Sage: −X exiles a nonland permanent card of X for a token copy; a land won't do", () => {
    const { game } = table();
    const tamiyo = spawn(game, "Tamiyo, Compleated Sage");
    const bears = toGraveyard(game, "Grizzly Bears");
    const forest = toGraveyard(game, "Forest");
    expect(() => loyalty(game, tamiyo, "-x", { atLeast: 5, x: 0, targets: [ref(forest)] })).toThrow();
    // A land that's an artifact too is still a land.
    const citadel = toGraveyard(game, "Darksteel Citadel");
    expect(() => loyalty(game, tamiyo, "-x", { atLeast: 5, x: 0, targets: [ref(citadel)] })).toThrow();
    expect(() => loyalty(game, tamiyo, "-x", { atLeast: 5, x: 1, targets: [ref(bears)] })).toThrow();
    loyalty(game, tamiyo, "-x", { atLeast: 5, x: 2, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(1);
  });

  it("Tamiyo's Notebook: spells cost {2} less, and it draws", () => {
    const { game } = table();
    const tamiyo = spawn(game, "Tamiyo, Compleated Sage");
    loyalty(game, tamiyo, -7, { atLeast: 7 });
    const notebook = named(game, "Tamiyo's Notebook Token", A)[0];
    expect(game.state.objects[notebook].isToken).toBe(true);
    lands(game, "Island", 1);
    const before = hand(game).length;
    const divination = toHand(game, "Divination");
    cast(game, divination);
    expect(hand(game).length).toBe(before + 2);
    activate(game, notebook, 0, {});
    expect(hand(game).length).toBe(before + 3);
  });

  it("Ugin, the Spirit Dragon: −X exiles coloured permanents of X or less, and nothing colourless", () => {
    const { game } = table();
    const ugin = spawn(game, "Ugin, the Spirit Dragon");
    const bears = spawn(game, "Grizzly Bears", B);
    const elemental = spawn(game, "Air Elemental", B);
    const ring = spawn(game, "Sol Ring", B);
    const land = spawn(game, "Wastes", B);
    loyalty(game, ugin, "-x", { atLeast: 7, x: 2 });
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, elemental)).toBe("battlefield");
    expect(zone(game, ring)).toBe("battlefield");
    expect(zone(game, land)).toBe("battlefield");
    expect(zone(game, ugin)).toBe("battlefield");
  });

  it("Ugin, the Spirit Dragon: −10 gains 7, draws 7, then puts up to seven permanent cards from hand", () => {
    const { game, a } = table();
    const ugin = spawn(game, "Ugin, the Spirit Dragon");
    const bears = toHand(game, "Grizzly Bears");
    const shock = toHand(game, "Shock");
    const seen = pickFromZone(a, bears);
    const before = hand(game).length;
    loyalty(game, ugin, -10, { atLeast: 10 });
    expect(life(game)).toBe(27);
    expect(hand(game).length).toBe(before + 7 - 1);
    expect(zone(game, bears)).toBe("battlefield");
    expect(seen.offered).not.toContain(shock);
  });
});

describe("a choice across zones, and over a set", () => {
  it("Bonny Pall: Beau is as big as your lands; attacking draws, then may put a land from hand or graveyard", () => {
    const { game, a } = table({ openingHandSize: 0 });
    lands(game, "Wastes", 3);
    const bonny = enter(game, "Bonny Pall, Clearcutter");
    const beau = named(game, "Beau Token", A)[0];
    expect(pt(game, beau)).toEqual({ power: 3, toughness: 3 });
    const forest = toGraveyard(game, "Forest");
    const swamp = toHand(game, "Swamp");
    pickModes(a, 0);
    const seen = pickFromZone(a, forest);
    const before = hand(game).length;
    attack(game, a, [bonny]);
    expect(seen.offered).toEqual(expect.arrayContaining([forest, swamp]));
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(false);
    expect(pt(game, beau).power).toBe(4);
    expect(hand(game)).toContain(swamp);
    expect(hand(game).length).toBe(before + 1);
  });

  it("Dread Tiller: any creature dying with a -1/-1 counter lets you put a land tapped", () => {
    const { game, a } = table();
    pickTargets(a, spawn(game, "Hill Giant", B));
    enter(game, "Dread Tiller");
    const giant = game.battlefield.find((id) => counters(game, id, "-1/-1") === 1) as ObjectId;
    const forest = toGraveyard(game, "Forest");
    pickModes(a, 0);
    pickFromZone(a, forest);
    destroy(game, giant);
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
  });

  it("Final Parting: one to hand, the other to the graveyard", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const before = hand(game).length;
    const spell = toHand(game, "Final Parting");
    cast(game, spell);
    expect(hand(game).length).toBe(before + 1);
    expect(graveyard(game).length).toBe(2);

    // A library of one: that one goes to hand, and nothing hangs.
    const short = table();
    lands(short.game, "Swamp", 5);
    short.game.state.zones.perPlayer[A].library.splice(1);
    const held = hand(short.game).length;
    cast(short.game, toHand(short.game, "Final Parting"));
    expect(hand(short.game).length).toBe(held + 1);
    expect(library(short.game).length).toBe(0);
  });

  it("Haunting Voyage: up to two of the chosen type; foretold, all of them", () => {
    const { game, a } = table();
    lands(game, "Swamp", 6);
    const bears = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Grizzly Bears")];
    const giant = toGraveyard(game, "Hill Giant");
    a.chooseCreatureTypeFn = () => "Bear";
    pickFromZone(a, bears[0], bears[1]);
    cast(game, toHand(game, "Haunting Voyage"));
    expect(zone(game, bears[0])).toBe("battlefield");
    expect(zone(game, bears[1])).toBe("battlefield");
    expect(zone(game, bears[2])).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");

    const two = table();
    lands(two.game, "Swamp", 9);
    const more = [toGraveyard(two.game, "Grizzly Bears"), toGraveyard(two.game, "Grizzly Bears"), toGraveyard(two.game, "Grizzly Bears")];
    two.a.chooseCreatureTypeFn = () => "Bear";
    const voyage = toHand(two.game, "Haunting Voyage");
    two.game.dispatch({ type: "foretell", player: A, card: voyage } as Action);
    nextTurn(two.game);
    toStep(two.game, "precombat-main");
    two.game.dispatch({ type: "cast-spell", player: A, card: voyage, targets: [], via: "foretell" } as Action);
    settle(two.game);
    for (const id of more) expect(zone(two.game, id)).toBe("battlefield");
  });

  it("Portent of Calamity: four exiled offers a free cast, the rest of the exiled to hand, the unpicked milled", () => {
    const { game, a } = table();
    lands(game, "Island", 7);
    const land = toLibrary(game, "Forest");
    const sorcery = toLibrary(game, "Divination");
    const instant = toLibrary(game, "Shock");
    const creature = toLibrary(game, "Grizzly Bears");
    const artifact = toLibrary(game, "Sol Ring");
    const extra = toLibrary(game, "Air Elemental");
    pickFromZone(a, artifact, creature, instant, sorcery);
    let offered: readonly string[] = [];
    a.chooseCastNowFn = (_v, offer) => {
      offered = offer.casts.map((c) => c.cardName);
      return { type: "cast-spell", player: A, card: creature, targets: [], via: "effect", free: true };
    };
    cast(game, toHand(game, "Portent of Calamity"), { x: 6 });
    expect(offered).toContain("Grizzly Bears");
    expect(offered).not.toContain("Air Elemental");
    expect(zone(game, creature)).toBe("battlefield");
    expect(zone(game, artifact)).toBe("hand");
    expect(zone(game, instant)).toBe("hand");
    expect(zone(game, sorcery)).toBe("hand");
    expect(zone(game, extra)).toBe("graveyard");
    expect(zone(game, land)).toBe("graveyard");
  });

  it("Portent of Calamity: with three exiled no cast is offered, and all three go to hand", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const instant = toLibrary(game, "Shock");
    const creature = toLibrary(game, "Grizzly Bears");
    const artifact = toLibrary(game, "Sol Ring");
    pickFromZone(a, artifact, creature, instant);
    let asked = 0;
    a.chooseCastNowFn = () => {
      asked += 1;
      return null;
    };
    cast(game, toHand(game, "Portent of Calamity"), { x: 3 });
    expect(asked).toBe(0);
    for (const id of [artifact, creature, instant]) expect(zone(game, id)).toBe("hand");
  });

  it("Search for Blex: 3 life for each card taken, the rest milled", () => {
    const { game, a } = table();
    lands(game, "Swamp", 4);
    const one = toLibrary(game, "Shock");
    const two = toLibrary(game, "Divination");
    const three = toLibrary(game, "Hill Giant");
    pickFromZone(a, one, two);
    cast(game, toHand(game, "Blex, Vexing Pest"), { face: 1 } as never);
    expect(zone(game, one)).toBe("hand");
    expect(zone(game, two)).toBe("hand");
    expect(zone(game, three)).toBe("graveyard");
    expect(life(game)).toBe(14);
  });

  it("Blex, Vexing Pest: other Spiders get +1/+1, Blex doesn't; it gains 4 as it dies", () => {
    const { game } = table();
    const blex = spawn(game, "Blex, Vexing Pest");
    const spider = spawn(game, "Giant Spider");
    expect(pt(game, spider)).toEqual({ power: 3, toughness: 5 });
    expect(pt(game, blex)).toEqual({ power: 3, toughness: 2 });
    destroy(game, blex);
    expect(life(game)).toBe(24);
  });

  it("Inscribed Tablet: a revealed land must be taken and nothing's drawn; with none, it draws", () => {
    const land = table({ deck: "Shock" });
    const tablet = spawn(land.game, "Inscribed Tablet");
    lands(land.game, "Wastes", 1);
    const forest = toLibrary(land.game, "Forest");
    const before = hand(land.game).length;
    activate(land.game, tablet, 0, {});
    expect(zone(land.game, forest)).toBe("hand");
    expect(hand(land.game).length).toBe(before + 1);

    const none = table({ deck: "Shock" });
    const t2 = spawn(none.game, "Inscribed Tablet");
    lands(none.game, "Wastes", 1);
    const top = toLibrary(none.game, "Hill Giant");
    const held = hand(none.game).length;
    activate(none.game, t2, 0, {});
    expect(hand(none.game).length).toBe(held + 1);
    // The five went to the bottom first, so the draw isn't the Giant.
    expect(zone(none.game, top)).toBe("library");
  });
});

describe("other players' choices", () => {
  it("Curse of Inertia: the attacking player chooses the target and taps it; the Curse's controller decides nothing", () => {
    const { game, a, b } = table({ players: 2 });
    lands(game, "Island", 3, B);
    nextTurn(game);
    expect(game.state.turn.number).toBeGreaterThan(1);
    const curse = toHand(game, "Curse of Inertia", B);
    cast(game, curse, { player: B, targets: [ref(A)] });
    expect(game.state.objects[curse].attachedToPlayer).toBe(A);
    const attacker = spawn(game, "Grizzly Bears", B);
    const blocker = spawn(game, "Hill Giant", A);
    // Alice is enchanted; Bob, the attacking player, answers both questions.
    const seen = watchTargets(b, () => [blocker]);
    pickModes(b, 0);
    pickModes(a);
    attack(game, b, [attacker], A);
    expect(seen.asked).toBeGreaterThan(0);
    expect(game.state.objects[blocker].tapped).toBe(true);
  });

  it("Diaochan, Artful Beauty: the named opponent chooses the second target", () => {
    const { game, b } = table();
    const diaochan = spawn(game, "Diaochan, Artful Beauty");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    pickTargets(b, mine);
    game.dispatch({ type: "activate-ability", player: A, source: diaochan, abilityIndex: 0, targets: [ref(theirs)], otherChooser: B } as Action);
    settle(game);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("graveyard");
  });

  it("Echo Chamber: the opponent picks among their own creatures; a hasty token, gone at the end step", () => {
    const { game, b } = table();
    const chamber = spawn(game, "Echo Chamber");
    lands(game, "Wastes", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Craw Wurm");
    const seen = watchTargets(b, () => [bears]);
    game.dispatch({ type: "activate-ability", player: A, source: chamber, abilityIndex: 0, targets: [], otherChooser: B } as Action);
    settle(game);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([bears, giant]));
    expect(seen.offered[0]).not.toContain(mine);
    const token = named(game, "Grizzly Bears", A)[0];
    expect(keywords(game, token).has("haste")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(named(game, "Grizzly Bears", A).length).toBe(0);
  });

  it("Deliver Unto Evil: the opponent's two stay, the rest to hand, the spell exiled", () => {
    const { game, b } = table();
    lands(game, "Swamp", 3);
    const cards = [
      toGraveyard(game, "Shock"),
      toGraveyard(game, "Divination"),
      toGraveyard(game, "Hill Giant"),
      toGraveyard(game, "Grizzly Bears"),
    ];
    pickFromZone(b, cards[0], cards[1]);
    pickPermanents(b, cards[0], cards[1]);
    const spell = toHand(game, "Deliver Unto Evil");
    cast(game, spell, { targets: cards.map(ref) });
    expect(zone(game, cards[0])).toBe("graveyard");
    expect(zone(game, cards[1])).toBe("graveyard");
    expect(zone(game, cards[2])).toBe("hand");
    expect(zone(game, cards[3])).toBe("hand");
    expect(zone(game, spell)).toBe("exile");
  });

  it("Deliver Unto Evil: with a Bolas planeswalker, all of them", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    spawn(game, "Nicol Bolas, Planeswalker");
    const cards = [toGraveyard(game, "Shock"), toGraveyard(game, "Divination"), toGraveyard(game, "Hill Giant")];
    cast(game, toHand(game, "Deliver Unto Evil"), { targets: cards.map(ref) });
    for (const id of cards) expect(zone(game, id)).toBe("hand");
  });
});

describe("aggregates over the graveyard and the attackers", () => {
  it("Hapatra: X -1/-1 counters on a creature of each opponent, X the greatest mana value in your graveyard", () => {
    const { game, a } = table({ players: 3 });
    toGraveyard(game, "Air Elemental");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Craw Wurm", B);
    const bobs = spawn(game, "Colossal Dreadmaw", B);
    const carols = spawn(game, "Hill Giant", C);
    pickTargets(a, bobs, carols);
    enter(game, "Hapatra, the Desert Fang");
    expect(counters(game, bobs, "-1/-1")).toBe(5);
    expect(zone(game, carols)).toBe("graveyard");
  });

  it("Kraven's Last Hunt: chapter I deals the greatest creature power in your graveyard", () => {
    const { game, a } = table();
    toGraveyard(game, "Air Elemental");
    toGraveyard(game, "Craw Wurm", B);
    const maw = spawn(game, "Colossal Dreadmaw", B);
    pickTargets(a, maw);
    enter(game, "Kraven's Last Hunt");
    expect(damage(game, maw)).toBe(4);
  });

  it("Skanos Dragonheart: other Dragons and Dragon cards in your graveyard, never itself", () => {
    const { game, a } = table();
    const skanos = spawn(game, "Skanos Dragonheart");
    a.declareAttackersFn = () => [{ attacker: skanos, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0 && s.priority.holder === A);
    expect(pt(game, skanos).power).toBe(4);

    const two = table();
    const s2 = spawn(two.game, "Skanos Dragonheart");
    toGraveyard(two.game, "Shivan Dragon");
    two.a.declareAttackersFn = () => [{ attacker: s2, defender: B }];
    two.game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0 && s.priority.holder === A);
    expect(pt(two.game, s2)).toEqual({ power: 9, toughness: 9 });
  });

  it("Wick's Patrol: mills three, then -X/-X by the greatest mana value now there", () => {
    const { game, a } = table({ deck: "Air Elemental" });
    const maw = spawn(game, "Colossal Dreadmaw", B);
    pickTargets(a, maw);
    enter(game, "Wick's Patrol");
    expect(graveyard(game).length).toBe(3);
    expect(pt(game, maw)).toEqual({ power: 1, toughness: 1 });
  });

  it("Aloy: discover the greatest power among the artifact creatures that attacked", () => {
    const { game, a } = table();
    spawn(game, "Aloy, Savior of Meridian");
    const sable = spawn(game, "Bronze Sable");
    const shock = toLibrary(game, "Shock");
    const divination = toLibrary(game, "Divination");
    a.chooseCastNowFn = () => null;
    attack(game, a, [sable]);
    // Discover 2: Divination (3) goes past; Shock (1) is found and, uncast, taken.
    expect(zone(game, shock)).toBe("hand");
    expect(zone(game, divination)).toBe("library");
  });
});

describe("animations and colours", () => {
  it("Halsin: a token becomes a green Bear 4/4 in addition, until end of turn", () => {
    const { game } = table();
    const halsin = spawn(game, "Halsin, Emerald Archdruid");
    lands(game, "Wastes", 1);
    const soldier = token(game, "Soldier Token");
    expect(() => activate(game, halsin, 0, { targets: [ref(halsin)] })).toThrow();
    activate(game, halsin, 0, { targets: [ref(soldier)] });
    expect(pt(game, soldier)).toEqual({ power: 4, toughness: 4 });
    expect(colors(game, soldier)).toEqual(expect.arrayContaining(["W", "G"]));
    expect(subtypes(game, soldier)).toEqual(expect.arrayContaining(["Soldier", "Bear"]));
    nextTurn(game);
    expect(pt(game, soldier).power).toBe(1);
  });

  it("Hunting Wilds: kicked, the Forests untap and stay 3/3 green hasty creatures; unkicked, tapped lands", () => {
    const { game, a } = table();
    lands(game, "Forest", 8);
    const one = toLibrary(game, "Forest");
    const two = toLibrary(game, "Forest");
    pickFromZone(a, one, two);
    cast(game, toHand(game, "Hunting Wilds"), { kicked: true });
    for (const id of [one, two]) {
      expect(game.state.objects[id].tapped).toBe(false);
      expect(pt(game, id)).toEqual({ power: 3, toughness: 3 });
      expect(types(game, id)).toEqual(expect.arrayContaining(["land", "creature"]));
      expect(colors(game, id)).toEqual(["G"]);
      expect(keywords(game, id).has("haste")).toBe(true);
    }
    nextTurn(game);
    expect(pt(game, one).power).toBe(3);

    const plain = table();
    lands(plain.game, "Forest", 4);
    const three = toLibrary(plain.game, "Forest");
    pickFromZone(plain.a, three);
    cast(plain.game, toHand(plain.game, "Hunting Wilds"));
    expect(zone(plain.game, three)).toBe("battlefield");
    expect(plain.game.state.objects[three].tapped).toBe(true);
    expect(types(plain.game, three)).toEqual(["land"]);
  });

  it("Shadow Puppeteers: a flyer attacking may become a red Dragon 4/4 in addition", () => {
    const { game, a } = table();
    enter(game, "Shadow Puppeteers");
    expect(tokensNamed(game, "Faerie Rogue Token", A)).toBe(2);
    const flyer = spawn(game, "Air Elemental");
    pickModes(a, 0);
    a.declareAttackersFn = () => [{ attacker: flyer, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0 && s.priority.holder === A);
    expect(pt(game, flyer)).toEqual({ power: 4, toughness: 4 });
    expect(colors(game, flyer)).toEqual(expect.arrayContaining(["U", "R"]));
    expect(subtypes(game, flyer)).toEqual(expect.arrayContaining(["Elemental", "Dragon"]));
    expect(keywords(game, flyer).has("flying")).toBe(true);
    nextTurn(game);
    expect(subtypes(game, flyer)).toEqual(["Elemental"]);
  });

  it("Sarkhan the Masterless: +1 makes each planeswalker only a 4/4 red flying Dragon; damage takes no loyalty", () => {
    const { game } = table();
    const sarkhan = spawn(game, "Sarkhan the Masterless");
    const other = spawn(game, "Chandra Nalaar");
    game.state.objects[other].counters.loyalty = 6;
    loyalty(game, sarkhan, 1, { atLeast: 5 });
    for (const id of [sarkhan, other]) {
      expect(types(game, id)).toEqual(["creature"]);
      expect(subtypes(game, id)).toEqual(["Dragon"]);
      expect(colors(game, id)).toEqual(["R"]);
      expect(pt(game, id)).toEqual({ power: 4, toughness: 4 });
      expect(keywords(game, id).has("flying")).toBe(true);
    }
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(other)]);
    settle(game);
    expect(counters(game, other, "loyalty")).toBe(6);
    expect(damage(game, other)).toBe(1);
    // A loyalty ability is still hers to use, creature or not (the ruling).
    loyalty(game, other, 1, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    nextTurn(game);
    expect(types(game, sarkhan)).toEqual(["planeswalker"]);
  });

  it("Sarkhan the Masterless: each Dragon you control deals 1 damage to a creature attacking you", () => {
    const { game, b } = table();
    spawn(game, "Sarkhan the Masterless");
    spawn(game, "Dragon Token (Dragonback Assault)");
    spawn(game, "Dragon Token (Dragonback Assault)");
    const bears = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    attack(game, b, [bears], A);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("The Bears of Littjara: chapter II sets 4/4 for good, chapter III's Bear deals its power to the target", () => {
    const { game, a } = table();
    const saga = enter(game, "The Bears of Littjara");
    const shifter = named(game, "Shapeshifter Token (Blue)", A)[0];
    expect(pt(game, shifter)).toEqual({ power: 2, toughness: 2 });
    pickTargets(a, shifter);
    toStep(game, "precombat-main");
    settle(game);
    expect(pt(game, shifter)).toEqual({ power: 4, toughness: 4 });
    const maw = spawn(game, "Colossal Dreadmaw", B);
    const small = spawn(game, "Grizzly Bears");
    pickTargets(a, maw);
    toStep(game, "precombat-main");
    settle(game);
    expect(pt(game, shifter).power).toBe(4);
    expect(damage(game, maw)).toBe(4);
    expect(zone(game, small)).toBe("battlefield");
    expect(zone(game, saga)).toBe("graveyard");
  });
});

describe("Aura returns", () => {
  it("Gift of Immortality: the creature back at once, the Aura back on it at the next end step", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    const gift = toHand(game, "Gift of Immortality");
    pickTargets(a, bears);
    cast(game, gift, { targets: [ref(bears)] });
    expect(game.state.objects[gift].attachedTo).toBe(bears);
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, gift)).toBe("graveyard");
    toStep(game, "end");
    settle(game);
    expect(zone(game, gift)).toBe("battlefield");
    expect(game.state.objects[gift].attachedTo).toBe(bears);
  });

  it("Gift of Immortality: a token doesn't come back, and neither does the Aura", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const soldier = token(game, "Soldier Token");
    const gift = toHand(game, "Gift of Immortality");
    cast(game, gift, { targets: [ref(soldier)] });
    destroy(game, soldier);
    toStep(game, "end");
    settle(game);
    expect(zone(game, gift)).toBe("graveyard");
  });

  it("Gift of Immortality: with the creature gone by the end step, the Aura stays in the graveyard", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    const gift = toHand(game, "Gift of Immortality");
    cast(game, gift, { targets: [ref(bears)] });
    destroy(game, bears);
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(bears)]);
    settle(game);
    toStep(game, "end");
    settle(game);
    expect(zone(game, gift)).toBe("graveyard");
  });

  it("Reins of the Vinesteed: back on a creature sharing a type, any controller's, none other offered", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const bears = spawn(game, "Grizzly Bears");
    const hers = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant");
    const reins = toHand(game, "Reins of the Vinesteed");
    cast(game, reins, { targets: [ref(bears)] });
    expect(pt(game, bears).power).toBe(4);
    let offered: readonly ObjectId[] = [];
    a.chooseEnchantFn = ((_v: unknown, _aura: unknown, options: readonly ObjectId[]) => {
      offered = options;
      return options[0];
    }) as never;
    pickModes(a, 0);
    destroy(game, bears);
    expect(zone(game, reins)).toBe("battlefield");
    expect(game.state.objects[reins].attachedTo).toBe(hers);
    expect(offered).not.toContain(giant);
  });
});

describe("regeneration", () => {
  it("Jaya Ballard, Task Mage: the 3 damage's creature can't regenerate; the discard is paid", () => {
    const { game } = table();
    const jaya = spawn(game, "Jaya Ballard, Task Mage");
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "regenerate", target: 0 }, [ref(bears)]);
    const before = hand(game).length;
    activate(game, jaya, 1, { targets: [ref(bears)] });
    expect(hand(game).length).toBe(before - 1);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Lim-Dûl's Cohort: the creature it blocks can't regenerate", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const cohort = spawn(game, "Lim-Dûl's Cohort", B);
    game.debugApplyEffect(A, { kind: "regenerate", target: 0 }, [ref(bears)]);
    b.declareBlockersFn = () => [{ blocker: cohort, attacker: bears }] as never;
    attack(game, a, [bears]);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Orcish Healer: regenerates only a black or green creature", () => {
    const { game } = table();
    const healer = spawn(game, "Orcish Healer");
    lands(game, "Mountain", 3);
    spawn(game, "Forest");
    spawn(game, "Forest");
    const giant = spawn(game, "Hill Giant");
    expect(() => activate(game, healer, 2, { targets: [ref(giant)] })).toThrow();
  });

  it("Scorching Lava: kicked, the creature is exiled and can't regenerate; unkicked, it dies", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(B, { kind: "regenerate", target: 0 }, [ref(bears)]);
    cast(game, toHand(game, "Scorching Lava"), { targets: [ref(bears)], kicked: true });
    expect(zone(game, bears)).toBe("exile");

    const plain = table();
    lands(plain.game, "Mountain", 2);
    const b2 = spawn(plain.game, "Grizzly Bears", B);
    cast(plain.game, toHand(plain.game, "Scorching Lava"), { targets: [ref(b2)] });
    expect(zone(plain.game, b2)).toBe("graveyard");
  });
});

describe("spell copies", () => {
  const fromExile = (game: Game, name: string): ObjectId => {
    const card = toLibrary(game, name);
    game.debugApplyEffect(A, { kind: "impulse-exile", amount: 1, duration: "end-of-turn" }, []);
    settle(game);
    expect(zone(game, card)).toBe("exile");
    return card;
  };
  /** Cast `card` from exile the way its offer says. */
  const castExiled = (game: Game, card: ObjectId): void => {
    const offer = game.legalActions(A).find((o) => o.kind === "cast-spell" && o.card === card);
    if (offer === undefined || offer.kind !== "cast-spell") throw new Error("not offered");
    cast(game, card, { via: offer.via } as never);
  };

  it("Mizzix, Replica Rider: pay, and a creature spell from exile is copied with haste, sacrificed at your end step", () => {
    const { game, a } = table();
    spawn(game, "Mizzix, Replica Rider");
    lands(game, "Mountain", 4);
    lands(game, "Forest", 2);
    const bears = fromExile(game, "Grizzly Bears");
    pickModes(a, 0);
    castExiled(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    const copies = named(game, "Grizzly Bears", A).filter((id) => id !== bears);
    expect(copies.length).toBe(1);
    expect(keywords(game, copies[0]).has("haste")).toBe(true);
    expect(keywords(game, bears).has("haste")).toBe(false);
    toStep(game, "end");
    settle(game);
    expect(named(game, "Grizzly Bears", A)).toEqual([bears]);
  });

  it("Mizzix, Replica Rider: a spell from hand isn't copied", () => {
    const { game, a } = table();
    spawn(game, "Mizzix, Replica Rider");
    lands(game, "Forest", 4);
    pickModes(a, 0);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(named(game, "Grizzly Bears", A).length).toBe(1);
  });

  it("Spider-Verse: a copy once a turn, with haste, and a declined one leaves it open", () => {
    const { game, a } = table();
    spawn(game, "Spider-Verse");
    lands(game, "Forest", 6);
    const first = fromExile(game, "Grizzly Bears");
    pickModes(a);
    castExiled(game, first);
    expect(named(game, "Grizzly Bears", A).length).toBe(1);
    const second = fromExile(game, "Grizzly Bears");
    pickModes(a, 0);
    castExiled(game, second);
    const copies = named(game, "Grizzly Bears", A).filter((id) => id !== first && id !== second);
    expect(copies.length).toBe(1);
    expect(keywords(game, copies[0]).has("haste")).toBe(true);
    const third = fromExile(game, "Giant Spider");
    lands(game, "Forest", 4);
    castExiled(game, third);
    expect(named(game, "Giant Spider", A).length).toBe(1);
  });

  it("Complete the Circuit: sorceries at instant speed, and the next one copied twice", () => {
    const { game } = table({ step: "begin-combat" });
    lands(game, "Island", 9);
    cast(game, toHand(game, "Complete the Circuit"));
    expect(() => cast(game, toHand(game, "Grizzly Bears"))).toThrow();
    const before = hand(game).length;
    const divination = toHand(game, "Divination");
    cast(game, divination);
    expect(hand(game).length).toBe(before + 6);
  });
});

describe("counters removed this way", () => {
  it("Chandra, Legacy of Fire: one loyalty each off two permanents exiles two to play", () => {
    const { game, a } = table();
    const chandra = spawn(game, "Chandra, Legacy of Fire");
    const other = spawn(game, "Chandra Nalaar");
    game.state.objects[chandra].counters.loyalty = 3;
    game.state.objects[other].counters.loyalty = 6;
    const one = toLibrary(game, "Shock");
    const two = toLibrary(game, "Hill Giant");
    const three = toLibrary(game, "Divination");
    a.chooseCounterRemovalsFn = () => [
      { object: chandra, kind: "loyalty", count: 1 },
      { object: other, kind: "loyalty", count: 1 },
    ];
    loyalty(game, chandra, 0, {});
    expect(counters(game, chandra, "loyalty")).toBe(2);
    expect(counters(game, other, "loyalty")).toBe(5);
    expect(zone(game, three)).toBe("exile");
    expect(zone(game, two)).toBe("exile");
    expect(zone(game, one)).toBe("library");
  });

  it("Chandra, Legacy of Fire: the end step's X and the +1's mana count her planeswalkers", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra, Legacy of Fire");
    spawn(game, "Chandra Nalaar");
    loyalty(game, chandra, 1, { atLeast: 3 });
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["R", "R"]);
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(18);
  });

  it("Coalition Relic: all charge counters come off at your first main, a mana each", () => {
    const { game } = table({ step: "upkeep" });
    const relic = spawn(game, "Coalition Relic");
    game.state.objects[relic].counters.charge = 2;
    toStep(game, "precombat-main");
    settle(game);
    expect(counters(game, relic, "charge")).toBe(0);
    expect(game.state.players[A].manaPool.length).toBe(2);
  });

  it("Ingenious Prodigy: a counter off, a card drawn; no counter, no question", () => {
    const { game, a } = table({ step: "upkeep" });
    const prodigy = spawn(game, "Ingenious Prodigy");
    game.state.objects[prodigy].counters["+1/+1"] = 1;
    pickModes(a, 0);
    const before = hand(game).length;
    nextTurn(game, "upkeep");
    nextTurn(game, "upkeep");
    settle(game);
    expect(counters(game, prodigy)).toBe(0);
    expect(hand(game).length).toBeGreaterThan(before);
  });

  it("Lily Bowen: doubles at 16 power or less; past it, all but one come off for that much life", () => {
    const { game } = table();
    const lily = enter(game, "Lily Bowen, Raging Grandma");
    expect(counters(game, lily)).toBe(2);
    nextTurn(game);
    toStep(game, "precombat-main");
    expect(counters(game, lily)).toBe(4);
    game.state.objects[lily].counters["+1/+1"] = 17;
    nextTurn(game);
    toStep(game, "precombat-main");
    expect(counters(game, lily)).toBe(1);
    expect(life(game)).toBe(36);
  });

  it("Magnanimous Magistrate: that many reprieve counters return the card; too few, and it isn't offered", () => {
    const { game, a } = table();
    const magistrate = enter(game, "Magnanimous Magistrate");
    expect(counters(game, magistrate, "reprieve")).toBe(5);
    const elemental = spawn(game, "Air Elemental");
    pickModes(a, 0);
    destroy(game, elemental);
    expect(zone(game, elemental)).toBe("battlefield");
    expect(counters(game, magistrate, "reprieve")).toBe(0);
    const bears = spawn(game, "Grizzly Bears");
    destroy(game, bears);
    expect(zone(game, bears)).toBe("graveyard");
    const token = spawn(game, "Soldier Token");
    destroy(game, token);
    expect(counters(game, magistrate, "reprieve")).toBe(0);
  });
});

describe("divided amounts", () => {
  it("Aurelia's Fury: a damaged creature taps, a damaged player can't cast noncreature spells", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    lands(game, "Plains", 1);
    lands(game, "Mountain", 1, B);
    const bears = spawn(game, "Grizzly Bears", B);
    const shock = toHand(game, "Shock", B);
    cast(game, toHand(game, "Aurelia's Fury"), { x: 3, targets: [ref(bears), ref(B)], division: [1, 2] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(damage(game, bears)).toBe(1);
    expect(life(game, B)).toBe(18);
    toStep(game, "begin-combat");
    game.advanceUntil((s) => s.priority.holder === B);
    expect(game.legalActions(B).some((o) => o.kind === "cast-spell" && o.card === shock)).toBe(false);
  });

  it("Aurelia's Fury: a player not dealt damage may still cast", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    lands(game, "Mountain", 1, B);
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    const shock = toHand(game, "Shock", B);
    cast(game, toHand(game, "Aurelia's Fury"), { x: 1, targets: [ref(bears)], division: [1] });
    toStep(game, "begin-combat");
    game.advanceUntil((s) => s.priority.holder === B);
    expect(game.legalActions(B).some((o) => o.kind === "cast-spell" && o.card === shock)).toBe(true);
  });

  it("Living Inferno: its power divided, then each target deals its power back", () => {
    const { game } = table();
    const inferno = spawn(game, "Living Inferno");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    game.dispatch({ type: "activate-ability", player: A, source: inferno, abilityIndex: 0, targets: [ref(bears), ref(giant)], division: [2, 6] } as Action);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
    // 2 + 3 back, on 5 toughness: both were dealt lethal, and still deal it.
    expect(zone(game, inferno)).toBe("graveyard");
  });

  it("Ravenous Gigantotherium: X its power, up to X targets, the damage back", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const elf = spawn(game, "Hill Giant", B);
    const seen = watchTargets(a, () => [bears, elf]);
    const beast = enter(game, "Ravenous Gigantotherium");
    expect(seen.asked).toBe(1);
    expect(zone(game, beast)).toBe("graveyard");
    expect(damage(game, elf) + (zone(game, bears) === "graveyard" ? 2 : damage(game, bears))).toBe(3);
  });

  it("Serra's Hymn: X the counters, shields divided as it's activated", () => {
    const { game, a } = table({ step: "upkeep" });
    const hymn = spawn(game, "Serra's Hymn");
    game.state.objects[hymn].counters.verse = 3;
    pickModes(a);
    toStep(game, "precombat-main");
    const bears = spawn(game, "Grizzly Bears");
    game.dispatch({ type: "activate-ability", player: A, source: hymn, abilityIndex: 0, targets: [ref(bears), ref(A)], division: [2, 1], sacrifice: hymn } as Action);
    settle(game);
    expect(zone(game, hymn)).toBe("graveyard");
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(bears)]);
    game.debugApplyEffect(B, { kind: "damage", amount: 2, target: 0 }, [ref(A)]);
    settle(game);
    expect(damage(game, bears)).toBe(0);
    expect(life(game)).toBe(19);
  });

  it("Serra's Hymn: the upkeep's verse counter is optional", () => {
    const { game, a } = table();
    const hymn = spawn(game, "Serra's Hymn");
    pickModes(a, 0);
    nextTurn(game);
    toStep(game, "precombat-main");
    expect(counters(game, hymn, "verse")).toBe(1);
  });
});

describe("each permanent deals damage", () => {
  it("Case of the Gateway Express: each creature you control deals 1; three attackers solve it, +1/+0", () => {
    const { game, a } = table();
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    const three = spawn(game, "Hill Giant");
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(a, wurm);
    enter(game, "Case of the Gateway Express");
    expect(damage(game, wurm)).toBe(3);
    attack(game, a, [one, two, three]);
    expect(pt(game, three).power).toBe(3);
    toStep(game, "end");
    settle(game);
    expect(pt(game, three).power).toBe(4);
  });

  it("Case of the Gateway Express: two attackers don't solve it", () => {
    const { game, a } = table();
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Grizzly Bears");
    enter(game, "Case of the Gateway Express");
    attack(game, a, [one, two]);
    toStep(game, "end");
    settle(game);
    expect(pt(game, one).power).toBe(2);
  });

});

describe("the rest", () => {
  it("Rakdos Riteknife: blood counters by the granted ability pump, then its sacrifice counts them", () => {
    const { game, b } = table();
    const knife = spawn(game, "Rakdos Riteknife");
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears");
    activate(game, knife, 1, { targets: [ref(bears)] });
    const fodder = spawn(game, "Soldier Token");
    activate(game, bears, 0, { sacrifice: fodder });
    expect(counters(game, knife, "blood")).toBe(1);
    expect(pt(game, bears).power).toBe(3);
    game.state.objects[knife].counters.blood = 2;
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    const v1 = spawn(game, "Grizzly Bears", B);
    const v2 = spawn(game, "Hill Giant", B);
    const v3 = spawn(game, "Craw Wurm", B);
    b.chooseSacrificesFn = () => [v1, v2];
    activate(game, knife, 0, { targets: [ref(B)], sacrifice: knife });
    expect(zone(game, knife)).toBe("graveyard");
    expect(zone(game, v1)).toBe("graveyard");
    expect(zone(game, v2)).toBe("graveyard");
    expect(zone(game, v3)).toBe("battlefield");
  });

  it("Sizzling Soloist: can't block at once; the second resolution also makes it attack next combat", () => {
    const { game, a } = table();
    spawn(game, "Sizzling Soloist");
    const victim = spawn(game, "Grizzly Bears", B);
    pickTargets(a, victim);
    enter(game, "Hill Giant");
    const attackOffer = (): readonly ObjectId[] => {
      game.advanceUntil((s) => s.awaiting?.kind === "attackers" && s.awaiting.player === B);
      const offer = game.legalActions(B).find((o) => o.kind === "declare-attackers");
      return offer !== undefined && offer.kind === "declare-attackers" ? offer.mustAttack : [];
    };
    enter(game, "Hill Giant");
    expect(attackOffer()).toEqual([victim]);
  });

  it("Sizzling Soloist: the first resolution alone asks no attack", () => {
    const { game, a } = table();
    spawn(game, "Sizzling Soloist");
    const victim = spawn(game, "Grizzly Bears", B);
    pickTargets(a, victim);
    enter(game, "Hill Giant");
    game.advanceUntil((s) => s.awaiting?.kind === "attackers" && s.awaiting.player === B);
    const offer = game.legalActions(B).find((o) => o.kind === "declare-attackers");
    expect(offer !== undefined && offer.kind === "declare-attackers" ? offer.mustAttack : ["none"]).toEqual([]);
  });

  it("Yggdrasil: exiles creature cards and the top three with it; {4}, {T} puts one onto the battlefield with haste", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const shock = toGraveyard(game, "Shock");
    const tree = enter(game, "Yggdrasil, Rebirth Engine");
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, shock)).toBe("graveyard");
    const giant = toLibrary(game, "Hill Giant");
    activate(game, tree, 0, {});
    expect(zone(game, giant)).toBe("exile");
    game.state.objects[tree].tapped = false;
    lands(game, "Wastes", 4);
    activate(game, tree, 1, {});
    const back = [bears, giant].filter((id) => zone(game, id) === "battlefield");
    expect(back.length).toBe(1);
    expect(keywords(game, back[0]).has("haste")).toBe(true);
  });

  it("Ashcloud Phoenix: back face down, up for its morph cost for 2 to each player; dead face down, it stays dead", () => {
    const { game } = table();
    const phoenix = spawn(game, "Ashcloud Phoenix");
    destroy(game, phoenix);
    expect(zone(game, phoenix)).toBe("battlefield");
    expect(pt(game, phoenix)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, phoenix).has("flying")).toBe(false);
    lands(game, "Mountain", 6);
    game.dispatch({ type: "turn-face-up", player: A, permanent: phoenix, morph: true } as Action);
    settle(game);
    expect(pt(game, phoenix)).toEqual({ power: 4, toughness: 1 });
    expect(life(game)).toBe(18);
    expect(life(game, B)).toBe(18);

    const two = table();
    const p2 = spawn(two.game, "Ashcloud Phoenix");
    destroy(two.game, p2);
    destroy(two.game, p2);
    expect(zone(two.game, p2)).toBe("graveyard");
  });

  it("Dementia Sliver: every Sliver can name a card; the revealed card is discarded only on a match", () => {
    const { game, a } = table({ openingHandSize: 0 });
    const sliver = spawn(game, "Dementia Sliver");
    const secret = toHand(game, "Shock", B);
    a.chooseCardNameFn = () => "Divination";
    activate(game, sliver, 0, { targets: [ref(B)] });
    expect(zone(game, secret)).toBe("hand");
    game.state.objects[sliver].tapped = false;
    a.chooseCardNameFn = () => "Shock";
    activate(game, sliver, 0, { targets: [ref(B)] });
    expect(zone(game, secret)).toBe("graveyard");
  });

  it("Friendly Fire: the creature's controller reveals; the mana value goes to the creature and that player", () => {
    const { game } = table({ openingHandSize: 0 });
    lands(game, "Mountain", 4);
    const maw = spawn(game, "Colossal Dreadmaw", B);
    toHand(game, "Air Elemental", B);
    cast(game, toHand(game, "Friendly Fire"), { targets: [ref(maw)] });
    expect(damage(game, maw)).toBe(5);
    expect(life(game, B)).toBe(15);
    expect(life(game)).toBe(20);
  });
});
