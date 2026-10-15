/**
 * Marvel Super Heroes (MSH), batch 74, part d (2026-10-14).
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { activePlayerOf } from "../state.js";

import {
  A,
  B,
  activate,
  blockOffer,
  cast,
  controller,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  supertypes,
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

const castOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((o) => o.kind === "cast-spell" && o.card === card);
const activateOffers = (game: Game, source: ObjectId) =>
  game.legalActions(A).filter((o) => o.kind === "activate-ability" && o.source === source);
const stackAbilities = (game: Game): ObjectId[] =>
  game.state.zones.shared.stack.filter((id) => game.state.objects[id].kind === "ability");
const nameOf = (game: Game, id: ObjectId): string => game.state.objects[id].cardName;

describe("Scientist Supreme of A.I.M.", () => {
  it("copies an ability from an artifact source for 2 life, only once each turn", () => {
    const { game, a } = table();
    const scientist = spawn(game, "Scientist Supreme of A.I.M.");
    const sorcerer = spawn(game, "Prodigal Sorcerer");
    const rod = spawn(game, "Rod of Ruin");
    const rod2 = spawn(game, "Rod of Ruin");
    lands(game, "Wastes", 6);

    // A creature source's ability isn't a legal target.
    activate(game, sorcerer, 0, { targets: [ref(B)], settle: false });
    expect(() => activate(game, scientist, 0, { targets: [ref(stackAbilities(game)[0])], settle: false })).toThrow();
    settle(game);
    expect(life(game, B)).toBe(19);

    activate(game, rod, 0, { targets: [ref(B)], settle: false });
    pickTargets(a, B);
    activate(game, scientist, 0, { targets: [ref(stackAbilities(game)[0])] });
    expect(life(game, B)).toBe(17);
    expect(life(game)).toBe(18);

    activate(game, rod2, 0, { targets: [ref(B)], settle: false });
    expect(() => activate(game, scientist, 0, { targets: [ref(stackAbilities(game)[0])], settle: false })).toThrow();
  });

  it("can't be activated during an opponent's turn", () => {
    const { game } = table();
    const scientist = spawn(game, "Scientist Supreme of A.I.M.");
    const rod = spawn(game, "Rod of Ruin");
    lands(game, "Wastes", 3);
    nextTurn(game);
    game.advanceUntil((s) => activePlayerOf(s) === B && s.priority.holder === A);
    activate(game, rod, 0, { targets: [ref(B)], settle: false });
    expect(() => activate(game, scientist, 0, { targets: [ref(stackAbilities(game)[0])], settle: false })).toThrow();
  });
});

describe("Wiccan, Rising Magician", () => {
  it("exiles another nonland, nontoken permanent on a noncreature cast and returns it at the next end step under its owner's control", () => {
    const { game, a } = table();
    const wiccan = spawn(game, "Wiccan, Rising Magician");
    const ring = spawn(game, "Sol Ring", B);
    const land = spawn(game, "Island", B);
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    const token = named(game, "Soldier Token", B)[0];
    expect(game.state.objects[token].isToken).toBe(true);
    spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    const seen = watchTargets(a, () => [ring]);
    cast(game, toHand(game, "Opt"));
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).not.toContain(wiccan);
    expect(seen.offered[0]).not.toContain(land);
    expect(seen.offered[0]).not.toContain(token);
    expect(seen.offered[0]).toContain(ring);
    expect(zone(game, ring)).toBe("exile");
    toStep(game, "end");
    settle(game);
    const back = named(game, "Sol Ring");
    expect(back).toHaveLength(1);
    expect(controller(game, back[0])).toBe(B);
  });
});

describe("Stolen Stark Tech and Super Suit", () => {
  it("Stolen Stark Tech attaches as it enters and gives indestructible until end of turn", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    const tech = enter(game, "Stolen Stark Tech");
    expect(game.state.objects[tech].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("indestructible")).toBe(true);
  });

  it("Super Suit attaches as it enters and untaps that creature", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    pickTargets(a, bears);
    const suit = enter(game, "Super Suit");
    expect(game.state.objects[suit].attachedTo).toBe(bears);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 4 });
  });
});

describe("Falcon's Wing Harness", () => {
  it("attaches as it enters: +1/+1, flying and ward {1}", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Falcon's Wing Harness");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("flying")).toBe(true);
  });
});

describe("Murdock's Crusade", () => {
  it("exiles a creature with toughness 4 or greater; with teamwork, an enchantment with mana value 4 or greater too", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const crusade = toHand(game, "Murdock's Crusade");
    const bears = spawn(game, "Grizzly Bears", B);
    const wurm = spawn(game, "Craw Wurm", B);
    const tithe = spawn(game, "Smothering Tithe", B);
    // Toughness 2 isn't a legal target.
    expect(() => cast(game, crusade, { modes: [0], targets: [ref(bears)] })).toThrow();
    const g1 = spawn(game, "Hill Giant");
    const g2 = spawn(game, "Grizzly Bears");
    cast(game, crusade, { kicked: true, modes: [0, 1], tap: [g1, g2], targets: [ref(wurm), ref(tithe)] });
    expect(zone(game, wurm)).toBe("exile");
    expect(zone(game, tithe)).toBe("exile");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Team Tactics", () => {
  it("grants double strike, and trample too only when cast using teamwork", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Team Tactics"), { targets: [ref(bears)] });
    expect(keywords(game, bears).has("double-strike")).toBe(true);
    expect(keywords(game, bears).has("trample")).toBe(false);

    const other = spawn(game, "Grizzly Bears");
    const helper = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Team Tactics"), { kicked: true, tap: [helper], targets: [ref(other)] });
    expect(keywords(game, other).has("double-strike")).toBe(true);
    expect(keywords(game, other).has("trample")).toBe(true);
  });
});

describe("Okoye, Dora Milaje Leader", () => {
  it("makes two Soldiers, and only attacking creature tokens have first strike", () => {
    const { game, a } = table();
    const okoye = enter(game, "Okoye, Dora Milaje Leader");
    expect(tokensNamed(game, "Soldier Token", A)).toBe(2);
    const soldiers = named(game, "Soldier Token", A);
    for (const s of soldiers) expect(keywords(game, s).has("first-strike")).toBe(false);
    toStep(game, "precombat-main"); // alice's next turn: the tokens can attack
    a.declareAttackersFn = () => [
      { attacker: okoye, defender: B },
      { attacker: soldiers[0], defender: B },
    ];
    toStep(game, "declare-attackers");
    settle(game);
    expect(keywords(game, soldiers[0]).has("first-strike")).toBe(true);
    expect(keywords(game, soldiers[1]).has("first-strike")).toBe(false);
    expect(keywords(game, okoye).has("first-strike")).toBe(false);
  });
});

describe("Punishing Punch", () => {
  it("costs {G} with two creature cards in your graveyard, and deals twice the creature's power", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const punch = toHand(game, "Punishing Punch");
    const giant = spawn(game, "Hill Giant");
    const wurm = spawn(game, "Craw Wurm", B);
    toGraveyard(game, "Grizzly Bears");
    expect(castOffers(game, punch)).toHaveLength(0);
    toGraveyard(game, "Hill Giant");
    cast(game, punch, { targets: [ref(giant), ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard"); // 6 damage to a 6/4
    expect(game.state.objects[giant].damageMarked).toBe(0);
  });
});

describe("Hydraulic Helper", () => {
  it("makes {U} that casts an artifact spell but not a nonartifact one", () => {
    const { game } = table();
    spawn(game, "Hydraulic Helper");
    const opt = toHand(game, "Opt");
    const ornithopter = toHand(game, "Memnite");
    const stone = toHand(game, "Mind Stone");
    expect(castOffers(game, opt)).toHaveLength(0);
    expect(castOffers(game, ornithopter).length).toBeGreaterThan(0);
    spawn(game, "Wastes");
    // {2} for Mind Stone: the Helper's {U} and a Wastes.
    cast(game, stone);
    expect(zone(game, stone)).toBe("battlefield");
  });
});

describe("Patriot, Shield Wielder", () => {
  it("pumps and gives hexproof to another creature you control, never itself", () => {
    const { game } = table();
    const patriot = spawn(game, "Patriot, Shield Wielder");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    expect(() => activate(game, patriot, 0, { targets: [ref(patriot)] })).toThrow();
    activate(game, patriot, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, bears).has("hexproof")).toBe(true);
  });
});

describe("Guerrilla Gorilla", () => {
  it("destroys a noncreature artifact, not an artifact creature, as a sorcery", () => {
    const { game } = table();
    const gorilla = spawn(game, "Guerrilla Gorilla");
    const thopter = spawn(game, "Ornithopter", B);
    const ring = spawn(game, "Sol Ring", B);
    expect(() => activate(game, gorilla, 0, { targets: [ref(thopter)] })).toThrow();
    activate(game, gorilla, 0, { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, gorilla)).toBe("graveyard");
  });
});

describe("S.H.I.E.L.D. Spy Kit", () => {
  it("untaps the equipped creature and scries 1 when it attacks alone", () => {
    const { game, a } = table();
    const kit = spawn(game, "S.H.I.E.L.D. Spy Kit");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    activate(game, kit, 0, { targets: [ref(bears)] });
    const top = toLibrary(game, "Lightning Bolt");
    let scried = 0;
    a.chooseScryFn = (_v, cards) => {
      scried = cards.length;
      return [...cards];
    };
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-attackers");
    settle(game);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(scried).toBe(1);
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(top);
  });
});

describe("White Widow, Free Agent", () => {
  it("puts a counter on each of up to two creatures", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickTargets(a, bears, theirs);
    enter(game, "White Widow, Free Agent");
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, theirs)).toBe(1);
  });

  it("or returns an artifact or enchantment card from your graveyard to your hand", () => {
    const { game, a } = table();
    const ring = toGraveyard(game, "Sol Ring");
    pickModes(a, 1);
    pickTargets(a, ring);
    enter(game, "White Widow, Free Agent");
    expect(hand(game)).toContain(ring);
  });
});

describe("Absorbing Man", () => {
  it("becomes a legendary 4/4 Human Villain creature copy of a land with vigilance until your next turn", () => {
    const { game, a } = table({ step: "upkeep" });
    const man = spawn(game, "Absorbing Man");
    const land = spawn(game, "Underground Sea", B);
    const seen = watchTargets(a, () => [land]);
    toStep(game, "precombat-main");
    settle(game);
    expect(seen.asked).toBe(1);
    expect(nameOf(game, man)).toBe("Absorbing Man");
    expect(types(game, man)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(subtypes(game, man)).toEqual(expect.arrayContaining(["Island", "Swamp", "Human", "Villain"]));
    expect(supertypes(game, man)).toContain("legendary");
    expect(pt(game, man)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, man).has("vigilance")).toBe(true);
    // Bob's turn: still the copy. Alice's next turn: himself again.
    nextTurn(game);
    expect(types(game, man)).toContain("land");
    a.chooseTargetsFn = () => [null];
    nextTurn(game);
    expect(types(game, man)).not.toContain("land");
    expect(types(game, man)).toContain("creature");
  });

  it("can't copy an Aura or a creature", () => {
    const { game, a } = table({ step: "upkeep" });
    spawn(game, "Absorbing Man");
    const bears = spawn(game, "Grizzly Bears", B);
    const study = spawn(game, "Rhystic Study", B);
    const seen = watchTargets(a);
    toStep(game, "precombat-main");
    settle(game);
    expect(seen.offered[0]).toContain(study);
    expect(seen.offered[0]).not.toContain(bears);
  });
});

describe("Depower", () => {
  it("costs {U} when it targets an attacking creature, gives -4/-0 and draws", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    const resting = spawn(game, "Hill Giant");
    lands(game, "Island", 1);
    const depower = toHand(game, "Depower");
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    toStep(game, "declare-attackers");
    settle(game);
    expect(() => cast(game, depower, { targets: [ref(resting)] })).toThrow();
    const handBefore = hand(game).length;
    cast(game, depower, { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: -1, toughness: 3 });
    expect(hand(game)).toHaveLength(handBefore); // Depower left, a card came in
  });
});

describe("Photon Blast Barrage", () => {
  it("is copied X times as it's cast, each copy free to pick a new creature", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const b1 = spawn(game, "Grizzly Bears", B);
    const b2 = spawn(game, "Grizzly Bears", B);
    const b3 = spawn(game, "Grizzly Bears", B);
    let asked = 0;
    a.chooseTargetsFn = () => {
      asked += 1;
      return [ref(asked === 1 ? b2 : b3)];
    };
    cast(game, toHand(game, "Photon Blast Barrage"), { x: 2, targets: [ref(b1)] });
    expect(asked).toBe(2);
    for (const bear of [b1, b2, b3]) expect(game.state.objects[bear].damageMarked).toBe(1);
  });
});

describe("Black Widow, Double Agent", () => {
  it("gives a creature attacking alone first strike and menace", () => {
    const { game, a } = table();
    spawn(game, "Black Widow, Double Agent");
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "declare-attackers");
    settle(game);
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    expect(keywords(game, bears).has("menace")).toBe(true);
  });
});

describe("Stature, Size Shifter", () => {
  it("can't be blocked while her power is 1 or less", () => {
    const { game, a } = table();
    const stature = spawn(game, "Stature, Size Shifter");
    spawn(game, "Grizzly Bears", B);
    // Nothing can block her, so bob is never asked.
    a.declareAttackersFn = () => [{ attacker: stature, defender: B }];
    game.advanceUntil((s) => s.awaiting?.kind === "blockers" || s.turn.step === "postcombat-main");
    expect(game.state.awaiting?.kind).not.toBe("blockers");
    settle(game);
    expect(life(game, B)).toBe(19);
  });

  it("has a power-up putting X counters on her, once — and can be blocked once her power is 2", () => {
    const { game, a } = table();
    const stature = spawn(game, "Stature, Size Shifter");
    lands(game, "Island", 4);
    activate(game, stature, 0, { x: 2 });
    expect(counters(game, stature)).toBe(2);
    expect(activateOffers(game, stature)).toHaveLength(0);
    const wall = spawn(game, "Grizzly Bears", B);
    const offer = blockOffer(game, a, [stature]);
    expect(offer.eligible.find((b) => b.blocker === wall)?.canBlock ?? []).toContain(stature);
  });
});
