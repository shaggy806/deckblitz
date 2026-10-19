/**
 * Dominaria United, group c. One test (or two) per card, on its riskiest
 * clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { LegalAction } from "../actions.js";
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
  tokensNamed,
  zone,
} from "./harness.js";

type CastNowOffer = Extract<LegalAction, { kind: "cast-now" }>;

const library = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;

/** Cast the Saga `card` for alice, answering its read-ahead choice with `chapter`. */
function castSaga(game: Game, a: ScriptedController, card: ObjectId, chapter: string, before?: () => void): void {
  a.chooseCreatureTypeFn = () => chapter;
  game.dispatch({ type: "cast-spell", player: A, card, targets: [] });
  before?.();
  settle(game);
}

describe("Briar Hydra", () => {
  it("puts X +1/+1 counters on target creature you control, X its domain count", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 2);
    lands(game, "Forest", 1);
    const hydra = spawn(game, "Briar Hydra");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    attack(game, a, [hydra]);
    expect(life(game, B)).toBe(14);
    expect(counters(game, bears)).toBe(3);
    expect(keywords(game, hydra).has("trample")).toBe(true);
  });
});

describe("Raff, Weatherlight Stalwart", () => {
  it("taps two untapped creatures you control to draw a card", () => {
    const { game, a } = table();
    const raff = spawn(game, "Raff, Weatherlight Stalwart");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 1);
    pickModes(a, 0);
    const chose = pickPermanents(a, raff, bears);
    const bolt = toHand(game, "Lightning Bolt");
    const before = hand(game).length;
    cast(game, bolt, { targets: [ref(B)] });
    expect(chose.offered).toEqual(expect.arrayContaining([raff, bears]));
    expect(tapped(game, raff)).toBe(true);
    expect(tapped(game, bears)).toBe(true);
    expect(hand(game).length).toBe(before);
  });

  it("isn't offered with only one untapped creature", () => {
    const { game, a } = table();
    spawn(game, "Raff, Weatherlight Stalwart");
    spawn(game, "Grizzly Bears", A, { tapped: true });
    lands(game, "Mountain", 1);
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    const bolt = toHand(game, "Lightning Bolt");
    const before = hand(game).length;
    cast(game, bolt, { targets: [ref(B)] });
    expect(asked).toBe(0);
    expect(hand(game).length).toBe(before - 1);
  });

  it("{3}{W}{W}: creatures you control get +1/+1 and gain vigilance", () => {
    const { game } = table();
    const raff = spawn(game, "Raff, Weatherlight Stalwart");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 5);
    activate(game, raff, 0);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("vigilance")).toBe(true);
    expect(pt(game, raff)).toEqual({ power: 2, toughness: 4 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Academy Wall", () => {
  it("loots on an instant, but only once each turn", () => {
    const { game, a } = table();
    spawn(game, "Academy Wall");
    lands(game, "Mountain", 2);
    pickModes(a, 0);
    const deck = library(game).length;
    const first = toHand(game, "Lightning Bolt");
    const second = toHand(game, "Lightning Bolt");
    const before = hand(game).length;
    cast(game, first, { targets: [ref(B)] });
    expect(library(game).length).toBe(deck - 1);
    expect(hand(game).length).toBe(before - 1);
    cast(game, second, { targets: [ref(B)] });
    expect(library(game).length).toBe(deck - 1);
    expect(life(game, B)).toBe(14);
  });
});

describe("Urborg Repossession", () => {
  it("unkicked: returns a creature card and gains 2 life", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const ring = toGraveyard(game, "Sol Ring");
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Urborg Repossession"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, ring)).toBe("graveyard");
    expect(life(game, A)).toBe(22);
  });

  it("kicked: also returns another target permanent card", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const ring = toGraveyard(game, "Sol Ring");
    toGraveyard(game, "Lightning Bolt");
    lands(game, "Swamp", 1);
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Urborg Repossession"), { targets: [ref(bears), ref(ring)], kicked: true });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, ring)).toBe("hand");
    expect(life(game, A)).toBe(22);
  });

  it("kicked, can't name the same card twice, nor an instant as the permanent card", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const bolt = toGraveyard(game, "Lightning Bolt");
    lands(game, "Swamp", 1);
    lands(game, "Forest", 2);
    const card = toHand(game, "Urborg Repossession");
    const kicked = (second: ObjectId) =>
      game.canDispatch({
        type: "cast-spell",
        player: A,
        card,
        targets: [ref(bears), ref(second)],
        kicked: true,
      });
    expect(kicked(bears)).not.toBeNull();
    expect(kicked(bolt)).not.toBeNull();
  });
});

