/**
 * Set walk batch 82, part e (2026-10-15): Final Fantasy (FIN) and Final Fantasy Commander (FIC), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { faceName } from "../state.js";

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
  nextTurn,
  pickFromZone,
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
  watchTargets,
  zone,
} from "./harness.js";

const face = (game: Game, id: ObjectId): string => faceName(game.state.objects[id]);
const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped;
/** Attach `equipment` to `creature` silently. */
const attachTo = (game: Game, equipment: ObjectId, creature: ObjectId): void =>
  game.debugApplyEffect(A, { kind: "attach", target: 0, attachment: 1 }, [ref(creature), ref(equipment)]);
const treasures = (game: Game, n: number): void =>
  game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: n }, []);

describe("Shinra Reinforcements", () => {
  it("mills three cards and gains 3 life as it enters", () => {
    const { game } = table();
    enter(game, "Shinra Reinforcements");
    expect(graveyard(game)).toHaveLength(3);
    expect(life(game)).toBe(23);
  });
});

describe("Choco-Comet", () => {
  it("deals X damage to any target and makes a Chocobo Bird", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    cast(game, toHand(game, "Choco-Comet"), { targets: [ref(B)], x: 3 });
    expect(life(game, B)).toBe(17);
    expect(tokensNamed(game, "Chocobo Bird Token", A)).toBe(1);
  });

  it("makes no Bird when its target is gone (the ruling)", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Choco-Comet"), { targets: [ref(bears)], x: 2, settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    settle(game);
    expect(tokensNamed(game, "Chocobo Bird Token")).toBe(0);
  });
});

describe("Exdeath, Void Warlock // Neo Exdeath, Dimension's End", () => {
  it("gains 3 life as it enters", () => {
    const { game } = table();
    enter(game, "Exdeath, Void Warlock");
    expect(life(game)).toBe(23);
  });

  it("stays a Warlock at end step with five permanent cards in the graveyard (instants don't count)", () => {
    const { game } = table();
    const exdeath = spawn(game, "Exdeath, Void Warlock");
    for (let i = 0; i < 5; i += 1) toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Divination");
    toStep(game, "end");
    settle(game);
    expect(face(game, exdeath)).toBe("Exdeath, Void Warlock");
  });

  it("transforms with six, and Neo Exdeath's power is the permanent cards in its controller's graveyard", () => {
    const { game } = table();
    const exdeath = spawn(game, "Exdeath, Void Warlock");
    for (let i = 0; i < 4; i += 1) toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Forest");
    toGraveyard(game, "Sol Ring");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Grizzly Bears", B);
    toStep(game, "end");
    settle(game);
    expect(face(game, exdeath)).toBe("Neo Exdeath, Dimension's End");
    expect(pt(game, exdeath)).toEqual({ power: 6, toughness: 3 });
    expect(keywords(game, exdeath).has("trample")).toBe(true);
    toGraveyard(game, "Grizzly Bears");
    expect(pt(game, exdeath).power).toBe(7);
  });
});

