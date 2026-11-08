/**
 * Batch 275, group A: cards freed by built keys and by need-key themes step 1
 * (shapes that already existed). One focused test per card with a condition,
 * a replacement, a delayed trigger or a choice.
 */
import { describe, expect, it } from "vitest";
import { computeCharacteristics } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  blockOffer,
  attack,
  cast,
  controller,
  counters,
  destroy,
  graveyard,
  keywords,
  lands,
  life,
  nextTurn,
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
  tokensNamed,
  toStep,
  zone,
} from "./harness.js";

/** Whether the block offer lets `blocker` block `attacker` (a blockable
 * second attacker makes sure the defender is asked at all). */
const canBeBlockedBy = (game: Game, seat: ReturnType<typeof table>["a"], attacker: ObjectId, blocker: ObjectId, defender: PlayerId = B): boolean => {
  const offer = blockOffer(game, seat, [attacker, spawn(game, "Hill Giant", A)], defender);
  return offer.eligible.some((b) => b.blocker === blocker && b.canBlock.includes(attacker));
};
const exiledOf = (game: Game, owner: PlayerId): ObjectId[] =>
  Object.values(game.state.objects)
    .filter((o) => o.zone === "exile" && o.owner === owner)
    .map((o) => o.id);
const colorsOf = (game: Game, id: ObjectId): Iterable<string> => computeCharacteristics(game.state, registryOf(game), id).colors;

describe("Rooftop Storm", () => {
  it("casts a Zombie creature spell for {0}, and nothing else", () => {
    const { game } = table();
    spawn(game, "Rooftop Storm");
    const corpse = toHand(game, "Walking Corpse");
    cast(game, corpse, { altCost: true });
    expect(zone(game, corpse)).toBe("battlefield");
    const bears = toHand(game, "Grizzly Bears");
    expect(() => cast(game, bears, { altCost: true })).toThrow(/refused/);
  });
});

describe("the Defilers", () => {
  it("Defiler of Faith: 2 life for {W}, and a Soldier for the white permanent spell", () => {
    const { game } = table();
    const defiler = spawn(game, "Defiler of Faith");
    const lions = toHand(game, "Savannah Lions");
    cast(game, lions, { optionalLife: [defiler] });
    expect(life(game, A)).toBe(18);
    expect(zone(game, lions)).toBe("battlefield");
    expect(tokensNamed(game, "Soldier Token", A)).toBe(1);
  });

  it("Defiler of Instinct: 1 damage to any target off a red permanent spell", () => {
    const { game, a } = table();
    const defiler = spawn(game, "Defiler of Instinct");
    pickTargets(a, B);
    cast(game, toHand(game, "Raging Goblin"), { optionalLife: [defiler] });
    expect(life(game, B)).toBe(19);
  });

  it("Defiler of Flesh: target creature you control gets +1/+1 and menace", () => {
    const { game, a } = table();
    const defiler = spawn(game, "Defiler of Flesh");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Walking Corpse"), { optionalLife: [defiler] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("menace")).toBe(true);
  });
});

