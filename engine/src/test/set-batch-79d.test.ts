/**
 * Set walk batch 79, part d (2026-10-15): Avatar: The Last Airbender (TLA), the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import { whyCannotAttack } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  type BlockOffer,
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
  quiet,
  ref,
  settle,
  spawn,
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

/** Alice draws `n` cards (she drew one in her draw step already). */
function draw(game: Game, n: number): void {
  game.debugApplyEffect(A, { kind: "draw", amount: n });
  settle(game);
}

const drawnThisTurn = (game: Game): number => game.state.players[A].cardsDrawnThisTurn;

/** A real token (`spawn` of a token's card isn't one). */
function makeToken(game: Game, name: string, player = A): ObjectId {
  const before = new Set(game.battlefield);
  game.debugApplyEffect(player, { kind: "create-token", token: name, count: 1 });
  settle(game);
  const id = game.battlefield.find((each) => !before.has(each))!;
  game.state.objects[id].summoningSick = false;
  return id;
}

/** Crew `vehicle` (its ability `index`) by tapping `tap`. */
function crewWith(game: Game, vehicle: ObjectId, tap: readonly ObjectId[], index: number): void {
  const action: Action = { type: "activate-ability", player: A, source: vehicle, abilityIndex: index, targets: [], tap };
  const why = game.canDispatch(action);
  if (why !== null) throw new Error(why);
  game.dispatch(action);
  settle(game);
}

describe("Swampsnare Trap", () => {
  it("costs {1} less on a flier, and gives the enchanted creature -5/-3", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Swampsnare Trap"), { targets: [ref(angel)] });
    expect(pt(game, angel)).toEqual({ power: -1, toughness: 1 });
  });

  it("costs its full {2}{B} on a creature without flying", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const ogre = spawn(game, "Gray Ogre", B);
    const trap = toHand(game, "Swampsnare Trap");
    expect(() => cast(game, trap, { targets: [ref(ogre)] })).toThrow();
    lands(game, "Swamp", 1);
    cast(game, trap, { targets: [ref(ogre)] });
    expect(zone(game, ogre)).toBe("graveyard");
  });
});

describe("Sparring Dummy", () => {
  it("mills a card and may put a milled land into its controller's hand", () => {
    const { game, a } = table();
    const dummy = spawn(game, "Sparring Dummy");
    const forest = toLibrary(game, "Forest");
    const picked = pickFromZone(a, forest);
    activate(game, dummy);
    expect(picked.offered).toEqual([forest]);
    expect(zone(game, forest)).toBe("hand");
    expect(life(game)).toBe(20);
  });

  it("may leave the land in the graveyard", () => {
    const { game, a } = table();
    const dummy = spawn(game, "Sparring Dummy");
    const forest = toLibrary(game, "Forest");
    pickFromZone(a);
    activate(game, dummy);
    expect(zone(game, forest)).toBe("graveyard");
  });

  it("gains 2 life when a Lesson card is milled", () => {
    const { game } = table();
    const dummy = spawn(game, "Sparring Dummy");
    const lesson = toLibrary(game, "Earthbending Lesson");
    activate(game, dummy);
    expect(zone(game, lesson)).toBe("graveyard");
    expect(life(game)).toBe(22);
  });
});

describe("Fire Nation Engineer", () => {
  it("puts a counter on another creature or Vehicle you control at your end step if you attacked", () => {
    const { game, a } = table();
    const engineer = spawn(game, "Fire Nation Engineer");
    const bears = spawn(game, "Grizzly Bears");
    const warship = spawn(game, "Fire Nation Warship");
    spawn(game, "Grizzly Bears", B);
    attack(game, a, [bears]);
    const seen = watchTargets(a, () => [warship]);
    toStep(game, "end");
    settle(game);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([bears, warship]));
    expect(seen.offered[0]).not.toContain(engineer);
    expect(counters(game, warship)).toBe(1);
  });

  it("does nothing if you didn't attack", () => {
    const { game } = table();
    spawn(game, "Fire Nation Engineer");
    const bears = spawn(game, "Grizzly Bears");
    toStep(game, "end");
    settle(game);
    expect(counters(game, bears)).toBe(0);
  });
});

