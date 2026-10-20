/**
 * Innistrad: Crimson Vow, group a. One test (or two) per card, on its
 * riskiest clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { printedCardName } from "../state.js";

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
  loyalty,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toExile,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
const exile = (game: Game): readonly ObjectId[] => game.state.zones.shared.exile;

/** `source` (a real permanent) deals `amount` damage to `target`. */
const damage = (game: Game, source: ObjectId, target: ObjectId, amount: number): void => {
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount, target: 0 }, [ref(target)], {
    source,
  });
  settle(game);
};

describe("Ill-Tempered Loner // Howlpack Avenger", () => {
  it("the front deals the damage it's dealt to any target, even when that damage kills it", () => {
    const { game, a } = table();
    const loner = spawn(game, "Ill-Tempered Loner");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, B);
    damage(game, giant, loner, 3);
    expect(zone(game, loner)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });

  it("the back face answers damage to any permanent you control, itself included", () => {
    const { game, a } = table();
    game.state.dayNight = "night";
    const wolf = enter(game, "Ill-Tempered Loner");
    expect(printedCardName(game.state.objects[wolf])).toBe("Howlpack Avenger");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, B);
    damage(game, giant, bears, 1);
    expect(life(game, B)).toBe(19);
    damage(game, giant, wolf, 2);
    expect(life(game, B)).toBe(17);
  });

  it("{1}{R} pumps +2/+0", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const loner = spawn(game, "Ill-Tempered Loner");
    activate(game, loner, 0);
    expect(pt(game, loner)).toEqual({ power: 5, toughness: 3 });
  });
});

describe("Sorin the Mirthless", () => {
  it("+1 takes the top card for life equal to its mana value", () => {
    const { game, a } = table();
    const sorin = spawn(game, "Sorin the Mirthless");
    const giant = toLibrary(game, "Hill Giant");
    pickFromZone(a, giant);
    loyalty(game, sorin, 1);
    expect(zone(game, giant)).toBe("hand");
    expect(life(game, A)).toBe(16);
    expect(counters(game, sorin, "loyalty")).toBe(5);
  });

  it("+1 declined leaves the card on top and costs no life", () => {
    const { game, a } = table();
    const sorin = spawn(game, "Sorin the Mirthless");
    const giant = toLibrary(game, "Hill Giant");
    pickFromZone(a);
    loyalty(game, sorin, 1);
    expect(library(game)[0]).toBe(giant);
    expect(life(game, A)).toBe(20);
  });

  it("−2 makes a 2/3 flying lifelink Vampire", () => {
    const { game } = table();
    const sorin = spawn(game, "Sorin the Mirthless");
    loyalty(game, sorin, -2);
    const [vampire] = named(game, "Vampire Token (Sorin the Mirthless)");
    expect(pt(game, vampire)).toEqual({ power: 2, toughness: 3 });
    expect([...keywords(game, vampire)].sort()).toEqual(["flying", "lifelink"]);
  });

  it("−7 deals 13 damage to any target and gains 13 life", () => {
    const { game } = table();
    const sorin = spawn(game, "Sorin the Mirthless");
    loyalty(game, sorin, -7, { atLeast: 7, targets: [ref(B)] });
    expect(life(game, B)).toBe(7);
    expect(life(game, A)).toBe(33);
  });
});

describe("By Invitation Only", () => {
  it("each player sacrifices the chosen number, or all they have if fewer", () => {
    const { game, a } = table();
    lands(game, "Plains", 5);
    const mine = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const theirs = spawn(game, "Hill Giant", B);
    pickModes(a, 2);
    cast(game, toHand(game, "By Invitation Only"));
    expect(mine.filter((id) => zone(game, id) === "graveyard")).toHaveLength(2);
    expect(zone(game, theirs)).toBe("graveyard");
  });

  it("choosing 0 sacrifices nothing; 13 is on offer", () => {
    const { game, a } = table();
    lands(game, "Plains", 5);
    const bears = spawn(game, "Grizzly Bears");
    let offered = 0;
    a.chooseModesFn = (_view, _min, _max, modes) => {
      offered = modes.length;
      return [0];
    };
    cast(game, toHand(game, "By Invitation Only"));
    expect(offered).toBe(14);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Dreadfeast Demon", () => {
  it("at your end step sacrifices a non-Demon creature to copy itself", () => {
    const { game } = table();
    const demon = spawn(game, "Dreadfeast Demon");
    const bears = spawn(game, "Grizzly Bears");
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, demon)).toBe("battlefield");
    expect(tokensNamed(game, "Dreadfeast Demon", A)).toBe(1);
  });

  it("with no non-Demon creature to sacrifice, makes no copy", () => {
    const { game } = table();
    spawn(game, "Dreadfeast Demon");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Dreadfeast Demon", A)).toBe(0);
  });
});