describe("The Master, Transcendent", () => {
  it("returns a milled creature card as a green 3/3 Mutant under your control; not one merely put there", () => {
    const { game } = table();
    const master = spawn(game, "The Master, Transcendent");
    const giant = toLibrary(game, "Hill Giant", B);
    game.debugApplyEffect(A, { kind: "mill", target: 0, amount: 1 }, [ref(B)]);
    settle(game);
    const other = toGraveyard(game, "Grizzly Bears", B);
    expect(() => activate(game, master, 0, { targets: [ref(other)] })).toThrow(/target/i);
    activate(game, master, 0, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("battlefield");
    expect(controller(game, giant)).toBe(A);
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
    expect(subtypes(game, giant)).toEqual(["Mutant"]);
    expect([...colorsOf(game, giant)]).toEqual(["G"]);
  });
});

describe("Zellix, Sanity Flayer", () => {
  it("makes a Horror when a player mills a creature card, not for a mill of none", () => {
    const { game } = table();
    const zellix = spawn(game, "Zellix, Sanity Flayer");
    lands(game, "Wastes", 1);
    toLibrary(game, "Hill Giant", B);
    activate(game, zellix, 0, { targets: [ref(B)] });
    expect(graveyard(game, B).length).toBe(3);
    expect(tokensNamed(game, "Horror Token (Black 1/1)", A)).toBe(1);
    game.debugApplyEffect(A, { kind: "mill", target: 0, amount: 2 }, [ref(B)]);
    settle(game);
    expect(tokensNamed(game, "Horror Token (Black 1/1)", A)).toBe(1);
  });
});

describe("spells cast from anywhere other than your hand", () => {
  it("Sage of the Beyond: a flashback costs {2} less", () => {
    const { game } = table({ deck: "Island" });
    spawn(game, "Sage of the Beyond");
    lands(game, "Island", 1);
    const twice = toGraveyard(game, "Think Twice");
    cast(game, twice, { via: "flashback" });
    expect(zone(game, twice)).toBe("exile");
  });

  it("Savvy Trader: exiles a permanent card from your graveyard that you may play — a land too", () => {
    const { game, a } = table({ deck: "Island" });
    const forest = toGraveyard(game, "Forest");
    pickTargets(a, forest);
    game.debugSpawn("Savvy Trader", A, "battlefield", { announceEntry: true, summoningSick: false });
    settle(game);
    expect(zone(game, forest)).toBe("exile");
    game.dispatch({ type: "play-land", player: A, card: forest });
    settle(game);
    expect(zone(game, forest)).toBe("battlefield");
  });
});

describe("Pir, Imaginative Rascal", () => {
  it("one more of the kind on a permanent you control; not on an opponent's", () => {
    const { game } = table();
    spawn(game, "Pir, Imaginative Rascal");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(mine)]);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(theirs)]);
    game.debugApplyEffect(B, { kind: "add-counter", target: 0, counter: "-1/-1", amount: 1 }, [ref(mine)]);
    settle(game);
    expect(counters(game, mine)).toBe(3);
    expect(counters(game, mine, "-1/-1")).toBe(2);
    expect(counters(game, theirs)).toBe(2);
  });
});