describe("Rulik Mons, Warren Chief", () => {
  it("puts a land from the top onto the battlefield tapped, and makes no Goblin", () => {
    const { game, a } = table();
    const forest = toLibrary(game, "Forest");
    const rulik = spawn(game, "Rulik Mons, Warren Chief");
    pickFromZone(a, forest);
    attack(game, a, [rulik]);
    expect(zone(game, forest)).toBe("battlefield");
    expect(tapped(game, forest)).toBe(true);
    expect(tokensNamed(game, "Goblin Token", A)).toBe(0);
  });

  it("makes a Goblin when the top card isn't a land", () => {
    const { game, a } = table();
    const bears = toLibrary(game, "Grizzly Bears");
    const rulik = spawn(game, "Rulik Mons, Warren Chief");
    attack(game, a, [rulik]);
    expect(library(game)[0]).toBe(bears);
    expect(tokensNamed(game, "Goblin Token", A)).toBe(1);
  });

  it("makes a Goblin when you leave a land on top (the ruling)", () => {
    const { game, a } = table();
    const forest = toLibrary(game, "Forest");
    const rulik = spawn(game, "Rulik Mons, Warren Chief");
    pickFromZone(a);
    attack(game, a, [rulik]);
    expect(library(game)[0]).toBe(forest);
    expect(tokensNamed(game, "Goblin Token", A)).toBe(1);
  });
});

describe("Floriferous Vinewall", () => {
  it("may take a land from the top six; the rest go to the bottom", () => {
    const { game, a } = table();
    const deck = library(game).length;
    for (const name of ["Grizzly Bears", "Forest", "Sol Ring", "Island", "Lightning Bolt", "Opt"]) toLibrary(game, name);
    // Top first: Opt, Lightning Bolt, Island, Sol Ring, Forest, Grizzly Bears.
    const top = library(game).slice(0, 6);
    const [, , island, , forest] = top;
    const seventh = library(game)[6];
    const seen = pickFromZone(a, forest);
    enter(game, "Floriferous Vinewall");
    expect(new Set(seen.offered)).toEqual(new Set([island, forest]));
    expect(zone(game, forest)).toBe("hand");
    expect(library(game)[0]).toBe(seventh);
    expect(library(game).length).toBe(deck + 5);
    expect(new Set(library(game).slice(-5))).toEqual(new Set(top.filter((id) => id !== forest)));
  });
});

describe("Founding the Third Path", () => {
  it("chapter I: casts an instant or sorcery with mana value 1 or 2 from hand for free", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const opt = toHand(game, "Opt");
    const divination = toHand(game, "Divination");
    const saga = toHand(game, "Founding the Third Path");
    let offer: CastNowOffer | undefined;
    a.chooseCastNowFn = (_view, offered) => {
      offer = offered;
      const way = offered.casts.find((c) => c.card === opt);
      return way === undefined
        ? null
        : { type: "cast-spell", player: A, card: opt, targets: [], via: way.via, ...(offered.free ? { free: true } : {}) };
    };
    castSaga(game, a, saga, "1");
    expect(offer!.cards).toContain(opt);
    expect(offer!.cards).not.toContain(divination);
    expect(zone(game, opt)).toBe("graveyard");
  });

  it("chapter II: target player mills four", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const saga = toHand(game, "Founding the Third Path");
    pickTargets(a, B);
    const deck = library(game, B).length;
    castSaga(game, a, saga, "2");
    expect(library(game, B).length).toBe(deck - 4);
    expect(graveyard(game, B).length).toBe(4);
  });

  it("chapter III: exiles an instant from your graveyard and casts a copy, paying its cost", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const bolt = toGraveyard(game, "Lightning Bolt");
    const saga = toHand(game, "Founding the Third Path");
    pickTargets(a, bolt);
    a.chooseCastNowFn = (_view, offered) => {
      const way = offered.casts[0];
      return way === undefined ? null : { type: "cast-spell", player: A, card: way.card, targets: [ref(B)], via: way.via };
    };
    castSaga(game, a, saga, "3", () => lands(game, "Mountain", 1));
    expect(zone(game, bolt)).toBe("exile");
    expect(life(game, B)).toBe(17);
    expect(zone(game, saga)).toBe("graveyard");
  });
});

describe("Colossal Growth", () => {
  it("unkicked: +3/+3 only", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Colossal Growth"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, bears).has("trample")).toBe(false);
  });

  it("kicked: instead +4/+4, trample and haste", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Colossal Growth"), { targets: [ref(bears)], kicked: true });
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(keywords(game, bears).has("haste")).toBe(true);
  });
});

describe("Goblin Picker", () => {
  it("{R}, {T}, discard a card: draw a card", () => {
    const { game, a } = table();
    const picker = spawn(game, "Goblin Picker");
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [bolt];
    const deck = library(game).length;
    activate(game, picker, 0);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(library(game).length).toBe(deck - 1);
    expect(tapped(game, picker)).toBe(true);
  });
});