describe("Gran Pulse Ochu", () => {
  it("gets +1/+1 per permanent card in your graveyard, fixed as it resolves", () => {
    const { game } = table();
    const ochu = spawn(game, "Gran Pulse Ochu");
    lands(game, "Forest", 8);
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Forest");
    toGraveyard(game, "Sol Ring");
    toGraveyard(game, "Lightning Bolt");
    toGraveyard(game, "Grizzly Bears", B);
    activate(game, ochu);
    expect(pt(game, ochu)).toEqual({ power: 4, toughness: 4 });
    toGraveyard(game, "Grizzly Bears");
    expect(pt(game, ochu)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, ochu).has("deathtouch")).toBe(true);
    nextTurn(game);
    expect(pt(game, ochu)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("G'raha Tia", () => {
  it("draws once a turn when other creatures or artifacts you control die", () => {
    const { game } = table();
    spawn(game, "G'raha Tia");
    const bears = spawn(game, "Grizzly Bears");
    const ring = spawn(game, "Sol Ring");
    const other = spawn(game, "Grizzly Bears", B);
    const before = hand(game).length;
    destroy(game, other);
    expect(hand(game)).toHaveLength(before);
    destroy(game, ring);
    expect(hand(game)).toHaveLength(before + 1);
    destroy(game, bears);
    expect(hand(game)).toHaveLength(before + 1);
  });

  it("triggers once when it dies alongside others (the ruling)", () => {
    const { game } = table();
    const graha = spawn(game, "G'raha Tia");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { type: "creature" } }, []);
    settle(game);
    expect(zone(game, graha)).toBe("graveyard");
    expect(hand(game)).toHaveLength(before + 1);
  });

  it("doesn't draw for its own death alone", () => {
    const { game } = table();
    const graha = spawn(game, "G'raha Tia");
    const before = hand(game).length;
    destroy(game, graha);
    expect(hand(game)).toHaveLength(before);
  });
});

describe("Tonberry", () => {
  it("enters tapped with a stun counter, and has first strike and deathtouch only during your turn", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const tonberry = toHand(game, "Tonberry");
    cast(game, tonberry);
    expect(tapped(game, tonberry)).toBe(true);
    expect(counters(game, tonberry, "stun")).toBe(1);
    expect(keywords(game, tonberry).has("first-strike")).toBe(true);
    expect(keywords(game, tonberry).has("deathtouch")).toBe(true);
    nextTurn(game);
    expect(keywords(game, tonberry).has("first-strike")).toBe(false);
    expect(keywords(game, tonberry).has("deathtouch")).toBe(false);
    nextTurn(game);
    // Its first untap step only took the stun counter off.
    expect(tapped(game, tonberry)).toBe(true);
    expect(counters(game, tonberry, "stun")).toBe(0);
  });
});

describe("Sidequest: Hunt the Mark // Yiazmat, Ultimate Mark", () => {
  it("destroys up to one target creature as it enters, then makes a Treasure at end step after an opponent's creature died", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    cast(game, toHand(game, "Sidequest: Hunt the Mark"));
    expect(zone(game, bears)).toBe("graveyard");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });

  it("makes nothing when only your own creature died this turn", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const mine = spawn(game, "Grizzly Bears");
    pickTargets(a, null);
    cast(game, toHand(game, "Sidequest: Hunt the Mark"));
    destroy(game, mine);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Treasure Token")).toBe(0);
  });

  it("transforms once you control three Treasures", () => {
    const { game } = table();
    const quest = spawn(game, "Sidequest: Hunt the Mark");
    treasures(game, 2);
    destroy(game, spawn(game, "Grizzly Bears", B));
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(3);
    expect(face(game, quest)).toBe("Yiazmat, Ultimate Mark");
    expect(pt(game, quest)).toEqual({ power: 5, toughness: 6 });
  });

  it("Yiazmat sacrifices another creature or artifact to gain indestructible and tap", () => {
    const { game } = table();
    const yiazmat = spawn(game, "Sidequest: Hunt the Mark");
    game.debugApplyEffect(A, { kind: "transform", target: 0 }, [ref(yiazmat)]);
    lands(game, "Swamp", 2);
    const ring = spawn(game, "Sol Ring");
    const itself = { type: "activate-ability", player: A, source: yiazmat, abilityIndex: 0, targets: [] } as const;
    // "Another": it can't pay with itself.
    expect(() => game.dispatch({ ...itself, sacrifice: yiazmat })).toThrow();
    game.dispatch({ ...itself, sacrifice: ring });
    settle(game);
    expect(zone(game, ring)).toBe("graveyard");
    expect(keywords(game, yiazmat).has("indestructible")).toBe(true);
    expect(tapped(game, yiazmat)).toBe(true);
  });
});