describe("Demonic Bargain", () => {
  it("exiles the top thirteen, then tutors a card from what's left", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const giant = toLibrary(game, "Hill Giant");
    const before = library(game).length;
    const wanted = library(game)[20];
    pickFromZone(a, wanted);
    cast(game, toHand(game, "Demonic Bargain"));
    expect(zone(game, giant)).toBe("exile");
    expect(exile(game)).toHaveLength(13);
    expect(zone(game, wanted)).toBe("hand");
    expect(library(game).length).toBe(before - 14);
  });
});

describe("Bloodcrazed Socialite", () => {
  it("makes a Blood token; attacking, sacrificing it gives +2/+2", () => {
    const { game, a } = table();
    const socialite = enter(game, "Bloodcrazed Socialite");
    expect(tokensNamed(game, "Blood Token", A)).toBe(1);
    pickModes(a, 0);
    attack(game, a, [socialite]);
    expect(tokensNamed(game, "Blood Token", A)).toBe(0);
    expect(life(game, B)).toBe(15);
  });

  it("declining keeps the Blood and the 3 power", () => {
    const { game, a } = table();
    const socialite = enter(game, "Bloodcrazed Socialite");
    pickModes(a);
    attack(game, a, [socialite]);
    expect(tokensNamed(game, "Blood Token", A)).toBe(1);
    expect(life(game, B)).toBe(17);
  });
});

describe("Concealing Curtains // Revealing Eye", () => {
  it("transforming makes the opponent discard a chosen nonland card, then draw", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const curtains = spawn(game, "Concealing Curtains");
    // Bob's opening hand is all Wastes: the Bolt is his only nonland card.
    const bolt = toHand(game, "Lightning Bolt", B);
    toHand(game, "Mountain", B);
    const before = hand(game, B).length;
    const seen = pickFromZone(a, bolt);
    activate(game, curtains, 0);
    expect(printedCardName(game.state.objects[curtains])).toBe("Revealing Eye");
    expect(seen.offered).toEqual([bolt]);
    expect(zone(game, bolt)).toBe("graveyard");
    expect(hand(game, B)).toHaveLength(before);
  });

  it("choosing nothing means no discard and no draw", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const curtains = spawn(game, "Concealing Curtains");
    toHand(game, "Lightning Bolt", B);
    const before = hand(game, B).length;
    pickFromZone(a);
    activate(game, curtains, 0);
    expect(hand(game, B)).toHaveLength(before);
    expect(graveyard(game, B)).toHaveLength(0);
  });
});

describe("Screaming Swarm", () => {
  it("attacking with two creatures mills the target player two", () => {
    const { game, a } = table();
    const swarm = spawn(game, "Screaming Swarm");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, B);
    attack(game, a, [swarm, bears]);
    expect(graveyard(game, B)).toHaveLength(2);
  });

  it("from the graveyard, {2}{U} puts it second from the top", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const swarm = toGraveyard(game, "Screaming Swarm");
    activate(game, swarm, 0);
    expect(zone(game, swarm)).toBe("library");
    expect(library(game).indexOf(swarm)).toBe(1);
  });
});

describe("Dreadlight Monstrosity", () => {
  it("can be made unblockable only while you own a card in exile", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const crab = spawn(game, "Dreadlight Monstrosity");
    toExile(game, "Grizzly Bears", B);
    expect(() => activate(game, crab, 0)).toThrow();
    toExile(game, "Grizzly Bears");
    activate(game, crab, 0);
    expect(keywords(game, crab).has("unblockable")).toBe(true);
  });

  it("a prepared spell's copy in exile isn't a card you own (rule 108.2)", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const crab = spawn(game, "Dreadlight Monstrosity");
    const year = spawn(game, "Studious First-Year");
    game.debugApplyEffect(A, { kind: "become-prepared", target: 0 }, [ref(year)]);
    expect(game.state.zones.shared.exile.some((id) => game.state.objects[id].isCopy === true)).toBe(true);
    expect(() => activate(game, crab, 0)).toThrow();
  });
});

