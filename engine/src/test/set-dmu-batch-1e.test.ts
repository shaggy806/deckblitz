/**
 * Dominaria United, group e. One test (or two) per card, on its riskiest
 * clause — most of them a kicker rider, checked kicked and not — and the
 * edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  activate,
  cast,
  counters,
  destroy,
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
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  nextTurn,
  zone,
} from "./harness.js";

const library = (game: Game, player = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;

const castable = (game: Game, card: ObjectId, kicked = false): boolean =>
  game
    .legalActions(A)
    .some((x) => x.kind === "cast-spell" && x.card === card && (x.kicked === true) === kicked);

describe("Phyrexian Espionage", () => {
  it("unkicked: draws two, no discard", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const theirs = hand(game, B).length;
    const before = hand(game).length;
    cast(game, toHand(game, "Phyrexian Espionage"));
    expect(hand(game).length).toBe(before + 2);
    expect(hand(game, B).length).toBe(theirs);
  });

  it("kicked: draws two and each opponent discards a card", () => {
    const { game } = table({ players: 3 });
    lands(game, "Island", 3);
    lands(game, "Swamp", 2);
    const bobs = hand(game, B).length;
    const carols = hand(game, C).length;
    const before = hand(game).length;
    cast(game, toHand(game, "Phyrexian Espionage"), { kicked: true });
    expect(hand(game).length).toBe(before + 2);
    expect(hand(game, B).length).toBe(bobs - 1);
    expect(hand(game, C).length).toBe(carols - 1);
  });
});

describe("Argivian Phalanx", () => {
  it("costs {1} less for each creature you control, never below {W}", () => {
    const { game } = table();
    for (let i = 0; i < 6; i++) spawn(game, "Grizzly Bears");
    const phalanx = toHand(game, "Argivian Phalanx");
    expect(castable(game, phalanx)).toBe(false);
    lands(game, "Plains", 1);
    cast(game, phalanx);
    expect(zone(game, phalanx)).toBe("battlefield");
    expect(keywords(game, phalanx).has("vigilance")).toBe(true);
  });

  it("with three creatures it costs {2}{W}", () => {
    const { game } = table();
    for (let i = 0; i < 3; i++) spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    const phalanx = toHand(game, "Argivian Phalanx");
    expect(castable(game, phalanx)).toBe(false);
    lands(game, "Plains", 1);
    expect(castable(game, phalanx)).toBe(true);
  });
});

describe("Vineshaper Prodigy", () => {
  it("kicked: one of the top three into hand, the rest on the bottom", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    lands(game, "Island", 2);
    const c1 = toLibrary(game, "Island");
    const c2 = toLibrary(game, "Grizzly Bears");
    const c3 = toLibrary(game, "Island");
    a.chooseFromZoneFn = (_view, eligible, min) => (eligible.includes(c2) && min <= 1 ? [c2] : eligible.slice(0, min));
    cast(game, toHand(game, "Vineshaper Prodigy"), { kicked: true });
    expect(zone(game, c2)).toBe("hand");
    const lib = library(game);
    expect(lib.slice(-2).sort()).toEqual([c1, c3].sort());
  });

  it("unkicked: no look", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const top = toLibrary(game, "Grizzly Bears");
    cast(game, toHand(game, "Vineshaper Prodigy"));
    expect(library(game)[0]).toBe(top);
  });
});

describe("Join Forces", () => {
  it("untaps up to two creatures, each +2/+2", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const x = spawn(game, "Grizzly Bears", A, { tapped: true });
    const y = spawn(game, "Llanowar Elves", A, { tapped: true });
    cast(game, toHand(game, "Join Forces"), { targets: [ref(x), ref(y)] });
    expect(game.state.objects[x].tapped).toBe(false);
    expect(game.state.objects[y].tapped).toBe(false);
    expect(pt(game, x)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, y)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Heroic Charge", () => {
  it("unkicked: +2/+1, no trample", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Heroic Charge"));
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, bears).has("trample")).toBe(false);
  });

  it("kicked: those creatures also gain trample; an opponent's don't", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Heroic Charge"), { kicked: true });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, bears).has("trample")).toBe(true);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, theirs).has("trample")).toBe(false);
  });
});

describe("Strength of the Coalition", () => {
  it("kicked: the target gets +2/+2 and a counter, and so does each other creature you control", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Strength of the Coalition"), { targets: [ref(bears)], kicked: true });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(counters(game, elves)).toBe(1);
    expect(counters(game, theirs)).toBe(0);
  });

  it("unkicked: only the pump", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    cast(game, toHand(game, "Strength of the Coalition"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(counters(game, elves)).toBe(0);
  });
});

describe("Viashino Branchrider", () => {
  it("kicked: enters with two +1/+1 counters", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    lands(game, "Forest", 3);
    const lizard = toHand(game, "Viashino Branchrider");
    cast(game, lizard, { kicked: true });
    expect(counters(game, lizard)).toBe(2);
    expect(pt(game, lizard)).toEqual({ power: 3, toughness: 3 });
  });

  it("unkicked, or put onto the battlefield without casting it: no counters", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const lizard = toHand(game, "Viashino Branchrider");
    cast(game, lizard);
    expect(counters(game, lizard)).toBe(0);
    const other = spawn(game, "Viashino Branchrider");
    expect(counters(game, other)).toBe(0);
    activate(game, lizard, 0);
    expect(pt(game, lizard)).toEqual({ power: 3, toughness: 1 });
  });
});

describe("Shalai's Acolyte", () => {
  it("kicked: enters with two +1/+1 counters; unkicked: none", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    lands(game, "Forest", 2);
    const kicked = toHand(game, "Shalai's Acolyte");
    cast(game, kicked, { kicked: true });
    expect(pt(game, kicked)).toEqual({ power: 5, toughness: 6 });
    lands(game, "Plains", 5);
    const plain = toHand(game, "Shalai's Acolyte");
    cast(game, plain);
    expect(counters(game, plain)).toBe(0);
  });
});

describe("Haunting Figment", () => {
  it("can't be blocked once you've cast an instant or sorcery this turn", () => {
    const { game } = table();
    const figment = spawn(game, "Haunting Figment");
    expect(keywords(game, figment).has("unblockable")).toBe(false);
    spawn(game, "Grizzly Bears");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
    expect(keywords(game, figment).has("unblockable")).toBe(true);
    nextTurn(game);
    expect(keywords(game, figment).has("unblockable")).toBe(false);
  });

  it("a creature spell doesn't count", () => {
    const { game } = table();
    const figment = spawn(game, "Haunting Figment");
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Llanowar Elves"));
    expect(keywords(game, figment).has("unblockable")).toBe(false);
  });
});

describe("Balduvian Atrocity", () => {
  it("kicked: returns a creature card with mana value 3 or less, with haste, sacrificed at the end step", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 1);
    const bears = toGraveyard(game, "Grizzly Bears");
    const ogre = toGraveyard(game, "Gray Ogre");
    const angel = toGraveyard(game, "Serra Angel");
    let offered: readonly ObjectId[] = [];
    a.chooseTargetsFn = (_view, _source, _specs, legal) => {
      offered = legal[0].map((t) => (t.kind === "object" ? t.object : (t.player as unknown as ObjectId)));
      return [ref(bears)];
    };
    cast(game, toHand(game, "Balduvian Atrocity"), { kicked: true });
    expect([...offered].sort()).toEqual([bears, ogre].sort());
    expect(zone(game, angel)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(keywords(game, bears).has("haste")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("unkicked: nothing returns", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = toGraveyard(game, "Grizzly Bears");
    const atrocity = toHand(game, "Balduvian Atrocity");
    cast(game, atrocity);
    expect(zone(game, bears)).toBe("graveyard");
    expect(keywords(game, atrocity).has("menace")).toBe(true);
  });
});

describe("Djinn of the Fountain", () => {
  it("blink mode: exiles it, back at the beginning of the next end step", () => {
    const { game, a } = table();
    spawn(game, "Djinn of the Fountain");
    lands(game, "Mountain", 1);
    pickModes(a, 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(named(game, "Djinn of the Fountain", A).length).toBe(0);
    expect(life(game, B)).toBe(17);
    toStep(game, "end");
    settle(game);
    expect(named(game, "Djinn of the Fountain", A).length).toBe(1);
  });

  it("pump mode: +1/+1 until end of turn", () => {
    const { game, a } = table();
    const djinn = spawn(game, "Djinn of the Fountain");
    lands(game, "Mountain", 1);
    pickModes(a, 0);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(pt(game, djinn)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Aggressive Sabotage", () => {
  it("kicked: discards two and takes 3 damage", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 1);
    const theirs = hand(game, B).length;
    cast(game, toHand(game, "Aggressive Sabotage"), { targets: [ref(B)], kicked: true });
    expect(hand(game, B).length).toBe(theirs - 2);
    expect(life(game, B)).toBe(17);
  });

  it("unkicked: only the discard", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const theirs = hand(game, B).length;
    cast(game, toHand(game, "Aggressive Sabotage"), { targets: [ref(B)] });
    expect(hand(game, B).length).toBe(theirs - 2);
    expect(life(game, B)).toBe(20);
  });
});

describe("Tolarian Geyser", () => {
  it("kicked: bounce, draw, gain 3", () => {
    const { game } = table();
    lands(game, "Island", 3);
    lands(game, "Plains", 1);
    const theirs = spawn(game, "Grizzly Bears", B);
    const before = hand(game).length;
    cast(game, toHand(game, "Tolarian Geyser"), { targets: [ref(theirs)], kicked: true });
    expect(zone(game, theirs)).toBe("hand");
    expect(hand(game).length).toBe(before + 1);
    expect(life(game)).toBe(23);
  });

  it("unkicked: no life", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Tolarian Geyser"), { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("hand");
    expect(life(game)).toBe(20);
  });
});

describe("Choking Miasma", () => {
  it("kicked: the chosen creature gets its counter first, and survives the -2/-2", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    const theirs = spawn(game, "Grizzly Bears", B);
    const seen = pickPermanents(a, bears);
    cast(game, toHand(game, "Choking Miasma"), { kicked: true });
    expect([...seen.offered].sort()).toEqual([bears, elves].sort());
    expect(zone(game, bears)).toBe("battlefield");
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("unkicked: every creature gets -2/-2", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Choking Miasma"));
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Ghitu Amplifier", () => {
  it("kicked: bounces a creature an opponent controls; instants pump it", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    lands(game, "Island", 3);
    const theirs = spawn(game, "Grizzly Bears", B);
    spawn(game, "Llanowar Elves", B);
    pickTargets(a, theirs);
    const amp = toHand(game, "Ghitu Amplifier");
    cast(game, amp, { kicked: true });
    expect(zone(game, theirs)).toBe("hand");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(pt(game, amp)).toEqual({ power: 3, toughness: 2 });
  });

  it("unkicked: no bounce", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Ghitu Amplifier"));
    expect(zone(game, theirs)).toBe("battlefield");
  });
});

describe("Artillery Blast", () => {
  it("deals 1 plus domain to a tapped creature, and can't target an untapped one", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    const untapped = spawn(game, "Serra Angel", B);
    const tapped = spawn(game, "Serra Angel", B, { tapped: true });
    const blast = toHand(game, "Artillery Blast");
    expect(() => cast(game, blast, { targets: [ref(untapped)] })).toThrow();
    cast(game, blast, { targets: [ref(tapped)] });
    expect(zone(game, tapped)).toBe("graveyard");
  });

  it("with one basic land type it deals 2", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const ogre = spawn(game, "Hill Giant", B, { tapped: true });
    cast(game, toHand(game, "Artillery Blast"), { targets: [ref(ogre)] });
    expect(zone(game, ogre)).toBe("battlefield");
    expect(game.state.objects[ogre].damageMarked).toBe(2);
  });
});

describe("Cleaving Skyrider", () => {
  it("kicked, flashed in during combat: X is the number of attacking creatures", () => {
    const { game, a } = table();
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 3);
    lands(game, "Mountain", 3);
    a.declareAttackersFn = () => [x, y].map((attacker) => ({ attacker, defender: B }));
    toStep(game, "declare-blockers");
    pickTargets(a, B);
    cast(game, toHand(game, "Cleaving Skyrider"), { kicked: true });
    expect(life(game, B)).toBe(18);
  });

  it("unkicked: no damage", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Cleaving Skyrider"));
    expect(life(game, B)).toBe(20);
  });
});

describe("Keldon Strike Team", () => {
  it("kicked: two Soldiers; creatures you control have haste only the turn it entered", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    lands(game, "Plains", 2);
    const old = spawn(game, "Grizzly Bears", A, { sick: true });
    const team = toHand(game, "Keldon Strike Team");
    cast(game, team, { kicked: true });
    expect(tokensNamed(game, "Soldier Token", A)).toBe(2);
    const soldier = named(game, "Soldier Token", A)[0];
    expect(keywords(game, soldier).has("haste")).toBe(true);
    expect(keywords(game, old).has("haste")).toBe(true);
    expect(keywords(game, team).has("haste")).toBe(true);
    nextTurn(game);
    expect(keywords(game, team).has("haste")).toBe(false);
    expect(keywords(game, old).has("haste")).toBe(false);
  });

  it("unkicked: no Soldiers", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Keldon Strike Team"));
    expect(tokensNamed(game, "Soldier Token", A)).toBe(0);
  });
});

describe("Talas Lookout", () => {
  it("dies: one of the top two into hand, the other into the graveyard", () => {
    const { game, a } = table();
    const lookout = spawn(game, "Talas Lookout");
    const island = toLibrary(game, "Island");
    const bears = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, bears);
    destroy(game, lookout);
    expect([...seen.offered].sort()).toEqual([island, bears].sort());
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, island)).toBe("graveyard");
  });
});

describe("Battlewing Mystic", () => {
  it("kicked: discard your hand, then draw two", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 1);
    const x = toHand(game, "Grizzly Bears");
    const y = toHand(game, "Gray Ogre");
    const mystic = toHand(game, "Battlewing Mystic");
    const others = hand(game).filter((id) => id !== mystic).length;
    cast(game, mystic, { kicked: true });
    expect(zone(game, x)).toBe("graveyard");
    expect(zone(game, y)).toBe("graveyard");
    expect(hand(game).length).toBe(2);
    expect(graveyard(game).length).toBe(others);
  });

  it("unkicked: keeps the hand", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const x = toHand(game, "Grizzly Bears");
    cast(game, toHand(game, "Battlewing Mystic"));
    expect(zone(game, x)).toBe("hand");
  });
});

describe("Tribute to Urborg", () => {
  it("kicked: an additional -1/-1 for each instant and sorcery card in your graveyard", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Island", 2);
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Divination");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Opt", B);
    const wurm = spawn(game, "Craw Wurm", B);
    game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 }, [ref(wurm)]);
    settle(game);
    cast(game, toHand(game, "Tribute to Urborg"), { targets: [ref(wurm)], kicked: true });
    expect(pt(game, wurm)).toEqual({ power: 5, toughness: 3 });
  });

  it("unkicked: -2/-2 only", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    toGraveyard(game, "Lightning Bolt");
    const wurm = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Tribute to Urborg"), { targets: [ref(wurm)] });
    expect(pt(game, wurm)).toEqual({ power: 4, toughness: 2 });
  });
});

describe("Voda Sea Scavenger", () => {
  it("looks at the top X (domain), may keep one on top, the rest to the bottom", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    const deep = toLibrary(game, "Gray Ogre");
    const c1 = toLibrary(game, "Island");
    const c2 = toLibrary(game, "Grizzly Bears");
    const c3 = toLibrary(game, "Island");
    const seen = pickFromZone(a, c2);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Voda Sea Scavenger"));
    expect([...seen.offered].sort()).toEqual([c1, c2, c3].sort());
    const lib = library(game);
    expect(lib[0]).toBe(c2);
    expect(lib[1]).toBe(deep);
    expect(lib.slice(-2).sort()).toEqual([c1, c3].sort());
  });

  it("may put none back: all of them go to the bottom", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const c1 = toLibrary(game, "Grizzly Bears");
    pickFromZone(a);
    cast(game, toHand(game, "Voda Sea Scavenger"));
    expect(library(game).at(-1)).toBe(c1);
  });
});

describe("Phyrexian Warhorse", () => {
  it("kicked: a Soldier; sacrificing another creature pumps it", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    lands(game, "Plains", 1);
    const horse = toHand(game, "Phyrexian Warhorse");
    cast(game, horse, { kicked: true });
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
    lands(game, "Swamp", 1);
    const soldier = named(game, "Soldier Token", A)[0];
    game.dispatch({ type: "activate-ability", player: A, source: horse, abilityIndex: 0, targets: [], sacrifice: soldier });
    settle(game);
    expect(tokensNamed(game, "Soldier Token", A)).toBe(0);
    expect(zone(game, horse)).toBe("battlefield");
    expect(pt(game, horse)).toEqual({ power: 5, toughness: 4 });
  });

  it("can't sacrifice itself", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const horse = spawn(game, "Phyrexian Warhorse");
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: horse, abilityIndex: 0, targets: [], sacrifice: horse }),
    ).not.toBeNull();
    expect(zone(game, horse)).toBe("battlefield");
  });
});

describe("Sunbathing Rootwalla", () => {
  it("+1/+1 for each basic land type, once each turn", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Plains", 1);
    const walla = spawn(game, "Sunbathing Rootwalla");
    activate(game, walla, 0);
    expect(pt(game, walla)).toEqual({ power: 6, toughness: 6 });
    expect(() => activate(game, walla, 0)).toThrow();
  });
});

describe("Juniper Order Rootweaver", () => {
  it("kicked: a +1/+1 counter on target creature you control", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    const druid = toHand(game, "Juniper Order Rootweaver");
    cast(game, druid, { kicked: true });
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, druid)).toBe(0);
  });

  it("unkicked: no counter", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Juniper Order Rootweaver"));
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Bog Badger", () => {
  it("kicked: creatures you control gain menace until end of turn", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const badger = toHand(game, "Bog Badger");
    cast(game, badger, { kicked: true });
    expect(keywords(game, bears).has("menace")).toBe(true);
    expect(keywords(game, badger).has("menace")).toBe(true);
    expect(keywords(game, theirs).has("menace")).toBe(false);
    nextTurn(game);
    expect(keywords(game, bears).has("menace")).toBe(false);
  });

  it("unkicked: no menace", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Bog Badger"));
    expect(keywords(game, bears).has("menace")).toBe(false);
  });
});