describe("You're Not Alone", () => {
  it("gives +2/+2, or +4/+4 with three or more creatures", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "You're Not Alone"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    const other = named(game, "Grizzly Bears")[1];
    cast(game, toHand(game, "You're Not Alone"), { targets: [ref(other)] });
    expect(pt(game, other)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Seymour Flux", () => {
  it("pays 1 life at upkeep to draw and grow", () => {
    const { game, a } = table();
    const seymour = spawn(game, "Seymour Flux");
    pickModes(a, 0);
    toStep(game, "upkeep");
    const before = hand(game).length;
    settle(game);
    expect(life(game)).toBe(19);
    expect(hand(game)).toHaveLength(before + 1);
    expect(counters(game, seymour)).toBe(1);
  });

  it("does nothing when declined", () => {
    const { game, a } = table();
    const seymour = spawn(game, "Seymour Flux");
    pickModes(a);
    toStep(game, "upkeep");
    const before = hand(game).length;
    settle(game);
    expect(life(game)).toBe(20);
    expect(hand(game)).toHaveLength(before);
    expect(counters(game, seymour)).toBe(0);
  });
});

describe("Rufus Shinra", () => {
  it("makes Darkstar as it attacks, but not while you control one", () => {
    const { game, a } = table();
    const rufus = spawn(game, "Rufus Shinra");
    attack(game, a, [rufus]);
    expect(tokensNamed(game, "Darkstar", A)).toBe(1);
    const darkstar = named(game, "Darkstar")[0];
    expect(supertypes(game, darkstar)).toContain("legendary");
    expect(pt(game, darkstar)).toEqual({ power: 2, toughness: 2 });
    expect([...game.characteristics(darkstar).colors].sort()).toEqual(["B", "W"]);
    nextTurn(game);
    nextTurn(game);
    attack(game, a, [rufus]);
    expect(tokensNamed(game, "Darkstar", A)).toBe(1);
    destroy(game, darkstar);
    nextTurn(game);
    nextTurn(game);
    attack(game, a, [rufus]);
    expect(tokensNamed(game, "Darkstar", A)).toBe(1);
  });
});

describe("Call the Mountain Chocobo", () => {
  it("tutors a Mountain card and makes a Chocobo Bird, then again by flashback", () => {
    const { game, a } = table();
    lands(game, "Mountain", 10);
    const mountain = toLibrary(game, "Mountain");
    const call = toHand(game, "Call the Mountain Chocobo");
    pickFromZone(a, mountain);
    cast(game, call);
    expect(zone(game, mountain)).toBe("hand");
    expect(tokensNamed(game, "Chocobo Bird Token", A)).toBe(1);
    expect(zone(game, call)).toBe("graveyard");
    pickFromZone(a);
    cast(game, call, { via: "flashback" });
    expect(tokensNamed(game, "Chocobo Bird Token", A)).toBe(2);
    expect(zone(game, call)).toBe("exile");
  });
});

describe("The Final Days", () => {
  it("makes two tapped Horrors from the hand, X by flashback for the creature cards in your graveyard", () => {
    const { game } = table();
    lands(game, "Swamp", 10);
    const days = toHand(game, "The Final Days");
    for (let i = 0; i < 3; i += 1) toGraveyard(game, "Grizzly Bears");
    cast(game, days);
    expect(tokensNamed(game, "Horror Token (The Final Days)", A)).toBe(2);
    expect(named(game, "Horror Token (The Final Days)").every((id) => tapped(game, id))).toBe(true);
    cast(game, days, { via: "flashback" });
    expect(tokensNamed(game, "Horror Token (The Final Days)", A)).toBe(5);
    expect(zone(game, days)).toBe("exile");
  });
});

describe("Poison the Waters", () => {
  it("gives all creatures -1/-1", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const mine = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves", B);
    cast(game, toHand(game, "Poison the Waters"), { modes: [0] });
    expect(pt(game, mine)).toEqual({ power: 1, toughness: 1 });
    expect(zone(game, elves)).toBe("graveyard");
  });

  it("has a target player discard an artifact or creature card you choose", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const bears = toHand(game, "Grizzly Bears", B);
    const ring = toHand(game, "Sol Ring", B);
    const bolt = toHand(game, "Lightning Bolt", B);
    const seen = pickFromZone(a, ring);
    cast(game, toHand(game, "Poison the Waters"), { modes: [1], targets: [ref(B)] });
    expect([...seen.offered].sort()).toEqual([bears, ring].sort());
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("hand");
  });
});

