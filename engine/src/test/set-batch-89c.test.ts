/**
 * Set walk batch 89, part c (2026-10-16): The Big Score (BIG), Outlaws of Thunder Junction Commander (OTC) and Outlaws of Thunder Junction (OTJ), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  C,
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
  registryOf,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
const colorsOf = (game: Game, id: ObjectId): string[] => [
  ...computeCharacteristics(game.state, registryOf(game), id).colors,
];
const library = (game: Game, player: PlayerId = A): readonly ObjectId[] => game.state.zones.perPlayer[player].library;
/** `id` becomes an artifact creature until end of turn — a crewed Vehicle. */
const crewed = (game: Game, id: ObjectId): void =>
  game.debugApplyEffect(A, { kind: "add-types", target: 0, addTypes: ["artifact", "creature"], duration: "end-of-turn" }, [
    ref(id),
  ]);
/** Bob casts Grizzly Bears on his turn; alice gets priority with it on the stack. */
const bobCastsBears = (): { game: Game; b: ReturnType<typeof table>["b"]; bears: ObjectId } => {
  const { game, b } = table();
  lands(game, "Island", 5);
  nextTurn(game);
  lands(game, "Forest", 4, B);
  const bears = toHand(game, "Grizzly Bears", B);
  cast(game, bears, { player: B, settle: false });
  game.advanceUntil((s) => s.priority.holder === A && s.zones.shared.stack.includes(bears));
  return { game, b, bears };
};

describe("Fleeting Reflection", () => {
  it("your creature gains hexproof, untaps and becomes a copy of the other target until end of turn", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Fleeting Reflection"), { targets: [ref(bears), ref(angel)] });
    expect(isTapped(game, bears)).toBe(false);
    // Serra Angel's 4/4 flying, vigilance — and its own counter stays (the ruling).
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(keywords(game, bears).has("hexproof")).toBe(true);
    nextTurn(game);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("flying")).toBe(false);
    expect(keywords(game, bears).has("hexproof")).toBe(false);
  });

  it("with no second target, it only gains hexproof and untaps", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    spawn(game, "Serra Angel", B);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Fleeting Reflection"), { targets: [ref(bears), null] });
    expect(isTapped(game, bears)).toBe(false);
    expect(keywords(game, bears).has("hexproof")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("a second target gone as it resolves isn't copied, but the first still gains hexproof and untaps (the ruling)", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Fleeting Reflection"), { targets: [ref(bears), ref(angel)], settle: false });
    destroy(game, angel);
    expect(zone(game, angel)).toBe("graveyard");
    expect(isTapped(game, bears)).toBe(false);
    expect(keywords(game, bears).has("hexproof")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, bears).has("flying")).toBe(false);
  });
});

describe("Rakish Crew", () => {
  it("makes a Mercenary, whose {T} gives a creature you control +1/+0 at sorcery speed", () => {
    const { game } = table();
    enter(game, "Rakish Crew");
    const [merc] = named(game, "Mercenary Token", A);
    expect(tokensNamed(game, "Mercenary Token", A)).toBe(1);
    expect(pt(game, merc)).toEqual({ power: 1, toughness: 1 });
    expect(colorsOf(game, merc)).toEqual(["R"]);
    const bears = spawn(game, "Grizzly Bears");
    nextTurn(game);
    nextTurn(game);
    activate(game, merc, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
  });

  it("an outlaw you control dying drains each opponent for 1; a non-outlaw doesn't", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Rakish Crew");
    const assassin = spawn(game, "Rooftop Assassin");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Rooftop Assassin", B);
    destroy(game, bears);
    expect(life(game, A)).toBe(20);
    destroy(game, theirs);
    expect(life(game, A)).toBe(20);
    destroy(game, assassin);
    expect(life(game, A)).toBe(21);
    expect(life(game, B)).toBe(19);
    expect(life(game, C)).toBe(19);
  });

  it("outlaws dying as it leaves at the same time still trigger it (the ruling)", () => {
    const { game } = table();
    const crew = spawn(game, "Rakish Crew");
    spawn(game, "Rooftop Assassin");
    spawn(game, "Rooftop Assassin");
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { typesAnyOf: ["creature", "enchantment"] } });
    settle(game);
    expect(zone(game, crew)).toBe("graveyard");
    expect(life(game, A)).toBe(22);
    expect(life(game, B)).toBe(18);
  });
});