describe("Choreographed Sparks", () => {
  it("copies a creature spell you control: the token has haste and is sacrificed at the end step", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    lands(game, "Mountain", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    cast(game, toHand(game, "Choreographed Sparks"), { modes: [1], targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    const token = game.battlefield.find((id) => game.state.objects[id].isToken && game.state.objects[id].cardName === "Grizzly Bears");
    expect(token).toBeDefined();
    expect(keywords(game, token!).has("haste")).toBe(true);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(0);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("energy triggers", () => {
  it("Aether Revolt: that much damage, plus 2 once a permanent of yours has left this turn", () => {
    const { game, a } = table();
    spawn(game, "Aether Revolt");
    pickTargets(a, B);
    game.debugApplyEffect(A, { kind: "get-energy", amount: 3 });
    settle(game);
    expect(life(game, B)).toBe(17);
    destroy(game, spawn(game, "Memnite"));
    game.debugApplyEffect(A, { kind: "get-energy", amount: 1 });
    settle(game);
    expect(life(game, B)).toBe(14);
  });

  it("Brotherhood Scribe: creatures get +1/+1 for energy during your turn only", () => {
    const { game } = table();
    spawn(game, "Brotherhood Scribe");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "get-energy", amount: 2 });
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    nextTurn(game);
    game.debugApplyEffect(A, { kind: "get-energy", amount: 1 });
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("Fabrication Module: one +1/+1 counter for one gain of three energy", () => {
    const { game, a } = table();
    spawn(game, "Fabrication Module");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    game.debugApplyEffect(A, { kind: "get-energy", amount: 3 });
    settle(game);
    expect(counters(game, bears)).toBe(1);
  });
});

describe("March of Reckless Joy", () => {
  it("exiles the top X cards, and only two of them may be played", () => {
    const { game } = table({ deck: "Mountain" });
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "March of Reckless Joy"), { x: 3 });
    const exiled = exiledOf(game, A);
    expect(exiled).toHaveLength(3);
    game.dispatch({ type: "play-land", player: A, card: exiled[0] });
    settle(game);
    game.dispatch({ type: "play-land", player: A, card: exiled[1] });
    settle(game);
    expect(game.canDispatch({ type: "play-land", player: A, card: exiled[2] })).not.toBeNull();
    expect(zone(game, exiled[2])).toBe("exile");
  });
});

describe("snow and legendary landwalk", () => {
  it("Barbarian Guides: snow landwalk of the chosen type, then back to hand at the next end step", () => {
    const { game, a } = table();
    const guides = spawn(game, "Barbarian Guides");
    const bears = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Grizzly Bears", B);
    spawn(game, "Snow-Covered Swamp", B);
    lands(game, "Mountain", 3);
    a.chooseCreatureTypeFn = () => "Swamp";
    activate(game, guides, 0, { targets: [ref(bears)] });
    expect(canBeBlockedBy(game, a, bears, blocker)).toBe(false);
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("hand");
  });

  it("Barbarian Guides: a non-snow land of the type doesn't make it unblockable", () => {
    const { game, a } = table();
    const guides = spawn(game, "Barbarian Guides");
    const bears = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Grizzly Bears", B);
    spawn(game, "Swamp", B);
    lands(game, "Mountain", 3);
    a.chooseCreatureTypeFn = () => "Swamp";
    activate(game, guides, 0, { targets: [ref(bears)] });
    expect(canBeBlockedBy(game, a, bears, blocker)).toBe(true);
  });

  it("Legions of Lim-Dûl: unblockable against a snow Swamp, not a plain one", () => {
    const snowy = table();
    const legions = spawn(snowy.game, "Legions of Lim-Dûl");
    const blocker = spawn(snowy.game, "Grizzly Bears", B);
    spawn(snowy.game, "Snow-Covered Swamp", B);
    expect(canBeBlockedBy(snowy.game, snowy.a, legions, blocker)).toBe(false);
    const plain = table();
    const legions2 = spawn(plain.game, "Legions of Lim-Dûl");
    const blocker2 = spawn(plain.game, "Grizzly Bears", B);
    spawn(plain.game, "Swamp", B);
    expect(canBeBlockedBy(plain.game, plain.a, legions2, blocker2)).toBe(true);
  });

  it("Livonya Silone: unblockable against a legendary land", () => {
    const { game, a } = table();
    const livonya = spawn(game, "Livonya Silone");
    const blocker = spawn(game, "Grizzly Bears", B);
    spawn(game, "Gaea's Cradle", B);
    expect(canBeBlockedBy(game, a, livonya, blocker)).toBe(false);
  });
});

describe("General Ferrous Rokiric", () => {
  it("makes a red and white Golem for a multicolored spell, and can't be targeted by a monocolored one", () => {
    const { game } = table();
    const rokiric = spawn(game, "General Ferrous Rokiric");
    lands(game, "Mountain", 1);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Lightning Helix"), { targets: [ref(B)] });
    expect(tokensNamed(game, "Golem Token (Red White 4/4)", A)).toBe(1);
    nextTurn(game);
    lands(game, "Mountain", 1, B);
    expect(() => cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(rokiric)] })).toThrow(/target/i);
  });
});

describe("Elenda, Saint of Dusk", () => {
  it("+1/+1 and menace above your starting life, another +5/+5 at ten above", () => {
    const { game } = table();
    const elenda = spawn(game, "Elenda, Saint of Dusk");
    expect(pt(game, elenda)).toEqual({ power: 4, toughness: 4 });
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 });
    settle(game);
    expect(pt(game, elenda)).toEqual({ power: 5, toughness: 5 });
    expect(keywords(game, elenda).has("menace")).toBe(true);
    game.debugApplyEffect(A, { kind: "gain-life", amount: 9 });
    settle(game);
    expect(pt(game, elenda)).toEqual({ power: 10, toughness: 10 });
  });

  it("can't be the target of an opponent's instant", () => {
    const { game } = table();
    const elenda = spawn(game, "Elenda, Saint of Dusk");
    nextTurn(game);
    lands(game, "Mountain", 1, B);
    expect(() => cast(game, toHand(game, "Shock", B), { player: B, targets: [ref(elenda)] })).toThrow(/target/i);
  });
});