describe("Markov Waltzer", () => {
  it("gives up to two creatures you control +1/+0 at the beginning of combat", () => {
    const { game, a } = table();
    const waltzer = spawn(game, "Markov Waltzer");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, waltzer, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, waltzer)).toEqual({ power: 2, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("Wandering Mind", () => {
  it("takes a noncreature, nonland card from the top six; the rest go to the bottom", () => {
    const { game, a } = table();
    const bolt = toLibrary(game, "Lightning Bolt");
    const giant = toLibrary(game, "Hill Giant");
    const seen = pickFromZone(a, bolt);
    enter(game, "Wandering Mind");
    expect(seen.offered).toEqual([bolt]);
    expect(zone(game, bolt)).toBe("hand");
    expect(library(game).indexOf(giant)).toBeGreaterThan(library(game).length - 6);
  });
});

describe("Lacerate Flesh", () => {
  it("makes a Blood token per point of excess damage", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Lacerate Flesh"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensNamed(game, "Blood Token", A)).toBe(2);
  });

  it("damage already marked counts toward lethal", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const giant = spawn(game, "Hill Giant", B);
    game.state.objects[giant].damageMarked = 2;
    cast(game, toHand(game, "Lacerate Flesh"), { targets: [ref(giant)] });
    expect(tokensNamed(game, "Blood Token", A)).toBe(3);
  });
});

describe("Fear of Death", () => {
  it("mills two and shrinks the enchanted creature by your graveyard's size", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const giant = spawn(game, "Hill Giant", B);
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Fear of Death"), { targets: [ref(giant)] });
    // One card already there, two milled — Bob's graveyard doesn't count.
    expect(graveyard(game)).toHaveLength(3);
    expect(pt(game, giant)).toEqual({ power: 0, toughness: 3 });
  });
});

describe("Soulcipher Board // Cipherbound Spirit", () => {
  it("enters with three omen counters; its ability mills one of the top two", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const board = enter(game, "Soulcipher Board");
    expect(counters(game, board, "omen")).toBe(3);
    const second = toLibrary(game, "Hill Giant");
    const top = toLibrary(game, "Lightning Bolt");
    // The pick is the card that stays; the other goes to the graveyard.
    const seen = pickFromZone(a, top);
    activate(game, board, 0);
    expect([...seen.offered].sort()).toEqual([second, top].sort());
    expect(zone(game, second)).toBe("graveyard");
    expect(library(game)[0]).toBe(top);
    // The Giant was a creature card: one omen counter gone.
    expect(counters(game, board, "omen")).toBe(2);
  });

  it("with one card left, that card goes to the graveyard", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const board = spawn(game, "Soulcipher Board");
    game.state.zones.perPlayer[A].library = library(game).slice(0, 1);
    const last = library(game)[0];
    activate(game, board, 0);
    expect(zone(game, last)).toBe("graveyard");
  });

  it("transforms when the last omen counter goes; creature tokens dying don't count", () => {
    const { game } = table();
    const board = spawn(game, "Soulcipher Board");
    game.state.objects[board].counters.omen = 1;
    const token = enter(game, "Grizzly Bears");
    game.state.objects[token].isToken = true;
    destroy(game, token);
    expect(counters(game, board, "omen")).toBe(1);
    const bears = spawn(game, "Grizzly Bears");
    destroy(game, bears);
    expect(printedCardName(game.state.objects[board])).toBe("Cipherbound Spirit");
    expect(pt(game, board)).toEqual({ power: 3, toughness: 2 });
  });
});

describe("Estwald Shieldbasher", () => {
  it("paying {1} as it attacks makes it indestructible", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    const basher = spawn(game, "Estwald Shieldbasher");
    pickModes(a, 0);
    a.declareAttackersFn = () => [{ attacker: basher, defender: B }];
    toStep(game, "declare-blockers");
    settle(game);
    expect(keywords(game, basher).has("indestructible")).toBe(true);
  });
});

describe("Wretched Throng", () => {
  it("dying, it may fetch another Wretched Throng", () => {
    const { game, a } = table();
    const throng = spawn(game, "Wretched Throng");
    const another = toLibrary(game, "Wretched Throng");
    pickModes(a, 0);
    pickFromZone(a, another);
    destroy(game, throng);
    expect(zone(game, another)).toBe("hand");
  });
});