describe("Explosive Derailment", () => {
  it("both modes: 4 damage to a creature and destroy an artifact, for {R} plus {2} each", () => {
    const { game } = table();
    const giant = spawn(game, "Serra Angel", B);
    const ring = spawn(game, "Sol Ring", B);
    const mountains = lands(game, "Mountain", 5);
    cast(game, toHand(game, "Explosive Derailment"), { modes: [0, 1], targets: [ref(giant), ref(ring)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, ring)).toBe("graveyard");
    expect(mountains.filter((m) => isTapped(game, m))).toHaveLength(5);
  });

  it("one mode costs {2}{R}", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring", B);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Explosive Derailment"), { modes: [1], targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
  });
});

describe("Mobile Homestead", () => {
  it("has haste only while you control a Mount", () => {
    const { game } = table();
    const homestead = spawn(game, "Mobile Homestead", A, { sick: true });
    expect(keywords(game, homestead).has("haste")).toBe(false);
    spawn(game, "Bulwark Ox");
    expect(keywords(game, homestead).has("haste")).toBe(true);
  });

  it("crew 2 makes it a 3/3 artifact creature", () => {
    const { game } = table();
    const homestead = spawn(game, "Mobile Homestead");
    const bears = spawn(game, "Grizzly Bears");
    game.dispatch({ type: "activate-ability", player: A, source: homestead, abilityIndex: 0, tap: [bears] } as never);
    settle(game);
    expect(isTapped(game, bears)).toBe(true);
    expect(computeCharacteristics(game.state, registryOf(game), homestead).types).toContain("creature");
    expect(pt(game, homestead)).toEqual({ power: 3, toughness: 3 });
  });

  it("attacking, it may put a land from the top of your library onto the battlefield tapped", () => {
    const { game, a } = table();
    const homestead = spawn(game, "Mobile Homestead");
    crewed(game, homestead);
    const forest = toLibrary(game, "Forest");
    pickFromZone(a, forest);
    attack(game, a, [homestead]);
    expect(zone(game, forest)).toBe("battlefield");
    expect(isTapped(game, forest)).toBe(true);
    expect(life(game, B)).toBe(17);
  });

  it("a nonland card stays on top", () => {
    const { game, a } = table();
    const homestead = spawn(game, "Mobile Homestead");
    crewed(game, homestead);
    const bears = toLibrary(game, "Grizzly Bears");
    attack(game, a, [homestead]);
    expect(zone(game, bears)).toBe("library");
    expect(library(game)[0]).toBe(bears);
  });
});