describe("Coliseum Behemoth", () => {
  it("destroys an artifact or enchantment, or draws a card, as it enters", () => {
    const { game, a } = table();
    lands(game, "Forest", 14);
    const ring = spawn(game, "Sol Ring", B);
    pickModes(a, 0);
    pickTargets(a, ring);
    cast(game, toHand(game, "Coliseum Behemoth"));
    expect(zone(game, ring)).toBe("graveyard");
    // With no artifact or enchantment left, only the draw is offered.
    let offered: readonly string[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      offered = texts;
      return [texts.indexOf("Draw a card.")];
    };
    const before = hand(game).length;
    const second = toHand(game, "Coliseum Behemoth");
    cast(game, second);
    expect(offered).toContain("Draw a card.");
    expect(hand(game)).toHaveLength(before + 1);
    expect(keywords(game, second).has("trample")).toBe(true);
  });
});

describe("Monk's Fist", () => {
  it("makes a 1/1 Hero, attaches to it, and makes it a 2/1 Monk", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const fist = toHand(game, "Monk's Fist");
    cast(game, fist);
    const hero = named(game, "Hero Token (Black Mage's Rod)")[0];
    expect(game.state.objects[fist].attachedTo).toBe(hero);
    expect(pt(game, hero)).toEqual({ power: 2, toughness: 1 });
    expect(subtypes(game, hero)).toEqual(expect.arrayContaining(["Hero", "Monk"]));
  });
});

describe("Item Shopkeep", () => {
  it("gives an attacking equipped creature menace — only those are offered", () => {
    const { game, a } = table();
    spawn(game, "Item Shopkeep");
    const armed = spawn(game, "Grizzly Bears");
    const armedToo = spawn(game, "Grizzly Bears");
    const bare = spawn(game, "Grizzly Bears");
    const idle = spawn(game, "Grizzly Bears");
    attachTo(game, spawn(game, "Coral Sword"), armed);
    attachTo(game, spawn(game, "Coral Sword"), armedToo);
    attachTo(game, spawn(game, "Coral Sword"), idle);
    const seen = watchTargets(a, () => [armedToo]);
    attack(game, a, [armed, armedToo, bare]);
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([armed, armedToo].sort());
    expect(keywords(game, armedToo).has("menace")).toBe(true);
    expect(keywords(game, armed).has("menace")).toBe(false);
    expect(keywords(game, bare).has("menace")).toBe(false);
  });
});

describe("Ether", () => {
  it("exiles itself for {U} and copies the next instant or sorcery this turn", () => {
    const { game } = table();
    const ether = spawn(game, "Ether");
    lands(game, "Mountain", 1);
    activate(game, ether);
    expect(zone(game, ether)).toBe("exile");
    expect(game.state.players[A].manaPool.length).toBe(1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(14);
  });
});

describe("Magitek Scythe", () => {
  it("may attach as it enters, granting first strike and must-be-blocked this turn", () => {
    const { game, a } = table();
    lands(game, "Wastes", 4);
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    const scythe = toHand(game, "Magitek Scythe");
    cast(game, scythe);
    expect(game.state.objects[scythe].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    expect(game.characteristics(bears).restrictions).toContain("must-be-blocked-if-able");
    nextTurn(game);
    expect(keywords(game, bears).has("first-strike")).toBe(false);
    expect(game.characteristics(bears).restrictions).not.toContain("must-be-blocked-if-able");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
  });

  it("grants nothing when it's gone before the trigger resolves — it wasn't attached", () => {
    const { game, a } = table();
    lands(game, "Wastes", 4);
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    const scythe = toHand(game, "Magitek Scythe");
    cast(game, scythe, { settle: false });
    game.advanceUntil((s) => s.objects[scythe].zone === "battlefield" && s.zones.shared.stack.length === 1);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(scythe)]);
    settle(game);
    expect(zone(game, scythe)).toBe("graveyard");
    expect(keywords(game, bears).has("first-strike")).toBe(false);
    expect(game.characteristics(bears).restrictions).not.toContain("must-be-blocked-if-able");
  });

  it("does nothing when declined", () => {
    const { game, a } = table();
    lands(game, "Wastes", 4);
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a);
    const scythe = toHand(game, "Magitek Scythe");
    cast(game, scythe);
    expect(game.state.objects[scythe].attachedTo ?? null).toBeNull();
    expect(keywords(game, bears).has("first-strike")).toBe(false);
    expect(game.characteristics(bears).restrictions).not.toContain("must-be-blocked-if-able");
  });
});

