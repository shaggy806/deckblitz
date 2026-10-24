/**
 * Cards on the rest-of-turn delayed trigger (rule 603.7c — the
 * `delayed-trigger` effect's `at: { whenever }`), group A: one focused test
 * per card, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
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
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  supertypes,
  table,
  toHand,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

/** A real token of alice's (`spawn` of a token's name isn't one). */
function makeToken(game: Game, name: string): ObjectId {
  game.debugApplyEffect(A, { kind: "create-token", token: name, count: 1 }, []);
  settle(game);
  const id = named(game, name, A).at(-1);
  if (id === undefined) throw new Error(`no ${name}`);
  game.state.objects[id].summoningSick = false;
  return id;
}

/** A Saga of alice's whose chapter `chapter` triggers at her next precombat
 * main phase (her next turn), resolved. Spawning it enters it with its first
 * lore counter, so chapter I resolves first, on whatever board there is. */
function sagaAt(game: Game, name: string, chapter: number): ObjectId {
  const saga = spawn(game, name);
  settle(game);
  game.state.objects[saga].counters.lore = chapter - 1;
  nextTurn(game); // bob's
  toStep(game, "precombat-main"); // alice's: the lore counter
  settle(game);
  return saga;
}

describe("Basri Ket's −2", () => {
  it("makes a tapped, attacking Soldier for each nontoken attacker", () => {
    const { game, a } = table();
    const basri = spawn(game, "Basri Ket");
    loyalty(game, basri, -2);
    const bears = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions");
    const elves = spawn(game, "Llanowar Elves");
    const soldier = makeToken(game, "Soldier Token");
    attack(game, a, [bears, lions, elves, soldier]);
    // The token attacker isn't counted: three new Soldiers, each dealing 1.
    expect(tokensNamed(game, "Soldier Token", A)).toBe(4);
    expect(life(game, B)).toBe(20 - 2 - 2 - 1 - 1 - 3);
  });
});

describe("Basri, Devoted Paladin's −1", () => {
  it("puts a counter on each creature that attacks this turn", () => {
    const { game, a } = table();
    const basri = spawn(game, "Basri, Devoted Paladin");
    loyalty(game, basri, -1);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(counters(game, bears)).toBe(1);
    expect(life(game, B)).toBe(17);
  });
});

describe("Battle Cry", () => {
  it("untaps only white creatures, and a creature that blocks gets +0/+1", () => {
    const { game, a, b } = table();
    lands(game, "Plains", 3);
    const lions = spawn(game, "Savannah Lions", A, { tapped: true });
    const wurm = spawn(game, "Craw Wurm", A, { tapped: true });
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Battle Cry"));
    expect(game.state.objects[lions].tapped).toBe(false);
    expect(game.state.objects[wurm].tapped).toBe(true);
    b.declareBlockersFn = () => [{ blocker: theirs, attacker: bears }];
    attack(game, a, [bears]);
    // 2/3 for the turn: it survives the Bears' 2.
    expect(zone(game, theirs)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Battle of Frost and Fire's I", () => {
  it("deals 4 to each non-Giant creature and each planeswalker", () => {
    const { game } = table();
    lands(game, "Island", 4);
    lands(game, "Mountain", 1);
    const giant = spawn(game, "Hill Giant");
    const wurm = spawn(game, "Craw Wurm", B);
    const jace = spawn(game, "Jace Beleren", B);
    cast(game, toHand(game, "Battle of Frost and Fire"));
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, wurm)).toBe("graveyard");
    expect(zone(game, jace)).toBe("graveyard");
  });
});

describe("Don't Move", () => {
  it("destroys tapped creatures, then each creature that becomes tapped until alice's next turn", () => {
    const { game, b } = table();
    lands(game, "Plains", 5);
    const tappedOne = spawn(game, "Grizzly Bears", B, { tapped: true });
    const attacker = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Don't Move"));
    expect(zone(game, tappedOne)).toBe("graveyard");
    expect(zone(game, attacker)).toBe("battlefield");
    nextTurn(game); // bob's: attacking taps it
    b.declareAttackersFn = () => [{ attacker, defender: A }];
    toStep(game, "postcombat-main", B);
    expect(zone(game, attacker)).toBe("graveyard");
  });
});

describe("First Day of Class", () => {
  it("gives each creature entering under your control this turn a counter and haste", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    pickModes(a); // no learn
    cast(game, toHand(game, "First Day of Class"));
    const bears = enter(game, "Grizzly Bears");
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("haste")).toBe(true);
    const theirs = enter(game, "Grizzly Bears", B);
    expect(counters(game, theirs)).toBe(0);
  });
});