describe("Miriam, Herd Whisperer", () => {
  it("Mounts and Vehicles you control have hexproof during your turn only", () => {
    const { game } = table();
    spawn(game, "Miriam, Herd Whisperer");
    const ox = spawn(game, "Bulwark Ox");
    const homestead = spawn(game, "Mobile Homestead");
    const bears = spawn(game, "Grizzly Bears");
    const theirOx = spawn(game, "Bulwark Ox", B);
    expect(keywords(game, ox).has("hexproof")).toBe(true);
    expect(keywords(game, homestead).has("hexproof")).toBe(true);
    expect(keywords(game, bears).has("hexproof")).toBe(false);
    expect(keywords(game, theirOx).has("hexproof")).toBe(false);
    nextTurn(game);
    expect(keywords(game, ox).has("hexproof")).toBe(false);
  });

  it("a Mount or Vehicle you control attacking gets a +1/+1 counter; another creature doesn't", () => {
    const { game, a } = table();
    spawn(game, "Miriam, Herd Whisperer");
    const ox = spawn(game, "Bulwark Ox");
    const homestead = spawn(game, "Mobile Homestead");
    crewed(game, homestead);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [ox, homestead, bears]);
    expect(counters(game, ox)).toBe(1);
    expect(counters(game, homestead)).toBe(1);
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Rooftop Assassin", () => {
  it("destroys a creature an opponent controls that was dealt damage this turn, and only such a one", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    const other = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Hill Giant");
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Shock"), { targets: [ref(giant)] });
    cast(game, toHand(game, "Shock"), { targets: [ref(other)] });
    cast(game, toHand(game, "Shock"), { targets: [ref(mine)] });
    expect(zone(game, giant)).toBe("battlefield");
    const seen = watchTargets(a, (offered) => [offered[0][0]]);
    enter(game, "Rooftop Assassin");
    expect([...seen.offered[0]].sort()).toEqual([giant, other].sort());
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("with no damaged creature an opponent controls, it destroys nothing", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    enter(game, "Rooftop Assassin");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Phantom Interference", () => {
  it("both modes: a 2/2 flying Spirit, then the spell is countered unless its controller pays {2}", () => {
    const { game, b, bears } = bobCastsBears();
    pickModes(b);
    cast(game, toHand(game, "Phantom Interference"), { modes: [0, 1], targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    const [spirit] = named(game, "Spirit Token (Phantom Interference)", A);
    expect(pt(game, spirit)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, spirit).has("flying")).toBe(true);
    expect(colorsOf(game, spirit)).toEqual(["W"]);
  });

  it("the counter mode alone: paid for, the spell resolves", () => {
    const { game, b, bears } = bobCastsBears();
    lands(game, "Forest", 2, B);
    pickModes(b, 0);
    cast(game, toHand(game, "Phantom Interference"), { modes: [1], targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(tokensNamed(game, "Spirit Token (Phantom Interference)")).toBe(0);
  });
});

describe("Badlands Revival", () => {
  it("returns a creature card to the battlefield and a permanent card to your hand", () => {
    const { game } = table();
    const angel = toGraveyard(game, "Serra Angel");
    const ring = toGraveyard(game, "Sol Ring");
    lands(game, "Swamp", 4);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Badlands Revival"), { targets: [ref(angel), ref(ring)] });
    expect(zone(game, angel)).toBe("battlefield");
    expect(zone(game, ring)).toBe("hand");
  });

  it("each half is optional", () => {
    const { game } = table();
    const ring = toGraveyard(game, "Sol Ring");
    lands(game, "Swamp", 4);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Badlands Revival"), { targets: [null, ref(ring)] });
    expect(zone(game, ring)).toBe("hand");
  });

  it("the same card as both targets: once on the battlefield it's a new object, and isn't returned to hand", () => {
    const { game } = table();
    const angel = toGraveyard(game, "Serra Angel");
    lands(game, "Swamp", 4);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Badlands Revival"), { targets: [ref(angel), ref(angel)] });
    expect(zone(game, angel)).toBe("battlefield");
  });
});

describe("Form a Posse", () => {
  it("makes X Mercenaries", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Form a Posse"), { x: 3 });
    expect(tokensNamed(game, "Mercenary Token", A)).toBe(3);
  });
});

describe("Mourner's Surprise", () => {
  it("returns a creature card to your hand and makes a Mercenary", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Mourner's Surprise"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(tokensNamed(game, "Mercenary Token", A)).toBe(1);
  });

  it("with no target chosen it still makes the Mercenary", () => {
    const { game } = table();
    toGraveyard(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Mourner's Surprise"), { targets: [null] });
    expect(tokensNamed(game, "Mercenary Token", A)).toBe(1);
  });

  it("with its target gone it does nothing at all (the ruling)", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Mourner's Surprise"), { targets: [ref(bears)], settle: false });
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    expect(tokensNamed(game, "Mercenary Token", A)).toBe(0);
  });
});

describe("Outcaster Greenblade", () => {
  it("finds a basic land or a Desert, and gets +1/+1 for each Desert you control", () => {
    const { game, a } = table();
    const bluffs = toLibrary(game, "Abraded Bluffs");
    const bears = toLibrary(game, "Grizzly Bears");
    const seen = pickFromZone(a, bluffs);
    const blade = enter(game, "Outcaster Greenblade");
    expect(seen.offered).toContain(bluffs);
    expect(seen.offered).not.toContain(bears);
    expect(zone(game, bluffs)).toBe("hand");
    expect(pt(game, blade)).toEqual({ power: 1, toughness: 2 });
    spawn(game, "Abraded Bluffs");
    spawn(game, "Abraded Bluffs");
    spawn(game, "Abraded Bluffs", B);
    expect(pt(game, blade)).toEqual({ power: 3, toughness: 4 });
  });
});

describe("Metamorphic Blast", () => {
  it("a creature becomes a white 0/1 Rabbit until end of turn, keeping its abilities and counters", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(angel)]);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Metamorphic Blast"), { modes: [0], targets: [ref(angel)] });
    expect(pt(game, angel)).toEqual({ power: 1, toughness: 2 });
    expect(subtypes(game, angel)).toEqual(["Rabbit"]);
    expect(colorsOf(game, angel)).toEqual(["W"]);
    expect(keywords(game, angel).has("flying")).toBe(true);
    nextTurn(game);
    expect(pt(game, angel)).toEqual({ power: 5, toughness: 5 });
    expect(subtypes(game, angel)).toEqual(["Angel"]);
  });

  it("both modes: and target player draws two cards", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 5);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Metamorphic Blast"), { modes: [0, 1], targets: [ref(bears), ref(B)] });
    expect(hand(game, B).length - before).toBe(2);
    expect(pt(game, bears)).toEqual({ power: 0, toughness: 1 });
  });
});