describe("Rydia's Return", () => {
  it("pumps creatures you control +3/+3", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Rydia's Return"), { modes: [0] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });

  it("returns up to two permanent cards — not an instant — from your graveyard", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const bears = toGraveyard(game, "Grizzly Bears");
    const ring = toGraveyard(game, "Sol Ring");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const card = toHand(game, "Rydia's Return");
    expect(() => cast(game, card, { modes: [1], targets: [ref(bolt), null] })).toThrow();
    cast(game, card, { modes: [1], targets: [ref(bears), ref(ring)] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, ring)).toBe("hand");
    expect(zone(game, bolt)).toBe("graveyard");
  });
});

describe("Rinoa Heartilly", () => {
  it("makes Angelo, and as she attacks gives another creature +1/+1 per creature you control", () => {
    const { game, a } = table();
    const rinoa = enter(game, "Rinoa Heartilly");
    const angelo = named(game, "Angelo")[0];
    expect(supertypes(game, angelo)).toContain("legendary");
    expect(pt(game, angelo)).toEqual({ power: 1, toughness: 1 });
    spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [angelo]);
    attack(game, a, [rinoa]);
    expect(seen.offered[0]).not.toContain(rinoa);
    expect(pt(game, angelo)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Coral Sword", () => {
  it("attaches as it enters and gives first strike this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears");
    const sword = toHand(game, "Coral Sword");
    cast(game, sword);
    expect(game.state.objects[sword].attachedTo).toBe(bears);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
    nextTurn(game);
    expect(keywords(game, bears).has("first-strike")).toBe(false);
  });
});

describe("Fate of the Sun-Cryst", () => {
  it("costs {2} less aimed at a tapped creature", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const awake = spawn(game, "Grizzly Bears", B);
    const asleep = spawn(game, "Grizzly Bears", B, { tapped: true });
    const card = toHand(game, "Fate of the Sun-Cryst");
    expect(() => cast(game, card, { targets: [ref(awake)] })).toThrow();
    cast(game, card, { targets: [ref(asleep)] });
    expect(zone(game, asleep)).toBe("graveyard");
  });

  it("destroys any nonland permanent at full cost", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const ring = spawn(game, "Sol Ring", B);
    cast(game, toHand(game, "Fate of the Sun-Cryst"), { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
  });
});

describe("Ultros, Obnoxious Octopus", () => {
  it("stuns an opponent's creature for a noncreature spell of four or more mana, and grows for eight", () => {
    const { game } = table();
    const ultros = spawn(game, "Ultros, Obnoxious Octopus");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    cast(game, toHand(game, "Divination"));
    expect(tapped(game, theirs)).toBe(false);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Ether"));
    expect(tapped(game, theirs)).toBe(true);
    expect(counters(game, theirs, "stun")).toBe(1);
    expect(counters(game, ultros)).toBe(0);
    lands(game, "Mountain", 8);
    cast(game, toHand(game, "Blaze"), { targets: [ref(B)], x: 7 });
    expect(counters(game, theirs, "stun")).toBe(2);
    expect(counters(game, ultros)).toBe(8);
  });

  it("ignores creature spells", () => {
    const { game } = table();
    spawn(game, "Ultros, Obnoxious Octopus");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 6);
    cast(game, toHand(game, "Colossal Dreadmaw"));
    expect(tapped(game, theirs)).toBe(false);
  });
});

describe("Judgment Bolt", () => {
  it("deals 5 to a creature and X to its controller for each Equipment you control", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    spawn(game, "Coral Sword");
    spawn(game, "Monk's Fist");
    spawn(game, "Coral Sword", B);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    cast(game, toHand(game, "Judgment Bolt"), { targets: [ref(dreadmaw)] });
    expect(game.state.objects[dreadmaw].damageMarked).toBe(5);
    expect(life(game, B)).toBe(18);
  });
});

describe("Deadly Embrace", () => {
  it("destroys an opponent's creature, then draws for every creature that died this turn", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    destroy(game, spawn(game, "Grizzly Bears"));
    destroy(game, spawn(game, "Grizzly Bears", B));
    const target = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Deadly Embrace");
    const before = hand(game).length;
    cast(game, card, { targets: [ref(target)] });
    expect(zone(game, target)).toBe("graveyard");
    // The card left the hand; three draws.
    expect(hand(game)).toHaveLength(before - 1 + 3);
  });
});