describe("Cosmic Epiphany", () => {
  it("draws one per instant and sorcery card in your graveyard, not counting itself", () => {
    const { game } = table();
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Divination");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Opt", B);
    lands(game, "Island", 6);
    const deck = library(game).length;
    const epiphany = toHand(game, "Cosmic Epiphany");
    cast(game, epiphany);
    expect(library(game).length).toBe(deck - 2);
    expect(zone(game, epiphany)).toBe("graveyard");
  });
});

describe("Evolved Sleeper", () => {
  it("climbs Human Cleric 2/2 → Phyrexian 3/3 with deathtouch → card draw, and back to 2/2", () => {
    const { game } = table();
    const sleeper = spawn(game, "Evolved Sleeper");
    lands(game, "Swamp", 12);
    // Not a Cleric yet: the second ability does nothing as it resolves.
    activate(game, sleeper, 1);
    expect(counters(game, sleeper, "deathtouch")).toBe(0);
    expect(pt(game, sleeper)).toEqual({ power: 1, toughness: 1 });

    activate(game, sleeper, 0);
    expect(pt(game, sleeper)).toEqual({ power: 2, toughness: 2 });
    expect([...subtypes(game, sleeper)].sort()).toEqual(["Cleric", "Human"]);

    activate(game, sleeper, 1);
    expect(pt(game, sleeper)).toEqual({ power: 3, toughness: 3 });
    expect([...subtypes(game, sleeper)].sort()).toEqual(["Cleric", "Human", "Phyrexian"]);
    expect(keywords(game, sleeper).has("deathtouch")).toBe(true);

    const deck = library(game).length;
    activate(game, sleeper, 2);
    expect(pt(game, sleeper)).toEqual({ power: 4, toughness: 4 });
    expect(library(game).length).toBe(deck - 1);
    expect(life(game, A)).toBe(19);

    // The first ability again: a 2/2 Human Cleric, its counter still on (the ruling).
    activate(game, sleeper, 0);
    expect(pt(game, sleeper)).toEqual({ power: 3, toughness: 3 });
    expect([...subtypes(game, sleeper)].sort()).toEqual(["Cleric", "Human"]);
  });

  it("the third ability does nothing unless it's a Phyrexian", () => {
    const { game } = table();
    const sleeper = spawn(game, "Evolved Sleeper");
    lands(game, "Swamp", 3);
    const deck = library(game).length;
    activate(game, sleeper, 2);
    expect(counters(game, sleeper)).toBe(0);
    expect(library(game).length).toBe(deck);
    expect(life(game, A)).toBe(20);
  });
});

describe("Writhing Necromass", () => {
  it("costs {1} less for each creature card in your graveyard", () => {
    const { game } = table();
    for (let i = 0; i < 3; i++) toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears", B);
    lands(game, "Swamp", 4);
    const necromass = toHand(game, "Writhing Necromass");
    cast(game, necromass);
    expect(zone(game, necromass)).toBe("battlefield");
  });

  it("isn't castable for less than it reduces to", () => {
    const { game } = table();
    for (let i = 0; i < 3; i++) toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    const necromass = toHand(game, "Writhing Necromass");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: necromass, targets: [] })).not.toBeNull();
  });
});

describe("Molten Monstrosity", () => {
  it("costs {X} less, X the greatest power among creatures you control", () => {
    const { game } = table();
    spawn(game, "Shivan Dragon");
    spawn(game, "Grizzly Bears");
    spawn(game, "Craw Wurm", B);
    lands(game, "Mountain", 3);
    const monstrosity = toHand(game, "Molten Monstrosity");
    cast(game, monstrosity);
    expect(zone(game, monstrosity)).toBe("battlefield");
  });

  it("an opponent's bigger creature doesn't count", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Shivan Dragon", B);
    lands(game, "Mountain", 5);
    const monstrosity = toHand(game, "Molten Monstrosity");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: monstrosity, targets: [] })).not.toBeNull();
  });
});

describe("Prayer of Binding", () => {
  it("exiles an opponent's nonland permanent until it leaves, and gains 2 life", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    pickTargets(a, theirs);
    const prayer = enter(game, "Prayer of Binding");
    expect(zone(game, theirs)).toBe("exile");
    expect(life(game, A)).toBe(22);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(prayer)]);
    settle(game);
    expect(named(game, "Grizzly Bears", B).length).toBe(1);
  });

  it("with no target chosen, still gains the life", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears", B);
    pickTargets(a, null);
    enter(game, "Prayer of Binding");
    expect(life(game, A)).toBe(22);
  });
});