describe("Bucolic Ranch", () => {
  it("its coloured mana only casts Mount spells", () => {
    const { game } = table();
    const ranches = [spawn(game, "Bucolic Ranch"), spawn(game, "Bucolic Ranch")];
    expect(() => cast(game, toHand(game, "Grizzly Bears"))).toThrow();
    const ox = toHand(game, "Bulwark Ox");
    cast(game, ox);
    expect(zone(game, ox)).toBe("battlefield");
    expect(ranches.every((r) => isTapped(game, r))).toBe(true);
  });

  it("{3}, {T}: a Mount card on top may be revealed and put into your hand", () => {
    const { game, a } = table();
    const ranch = spawn(game, "Bucolic Ranch");
    lands(game, "Wastes", 3);
    const ox = toLibrary(game, "Bulwark Ox");
    pickFromZone(a, ox);
    activate(game, ranch, 2);
    expect(zone(game, ox)).toBe("hand");
  });

  it("anything else may go to the bottom, or stay on top", () => {
    const { game, a } = table();
    const ranch = spawn(game, "Bucolic Ranch");
    lands(game, "Wastes", 6);
    const bears = toLibrary(game, "Grizzly Bears");
    a.chooseFromZoneFn = (_view, eligible) => eligible.filter((id) => id === bears);
    activate(game, ranch, 2);
    expect(zone(game, bears)).toBe("library");
    expect(library(game).at(-1)).toBe(bears);
  });
});

describe("Ferocification", () => {
  it("at the beginning of combat on your turn: menace and haste", () => {
    const { game, a } = table();
    spawn(game, "Ferocification");
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    pickModes(a, 1);
    pickTargets(a, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(keywords(game, bears).has("menace")).toBe(true);
    expect(keywords(game, bears).has("haste")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("or +2/+0", () => {
    const { game, a } = table();
    spawn(game, "Ferocification");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    pickTargets(a, bears);
    toStep(game, "begin-combat");
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(keywords(game, bears).has("menace")).toBe(false);
  });
});

describe("Canyon Crab", () => {
  it("{1}{U}: +2/-2", () => {
    const { game } = table();
    const crab = spawn(game, "Canyon Crab");
    lands(game, "Island", 2);
    activate(game, crab);
    expect(pt(game, crab)).toEqual({ power: 2, toughness: 3 });
  });

  it("loots at your end step if you haven't cast a spell from your hand this turn", () => {
    const { game } = table();
    spawn(game, "Canyon Crab");
    const before = graveyard(game).length;
    toStep(game, "end");
    settle(game);
    expect(graveyard(game).length - before).toBe(1);
  });

  it("doesn't after you've cast one", () => {
    const { game } = table();
    spawn(game, "Canyon Crab");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Opt"));
    const before = graveyard(game).length;
    toStep(game, "end");
    settle(game);
    expect(graveyard(game).length - before).toBe(0);
  });

  it("a spell cast from anywhere but your hand doesn't stop it", () => {
    const { game } = table();
    spawn(game, "Canyon Crab");
    lands(game, "Island", 3);
    const twice = toGraveyard(game, "Think Twice");
    cast(game, twice, { via: "flashback" });
    expect(zone(game, twice)).toBe("exile");
    const before = graveyard(game).length;
    toStep(game, "end");
    settle(game);
    expect(graveyard(game).length - before).toBe(1);
  });
});

describe("Spinewoods Armadillo", () => {
  it("{1}{G}, discard it from your hand: find a basic land or a Desert, and gain 3 life", () => {
    const { game, a } = table();
    const armadillo = toHand(game, "Spinewoods Armadillo");
    const bluffs = toLibrary(game, "Abraded Bluffs");
    lands(game, "Forest", 2);
    pickFromZone(a, bluffs);
    activate(game, armadillo);
    expect(zone(game, armadillo)).toBe("graveyard");
    expect(zone(game, bluffs)).toBe("hand");
    expect(life(game)).toBe(23);
  });

  it("has ward {3}", () => {
    const { game } = table();
    const armadillo = spawn(game, "Spinewoods Armadillo");
    nextTurn(game);
    lands(game, "Mountain", 1, B);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(armadillo)] });
    // Bob can't pay {3}, so his Shock is countered.
    expect(game.state.objects[armadillo].damageMarked).toBe(0);
  });
});

describe("Nurturing Pixie", () => {
  it("returns a non-Faerie, nonland permanent you control and gets a +1/+1 counter", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring");
    const seer = spawn(game, "Faerie Seer");
    const forest = spawn(game, "Forest");
    const theirs = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [ring]);
    const pixie = enter(game, "Nurturing Pixie");
    expect(seen.offered[0]).toContain(ring);
    expect(seen.offered[0]).not.toContain(seer);
    expect(seen.offered[0]).not.toContain(forest);
    expect(seen.offered[0]).not.toContain(theirs);
    expect(seen.offered[0]).not.toContain(pixie);
    expect(zone(game, ring)).toBe("hand");
    expect(counters(game, pixie)).toBe(1);
  });

  it("returning nothing, no counter", () => {
    const { game, a } = table();
    spawn(game, "Sol Ring");
    pickTargets(a, null);
    const pixie = enter(game, "Nurturing Pixie");
    expect(counters(game, pixie)).toBe(0);
  });
});