describe("until end of combat", () => {
  it("Glyph of Destruction: +10/+0 for the combat, no damage to it, destroyed at the next end step", () => {
    const { game, a, b } = table();
    const wall = spawn(game, "Wall of Stone");
    lands(game, "Mountain", 1);
    nextTurn(game);
    const giant = spawn(game, "Hill Giant", B);
    b.declareAttackersFn = () => [{ attacker: giant, defender: A }];
    a.declareBlockersFn = () => [{ blocker: wall, attacker: giant }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A && s.awaiting === null);
    cast(game, toHand(game, "Glyph of Destruction"), { targets: [ref(wall)] });
    expect(pt(game, wall).power).toBe(10);
    toStep(game, "postcombat-main", B);
    expect(zone(game, giant)).toBe("graveyard");
    expect(game.state.objects[wall].damageMarked).toBe(0);
    expect(pt(game, wall)).toEqual({ power: 0, toughness: 8 });
    toStep(game, "end", B);
    settle(game);
    expect(zone(game, wall)).toBe("graveyard");
  });

  it("Murk Dwellers: +2/+0 unblocked, gone once combat ends", () => {
    const { game, a } = table();
    const dwellers = spawn(game, "Murk Dwellers");
    attack(game, a, [dwellers]);
    expect(life(game, B)).toBe(16);
    expect(pt(game, dwellers)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("linked exile returned under your control", () => {
  it("Prowling Geistcatcher: a sacrificed token adds a counter; a card is exiled and comes back when it leaves", () => {
    const { game } = table();
    const geist = spawn(game, "Prowling Geistcatcher");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 });
    settle(game);
    const soldier = game.battlefield.find((id) => game.state.objects[id].isToken)!;
    game.debugApplyEffect(A, { kind: "sacrifice-target", target: 0 }, [ref(soldier)]);
    settle(game);
    expect(counters(game, geist)).toBe(1);
    game.debugApplyEffect(A, { kind: "sacrifice-target", target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    expect(counters(game, geist)).toBe(1);
    destroy(game, geist);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
  });

  it("Promise of Tomorrow: exiles your creatures that die, and returns them at an end step when you control none", () => {
    const { game } = table();
    const promise = spawn(game, "Promise of Tomorrow");
    const bears = spawn(game, "Grizzly Bears");
    destroy(game, bears);
    expect(zone(game, bears)).toBe("exile");
    toStep(game, "end");
    settle(game);
    expect(zone(game, promise)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
  });

  it("Promise of Tomorrow: stays while you control a creature", () => {
    const { game } = table();
    const promise = spawn(game, "Promise of Tomorrow");
    spawn(game, "Memnite");
    toStep(game, "end");
    settle(game);
    expect(zone(game, promise)).toBe("battlefield");
  });

  it("Cold Storage: exiles a creature of yours and returns it when sacrificed", () => {
    const { game } = table();
    const storage = spawn(game, "Cold Storage");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Wastes", 3);
    activate(game, storage, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    activate(game, storage, 1);
    expect(zone(game, storage)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("Fortune Teller's Talent", () => {
  it("at level 2, plays the top card of your library only once you've cast a spell this turn", () => {
    const { game } = table();
    const talent = spawn(game, "Fortune Teller's Talent");
    game.state.objects[talent].classLevel = 2;
    const forest = toLibrary(game, "Forest");
    expect(game.canDispatch({ type: "play-land", player: A, card: forest })).not.toBeNull();
    cast(game, toHand(game, "Memnite"));
    game.dispatch({ type: "play-land", player: A, card: forest });
    settle(game);
    expect(zone(game, forest)).toBe("battlefield");
  });

  it("at level 1, no play from the top even after a spell", () => {
    const { game } = table();
    spawn(game, "Fortune Teller's Talent");
    const forest = toLibrary(game, "Forest");
    cast(game, toHand(game, "Memnite"));
    expect(game.canDispatch({ type: "play-land", player: A, card: forest })).not.toBeNull();
  });
});