describe("Otter-Penguin", () => {
  it("gets +1/+2 and can't be blocked on your second draw of the turn", () => {
    const { game } = table();
    const otter = spawn(game, "Otter-Penguin");
    expect(drawnThisTurn(game)).toBe(1);
    draw(game, 1);
    expect(pt(game, otter)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, otter).has("unblockable")).toBe(true);
    draw(game, 1);
    expect(pt(game, otter)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Sandbender Scavengers", () => {
  it("grows when you sacrifice another permanent", () => {
    const { game } = table();
    const scavengers = spawn(game, "Sandbender Scavengers");
    const treasure = makeToken(game, "Treasure Token");
    activate(game, treasure);
    expect(counters(game, scavengers)).toBe(1);
  });

  it("exiles itself as it dies to return a creature card with mana value up to the power it died with", () => {
    const { game, a } = table();
    const scavengers = spawn(game, "Sandbender Scavengers");
    game.state.objects[scavengers].counters["+1/+1"] = 2;
    const ogre = toGraveyard(game, "Gray Ogre");
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    pickModes(a, 0);
    const seen = watchTargets(a, () => [ogre]);
    destroy(game, scavengers);
    // Power 3 as it died, though the card in exile is a 1/1.
    expect(seen.offered[0]).toEqual(expect.arrayContaining([ogre, bears]));
    expect(seen.offered[0]).not.toContain(giant);
    expect(seen.offered[0]).not.toContain(scavengers);
    expect(zone(game, scavengers)).toBe("exile");
    expect(zone(game, ogre)).toBe("battlefield");
  });

  it("finds nothing to return above the power it died with", () => {
    const { game, a } = table();
    const scavengers = spawn(game, "Sandbender Scavengers");
    const bears = toGraveyard(game, "Grizzly Bears");
    pickModes(a, 0);
    destroy(game, scavengers);
    expect(zone(game, scavengers)).toBe("exile");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("returns nothing if it isn't exiled", () => {
    const { game, a } = table();
    const scavengers = spawn(game, "Sandbender Scavengers");
    const bears = toGraveyard(game, "Grizzly Bears");
    pickModes(a);
    destroy(game, scavengers);
    expect(zone(game, scavengers)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Ostrich-Horse", () => {
  it("puts a milled land into your hand, or else gets a +1/+1 counter", () => {
    const { game, a } = table();
    pickModes(a, 0);
    a.chooseFromZoneFn = (_view, eligible) => [eligible[0]];
    const handBefore = hand(game).length;
    const horse = enter(game, "Ostrich-Horse");
    expect(hand(game)).toHaveLength(handBefore + 1);
    expect(counters(game, horse)).toBe(0);

    pickModes(a);
    const second = enter(game, "Ostrich-Horse");
    expect(hand(game)).toHaveLength(handBefore + 1);
    expect(counters(game, second)).toBe(1);
  });
});

describe("Teo, Spirited Glider", () => {
  it("loots as fliers attack, and a nonland discard puts a counter on a creature you control", () => {
    const { game, a } = table();
    const teo = spawn(game, "Teo, Spirited Glider");
    const bears = toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = () => [bears];
    attack(game, a, [teo]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, teo)).toBe(1);
  });

  it("puts no counter when the discard is a land", () => {
    const { game, a } = table();
    const teo = spawn(game, "Teo, Spirited Glider");
    const handBefore = hand(game).length;
    attack(game, a, [teo]);
    expect(hand(game)).toHaveLength(handBefore);
    expect(counters(game, teo)).toBe(0);
  });

  it("doesn't trigger when only creatures without flying attack", () => {
    const { game, a } = table();
    spawn(game, "Teo, Spirited Glider");
    const bears = spawn(game, "Grizzly Bears");
    const handBefore = hand(game).length;
    attack(game, a, [bears]);
    expect(hand(game)).toHaveLength(handBefore);
  });
});

describe("War Balloon", () => {
  it("is an artifact creature while it has three or more fire counters", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const balloon = spawn(game, "War Balloon");
    activate(game, balloon, 0);
    activate(game, balloon, 0);
    expect(types(game, balloon)).not.toContain("creature");
    activate(game, balloon, 0);
    expect(counters(game, balloon, "fire")).toBe(3);
    expect(types(game, balloon)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(pt(game, balloon)).toEqual({ power: 4, toughness: 3 });
  });

  it("crews 3", () => {
    const { game } = table();
    const balloon = spawn(game, "War Balloon");
    const ogre = spawn(game, "Gray Ogre");
    expect(() => crewWith(game, balloon, [ogre], 1)).toThrow();
    const giant = spawn(game, "Hill Giant");
    crewWith(game, balloon, [giant], 1);
    expect(types(game, balloon)).toContain("creature");
  });
});

describe("Foggy Swamp Spirit Keeper", () => {
  it("makes a Spirit on your second draw of the turn, once", () => {
    const { game } = table();
    spawn(game, "Foggy Swamp Spirit Keeper");
    draw(game, 3);
    expect(tokensNamed(game, "Spirit Token (Colorless, Evasive)", A)).toBe(1);
  });
});

describe("Tundra Tank", () => {
  it("gives a creature you control indestructible as it enters", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    enter(game, "Tundra Tank");
    expect(keywords(game, bears).has("indestructible")).toBe(true);
  });

  it("crews 1, and firebends {R} as it attacks", () => {
    const { game, a } = table();
    const tank = spawn(game, "Tundra Tank");
    const bears = spawn(game, "Grizzly Bears");
    crewWith(game, tank, [bears], 0);
    a.declareAttackersFn = () => [{ attacker: tank, defender: B }];
    game.advanceUntil(
      (s) => s.turn.step === "declare-attackers" && quiet(s) && game.eventsOfType("ability-resolved").length > 0,
    );
    expect(game.state.players[A].manaPool.filter((unit) => unit.type === "R")).toHaveLength(1);
  });
});

describe("First-Time Flyer", () => {
  it("gets +1/+1 while a Lesson card is in your graveyard", () => {
    const { game } = table();
    const flyer = spawn(game, "First-Time Flyer");
    toGraveyard(game, "Grizzly Bears");
    expect(pt(game, flyer)).toEqual({ power: 1, toughness: 2 });
    toGraveyard(game, "Earthbending Lesson", B);
    expect(pt(game, flyer)).toEqual({ power: 1, toughness: 2 });
    toGraveyard(game, "Earthbending Lesson");
    expect(pt(game, flyer)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Cat-Gator", () => {
  it("deals damage equal to the Swamps you control as it enters", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    lands(game, "Swamp", 2, B);
    pickTargets(a, B);
    enter(game, "Cat-Gator");
    expect(life(game, B)).toBe(17);
  });
});

describe("Beetle-Headed Merchants", () => {
  it("may sacrifice another creature or artifact as it attacks to draw and grow", () => {
    const { game, a } = table();
    const merchants = spawn(game, "Beetle-Headed Merchants");
    const ornithopter = spawn(game, "Ornithopter");
    pickModes(a, 0);
    a.choosePermanentsFn = () => [ornithopter];
    a.chooseSacrificesFn = () => [ornithopter];
    const handBefore = hand(game).length;
    attack(game, a, [merchants]);
    expect(zone(game, ornithopter)).toBe("graveyard");
    expect(hand(game)).toHaveLength(handBefore + 1);
    expect(counters(game, merchants)).toBe(1);
  });

  it("does nothing if you don't", () => {
    const { game, a } = table();
    const merchants = spawn(game, "Beetle-Headed Merchants");
    const ornithopter = spawn(game, "Ornithopter");
    pickModes(a);
    const handBefore = hand(game).length;
    attack(game, a, [merchants]);
    expect(zone(game, ornithopter)).toBe("battlefield");
    expect(hand(game)).toHaveLength(handBefore);
    expect(counters(game, merchants)).toBe(0);
  });
});

describe("Merchant of Many Hats", () => {
  it("returns from your graveyard to your hand for {2}{B}", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const merchant = toGraveyard(game, "Merchant of Many Hats");
    activate(game, merchant);
    expect(zone(game, merchant)).toBe("hand");
  });
});

describe("Earth Rumble Wrestlers", () => {
  it("gets +1/+0 and trample once a land entered under your control this turn", () => {
    const { game } = table();
    const wrestlers = spawn(game, "Earth Rumble Wrestlers");
    expect(pt(game, wrestlers)).toEqual({ power: 3, toughness: 4 });
    expect(keywords(game, wrestlers).has("trample")).toBe(false);
    enter(game, "Forest", B);
    expect(pt(game, wrestlers)).toEqual({ power: 3, toughness: 4 });
    enter(game, "Forest");
    expect(pt(game, wrestlers)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, wrestlers).has("trample")).toBe(true);
  });

  it("or while you control a land creature", () => {
    const { game } = table();
    const wrestlers = spawn(game, "Earth Rumble Wrestlers");
    spawn(game, "Dryad Arbor");
    expect(pt(game, wrestlers)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, wrestlers).has("trample")).toBe(true);
  });
});

describe("Earth Kingdom Soldier", () => {
  it("puts a counter on each of up to two creatures you control", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const ogre = spawn(game, "Gray Ogre");
    const theirs = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [bears, ogre]);
    enter(game, "Earth Kingdom Soldier");
    expect(seen.offered[0]).not.toContain(theirs);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, ogre)).toBe(1);
  });
});