describe("Razzle-Dazzler", () => {
  it("your second spell each turn: a +1/+1 counter and it can't be blocked this turn", () => {
    const { game } = table();
    const razzle = spawn(game, "Razzle-Dazzler");
    lands(game, "Island", 2);
    cast(game, toHand(game, "Opt"));
    expect(counters(game, razzle)).toBe(0);
    cast(game, toHand(game, "Opt"));
    expect(counters(game, razzle)).toBe(1);
    expect(keywords(game, razzle).has("unblockable")).toBe(true);
    nextTurn(game);
    expect(keywords(game, razzle).has("unblockable")).toBe(false);
  });
});

describe("Take the Fall", () => {
  it("-1/-0 and a card", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Island", 1);
    const before = hand(game).length;
    cast(game, toHand(game, "Take the Fall"), { targets: [ref(giant)] });
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 3 });
    // Take the Fall itself left the hand; the drawn card came in.
    expect(hand(game).length).toBe(before + 1);
  });

  it("-4/-0 instead if you control an outlaw", () => {
    const { game } = table();
    spawn(game, "Rooftop Assassin");
    const angel = spawn(game, "Serra Angel", B);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Take the Fall"), { targets: [ref(angel)] });
    expect(pt(game, angel)).toEqual({ power: 0, toughness: 4 });
  });
});

describe("Shepherd of the Clouds", () => {
  it("returns a permanent card with mana value 3 or less to your hand", () => {
    const { game, a } = table();
    const ring = toGraveyard(game, "Sol Ring");
    const angel = toGraveyard(game, "Serra Angel");
    const shock = toGraveyard(game, "Shock");
    const bears = toGraveyard(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [ring]);
    enter(game, "Shepherd of the Clouds");
    expect(seen.offered[0]).toContain(ring);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).not.toContain(angel);
    expect(seen.offered[0]).not.toContain(shock);
    expect(zone(game, ring)).toBe("hand");
  });

  it("to the battlefield instead if you control a Mount", () => {
    const { game, a } = table();
    spawn(game, "Bulwark Ox");
    const ring = toGraveyard(game, "Sol Ring");
    pickTargets(a, ring);
    enter(game, "Shepherd of the Clouds");
    expect(zone(game, ring)).toBe("battlefield");
  });
});

describe("Armored Armadillo", () => {
  it("{3}{W}: +X/+0 where X is its toughness as it resolves", () => {
    const { game } = table();
    const armadillo = spawn(game, "Armored Armadillo");
    lands(game, "Plains", 4);
    activate(game, armadillo);
    expect(pt(game, armadillo)).toEqual({ power: 4, toughness: 4 });
    // Fixed once it resolves: a later toughness change doesn't move it.
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 0, toughness: 2, duration: "end-of-turn" }, [
      ref(armadillo),
    ]);
    expect(pt(game, armadillo)).toEqual({ power: 4, toughness: 6 });
  });

  it("has ward {1}", () => {
    const { game } = table();
    const armadillo = spawn(game, "Armored Armadillo");
    nextTurn(game);
    lands(game, "Mountain", 1, B);
    cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(armadillo)] });
    expect(game.state.objects[armadillo].damageMarked).toBe(0);
  });
});