describe("Benalish Sleeper", () => {
  it("kicked: each player sacrifices a creature", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    lands(game, "Swamp", 1);
    const sleeper = toHand(game, "Benalish Sleeper");
    cast(game, sleeper, { kicked: true });
    expect(zone(game, theirs)).toBe("graveyard");
    // Alice's only creature was the Sleeper itself (the ruling).
    expect(zone(game, sleeper)).toBe("graveyard");
  });

  it("unkicked: nobody sacrifices", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 2);
    const sleeper = toHand(game, "Benalish Sleeper");
    cast(game, sleeper);
    expect(zone(game, theirs)).toBe("battlefield");
    expect(zone(game, sleeper)).toBe("battlefield");
  });
});

describe("Coral Colony", () => {
  it("target player mills one card for each creature you control with defender", () => {
    const { game, a } = table();
    const colony = spawn(game, "Coral Colony");
    spawn(game, "Academy Wall");
    spawn(game, "Grizzly Bears");
    spawn(game, "Academy Wall", B);
    lands(game, "Island", 2);
    pickTargets(a, B);
    activate(game, colony, 0, { targets: [ref(B)] });
    expect(graveyard(game, B).length).toBe(2);
  });
});

describe("Slimefoot's Survey", () => {
  it("fetches two lands with basic land types, then looks at the top X with X counted after", () => {
    const { game, a } = table();
    lands(game, "Forest", 5);
    const island = toLibrary(game, "Island");
    const pool = toLibrary(game, "Breeding Pool");
    const swamp = toLibrary(game, "Swamp");
    for (const name of ["Opt", "Lightning Bolt", "Sol Ring", "Grizzly Bears"]) toLibrary(game, name);
    const calls: (readonly ObjectId[])[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      calls.push(eligible);
      if (calls.length === 1) return [island, pool];
      return [eligible[eligible.length - 1]];
    };
    cast(game, toHand(game, "Slimefoot's Survey"));
    expect(new Set(calls[0])).toEqual(new Set([island, pool, swamp]));
    expect(zone(game, island)).toBe("battlefield");
    expect(zone(game, pool)).toBe("battlefield");
    expect(tapped(game, island)).toBe(true);
    expect(tapped(game, pool)).toBe(true);
    // Forest and Island (Breeding Pool is a Forest Island too): X is 2, read
    // after the lands entered.
    expect(calls.length).toBe(2);
    expect(calls[1].length).toBe(2);
    expect(library(game)[0]).toBe(calls[1][1]);
  });
});

describe("Eerie Soultender", () => {
  it("mills three as it enters", () => {
    const { game } = table();
    enter(game, "Eerie Soultender");
    expect(graveyard(game).length).toBe(3);
  });

  it("exiles itself from the graveyard to return another creature card", () => {
    const { game } = table();
    const soultender = toGraveyard(game, "Eerie Soultender");
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Swamp", 5);
    activate(game, soultender, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, soultender)).toBe("exile");
  });
});

describe("Samite Herbalist", () => {
  it("gains 1 life and scries 1 when it becomes tapped", () => {
    const { game, a } = table();
    const herbalist = spawn(game, "Samite Herbalist");
    let scried = 0;
    a.chooseScryFn = (_view, cards) => {
      scried += cards.length;
      return [];
    };
    attack(game, a, [herbalist]);
    expect(life(game, A)).toBe(21);
    expect(scried).toBe(1);
  });
});

describe("Phyrexian Missionary", () => {
  it("kicked: returns a creature card from your graveyard to your hand", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    lands(game, "Swamp", 2);
    pickTargets(a, bears);
    const missionary = toHand(game, "Phyrexian Missionary");
    cast(game, missionary, { kicked: true });
    expect(zone(game, bears)).toBe("hand");
    expect(keywords(game, missionary).has("lifelink")).toBe(true);
  });

  it("unkicked: no return", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    pickTargets(a, bears);
    cast(game, toHand(game, "Phyrexian Missionary"));
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Runic Shot", () => {
  it("destroys a tapped creature, and can't target an untapped one", () => {
    const { game } = table();
    const tappedBears = spawn(game, "Grizzly Bears", B, { tapped: true });
    const untapped = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    const shot = toHand(game, "Runic Shot");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: shot, targets: [ref(untapped)] })).not.toBeNull();
    cast(game, shot, { targets: [ref(tappedBears)] });
    expect(zone(game, tappedBears)).toBe("graveyard");
  });

  it("kicked: scry 2 as well", () => {
    const { game, a } = table();
    const tappedBears = spawn(game, "Grizzly Bears", B, { tapped: true });
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    let scried = 0;
    a.chooseScryFn = (_view, cards) => {
      scried += cards.length;
      return [];
    };
    cast(game, toHand(game, "Runic Shot"), { targets: [ref(tappedBears)], kicked: true });
    expect(zone(game, tappedBears)).toBe("graveyard");
    expect(scried).toBe(2);
  });
});