describe("Earth Village Ruffians", () => {
  it("earthbends 2 as it dies", () => {
    const { game, a } = table();
    const ruffians = spawn(game, "Earth Village Ruffians");
    const [forest] = lands(game, "Forest", 1);
    pickTargets(a, forest);
    destroy(game, ruffians);
    expect(types(game, forest)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(counters(game, forest)).toBe(2);
    expect(pt(game, forest)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Hog-Monkey", () => {
  it("gives a creature you control with a +1/+1 counter menace at the beginning of combat", () => {
    const { game, a } = table();
    spawn(game, "Hog-Monkey");
    const bears = spawn(game, "Grizzly Bears");
    const countered = spawn(game, "Gray Ogre");
    const other = spawn(game, "Hill Giant");
    game.state.objects[countered].counters["+1/+1"] = 1;
    game.state.objects[other].counters["+1/+1"] = 1;
    const theirs = spawn(game, "Grizzly Bears", B);
    game.state.objects[theirs].counters["+1/+1"] = 1;
    const seen = watchTargets(a, () => [countered]);
    toStep(game, "begin-combat");
    settle(game);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([countered, other]));
    expect(seen.offered[0]).not.toContain(bears);
    expect(seen.offered[0]).not.toContain(theirs);
    expect(keywords(game, countered).has("menace")).toBe(true);
  });

  it("exhausts for two +1/+1 counters, once", () => {
    const { game } = table();
    lands(game, "Swamp", 10);
    const monkey = spawn(game, "Hog-Monkey");
    activate(game, monkey);
    expect(counters(game, monkey)).toBe(2);
    expect(() => activate(game, monkey)).toThrow();
  });
});

describe("Wolfbat", () => {
  it("returns from your graveyard with a finality counter on your second draw, for {B}", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const bat = toGraveyard(game, "Wolfbat");
    pickModes(a, 0);
    draw(game, 1);
    expect(zone(game, bat)).toBe("battlefield");
    expect(counters(game, bat, "finality")).toBe(1);
    destroy(game, bat);
    expect(zone(game, bat)).toBe("exile");
  });

  it("stays put if you don't pay", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const bat = toGraveyard(game, "Wolfbat");
    pickModes(a);
    draw(game, 1);
    expect(zone(game, bat)).toBe("graveyard");
  });
});

describe("Tiger-Dillo", () => {
  it("can't attack unless you control another creature with power 4 or greater", () => {
    const { game } = table();
    const dillo = spawn(game, "Tiger-Dillo");
    expect(whyCannotAttack(game.state, game.registry, A, dillo, B)).not.toBeNull();
    spawn(game, "Serra Angel");
    expect(whyCannotAttack(game.state, game.registry, A, dillo, B)).toBeNull();
  });

  it("can't block unless you control another creature with power 4 or greater", () => {
    const { game, b } = table();
    const dillo = spawn(game, "Tiger-Dillo");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    nextTurn(game);
    const blockers = (offer: BlockOffer): ObjectId[] => offer.eligible.map((e) => e.blocker);
    const offered = blockers(blockOffer(game, b, [theirs], A));
    expect(offered).toContain(bears);
    expect(offered).not.toContain(dillo);

    const { game: second, b: bob } = table();
    const dillo2 = spawn(second, "Tiger-Dillo");
    const angel = spawn(second, "Serra Angel");
    const theirs2 = spawn(second, "Grizzly Bears", B);
    nextTurn(second);
    expect(blockers(blockOffer(second, bob, [theirs2], A))).toEqual(expect.arrayContaining([dillo2, angel]));
  });
});

describe("Tiger-Seal", () => {
  it("taps at your upkeep and untaps on your second draw", () => {
    const { game } = table();
    const seal = spawn(game, "Tiger-Seal");
    toStep(game, "upkeep");
    settle(game);
    expect(game.state.objects[seal].tapped).toBe(true);
    toStep(game, "precombat-main");
    expect(drawnThisTurn(game)).toBe(1);
    expect(game.state.objects[seal].tapped).toBe(true);
    draw(game, 1);
    expect(game.state.objects[seal].tapped).toBe(false);
  });
});

describe("Platypus-Bear", () => {
  it("mills two, and can attack despite defender while a Lesson is in your graveyard", () => {
    const { game } = table();
    const before = graveyard(game).length;
    const bear = enter(game, "Platypus-Bear");
    expect(graveyard(game)).toHaveLength(before + 2);
    expect(whyCannotAttack(game.state, game.registry, A, bear, B)).toMatch(/defender/);
    toGraveyard(game, "Earthbending Lesson");
    expect(whyCannotAttack(game.state, game.registry, A, bear, B)).toBeNull();
  });
});

describe("Vengeful Villagers", () => {
  it("taps the chosen creature, and stuns it if you sacrifice an artifact or creature", () => {
    const { game, a } = table();
    const villagers = spawn(game, "Vengeful Villagers");
    const ornithopter = spawn(game, "Ornithopter");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    a.choosePermanentsFn = () => [ornithopter];
    a.chooseSacrificesFn = () => [ornithopter];
    attack(game, a, [villagers]);
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(zone(game, ornithopter)).toBe("graveyard");
    expect(counters(game, theirs, "stun")).toBe(1);
  });

  it("only taps it when you don't sacrifice", () => {
    const { game, a } = table();
    const villagers = spawn(game, "Vengeful Villagers");
    spawn(game, "Ornithopter");
    const theirs = spawn(game, "Grizzly Bears", B);
    pickModes(a);
    attack(game, a, [villagers]);
    expect(game.state.objects[theirs].tapped).toBe(true);
    expect(counters(game, theirs, "stun")).toBe(0);
  });
});

describe("Foggy Swamp Hunters", () => {
  it("has lifelink and menace once you've drawn two cards this turn", () => {
    const { game } = table();
    const hunters = spawn(game, "Foggy Swamp Hunters");
    expect(keywords(game, hunters).has("lifelink")).toBe(false);
    draw(game, 1);
    expect(keywords(game, hunters).has("lifelink")).toBe(true);
    expect(keywords(game, hunters).has("menace")).toBe(true);
  });
});

describe("Messenger Hawk", () => {
  it("makes a Clue as it enters and gets +2/+0 once you've drawn two cards this turn", () => {
    const { game } = table();
    const hawk = enter(game, "Messenger Hawk");
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    expect(pt(game, hawk)).toEqual({ power: 1, toughness: 2 });
    draw(game, 1);
    expect(pt(game, hawk)).toEqual({ power: 3, toughness: 2 });
    expect(named(game, "Messenger Hawk")).toEqual([hawk]);
  });
});