describe("Gaze of Pain", () => {
  it("lets an unblocked attacker deal its power to a target creature instead of combat damage", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Gaze of Pain"));
    pickTargets(a, theirs);
    pickModes(a, 0);
    attack(game, a, [bears]);
    expect(zone(game, theirs)).toBe("graveyard");
    expect(life(game, B)).toBe(20);
  });
});

describe("Gnawing Crescendo", () => {
  it("makes a Rat for each nontoken creature of yours that dies this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    const soldier = makeToken(game, "Soldier Token");
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Gnawing Crescendo"));
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    destroy(game, soldier);
    destroy(game, theirs);
    expect(tokensNamed(game, "Rat Token (Can't Block)")).toBe(0);
    destroy(game, bears);
    expect(tokensNamed(game, "Rat Token (Can't Block)", A)).toBe(1);
  });
});

describe("Green Dragon", () => {
  it("destroys a creature an opponent controls that's dealt damage this turn, and not one of yours", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const wurm = spawn(game, "Craw Wurm", B);
    const mine = spawn(game, "Craw Wurm");
    enter(game, "Green Dragon");
    cast(game, toHand(game, "Shock"), { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
    cast(game, toHand(game, "Shock"), { targets: [ref(mine)] });
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Harald Unites the Elves' III", () => {
  it("gives a target creature an opponent controls -1/-1 whenever an Elf you control attacks", () => {
    const { game, a } = table();
    sagaAt(game, "Harald Unites the Elves", 3);
    const elves = spawn(game, "Llanowar Elves");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Craw Wurm", B);
    pickTargets(a, theirs);
    attack(game, a, [elves, bears]);
    // Only the Elf fired it.
    expect(pt(game, theirs)).toEqual({ power: 5, toughness: 3 });
  });
});

describe("Infested Thrinax", () => {
  it("makes Saprolings equal to the power of each nontoken creature of yours that dies", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    enter(game, "Infested Thrinax");
    destroy(game, giant);
    expect(tokensNamed(game, "Saproling Token", A)).toBe(3);
  });
});

describe("Jace, Cunning Castaway's −5", () => {
  it("makes two nonlegendary copies, even as Jace dies of it", () => {
    const { game } = table();
    const jace = spawn(game, "Jace, Cunning Castaway");
    loyalty(game, jace, -5, { atLeast: 5 });
    expect(zone(game, jace)).toBe("graveyard");
    const copies = named(game, "Jace, Cunning Castaway", A);
    expect(copies).toHaveLength(2);
    for (const copy of copies) {
      expect(supertypes(game, copy)).not.toContain("legendary");
      expect(game.state.objects[copy].counters.loyalty).toBe(3);
    }
  });
});

describe("Jaya, Fiery Negotiator's −2", () => {
  it("deals the number of attacking creatures to the −2's target when you attack", () => {
    const { game, a } = table();
    const jaya = spawn(game, "Jaya, Fiery Negotiator");
    const wurm = spawn(game, "Craw Wurm", B);
    const bears = spawn(game, "Grizzly Bears");
    const lions = spawn(game, "Savannah Lions");
    const elves = spawn(game, "Llanowar Elves");
    loyalty(game, jaya, -2, { targets: [ref(wurm)] });
    attack(game, a, [bears, lions, elves]);
    expect(zone(game, wurm)).toBe("battlefield");
    expect(game.state.objects[wurm].damageMarked).toBe(3);
  });
});

describe("Mage Hunters' Onslaught", () => {
  it("costs each creature's controller 1 life as it blocks this turn", () => {
    const { game, a, b } = table();
    lands(game, "Swamp", 4);
    const target = spawn(game, "Grizzly Bears", B);
    const blocker = spawn(game, "Craw Wurm", B);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Mage Hunters' Onslaught"), { targets: [ref(target)] });
    expect(zone(game, target)).toBe("graveyard");
    b.declareBlockersFn = () => [{ blocker, attacker: bears }];
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
  });
});

describe("Mountain Titan", () => {
  it("gets a counter for each black spell you cast this turn after it's activated", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    lands(game, "Swamp", 1);
    const titan = spawn(game, "Mountain Titan");
    activate(game, titan, 0);
    cast(game, toHand(game, "Dark Ritual"));
    expect(counters(game, titan)).toBe(1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(counters(game, titan)).toBe(1);
  });
});

describe("Noxious Assault", () => {
  it("gives a blocking creature's controller a poison counter", () => {
    const { game, a, b } = table();
    lands(game, "Forest", 5);
    const bears = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Noxious Assault"));
    b.declareBlockersFn = () => [{ blocker, attacker: bears }];
    attack(game, a, [bears]);
    expect(game.state.players[B].counters.poison).toBe(1);
    expect(game.state.players[A].counters.poison ?? 0).toBe(0);
  });
});

describe("Origin of the Hidden Ones' III", () => {
  it("makes an attacking Assassin whenever an Assassin you control attacks", () => {
    const { game, a } = table();
    pickTargets(a, A); // chapter I's 4 damage, out of the way
    sagaAt(game, "Origin of the Hidden Ones", 3);
    const girl = spawn(game, "Massacre Girl");
    attack(game, a, [girl]);
    expect(tokensNamed(game, "Assassin Token (Aya of Alexandria)", A)).toBe(1);
    expect(life(game, B)).toBe(20 - 4 - 1);
  });
});

describe("Subira, Tulzidi Caravanner's second ability", () => {
  it("draws for each creature you control with power 2 or less dealing combat damage to a player", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const subira = spawn(game, "Subira, Tulzidi Caravanner");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    activate(game, subira, 1);
    expect(hand(game)).toHaveLength(0);
    attack(game, a, [bears, giant]);
    expect(hand(game)).toHaveLength(1);
  });
});

describe("The Bloodsky Massacre's II", () => {
  it("draws a card and loses 1 life whenever a Berserker attacks", () => {
    const { game, a } = table();
    sagaAt(game, "The Bloodsky Massacre", 2);
    const berserker = named(game, "Demon Berserker Token", A)[0]; // chapter I's
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    attack(game, a, [berserker, bears]);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, A)).toBe(19);
  });
});

describe("The Last Ronin's III", () => {
  it("pumps a creature that attacks alone", () => {
    const { game, a } = table();
    sagaAt(game, "The Last Ronin", 3);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(counters(game, bears)).toBe(3);
    expect(keywords(game, bears).has("indestructible")).toBe(true);
    expect(life(game, B)).toBe(15);
    expect(life(game, A)).toBe(25);
  });
});

describe("The Mirari Conjecture's III", () => {
  it("copies each instant or sorcery spell you cast this turn", () => {
    const { game } = table();
    sagaAt(game, "The Mirari Conjecture", 3);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
  });
});

describe("The Sea Devils' III", () => {
  it("targets a creature the damaged player controls, and deals it that much", () => {
    const { game, a } = table();
    sagaAt(game, "The Sea Devils", 3);
    const salamander = named(game, "Alien Salamander Token", A)[0]; // chapter I's
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Craw Wurm", B);
    const seen = watchTargets(a, () => [theirs]);
    attack(game, a, [salamander]);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([theirs, other]));
    expect(seen.offered[0]).not.toContain(mine);
    expect(zone(game, theirs)).toBe("graveyard");
  });
});

describe("Theoretical Duplication", () => {
  it("copies each nontoken creature entering under an opponent's control this turn", () => {
    const { game } = table();
    lands(game, "Island", 3);
    cast(game, toHand(game, "Theoretical Duplication"));
    enter(game, "Grizzly Bears", B);
    enter(game, "Grizzly Bears", A);
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(1);
    expect(tokensNamed(game, "Grizzly Bears", B)).toBe(0);
  });
});

describe("Warhost's Frenzy", () => {
  it("kicked, draws for each creature of yours that dies this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Warhost's Frenzy"), { kicked: true });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    const before = hand(game).length;
    destroy(game, bears);
    expect(hand(game).length).toBe(before + 1);
  });

  it("unkicked, only pumps", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Warhost's Frenzy"));
    const before = hand(game).length;
    destroy(game, bears);
    expect(hand(game).length).toBe(before);
    expect(graveyard(game)).toContain(bears);
  });
});

describe("Ruinous Waterbending", () => {
  it("with its waterbend paid, gains 1 life for each creature that dies this turn, its own kills included", () => {
    const { game } = table();
    lands(game, "Swamp", 7);
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Savannah Lions", B);
    cast(game, toHand(game, "Ruinous Waterbending"), { kicked: true, waterbend: [] });
    expect(life(game, A)).toBe(23);
  });
});
