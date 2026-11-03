/**
 * `attack-with`'s exact count and total power, `attacks-player`'s count, and
 * how many attacked as an amount: Alluring Suitor, Desert Were-Worm, Horn of
 * the Mark, Landroval, Grand Warlord Radha, The Earth King.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import { poolCounts } from "../mana.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, attack, cast, enter, hand, keywords, lands, life, named, pt, spawn, table, toHand, toLibrary, tokensNamed, watchTargets } from "./harness.js";

const transformed = (game: Game, id: ObjectId): boolean => game.state.objects[id].face === 1;

/** To this turn's end step, through whatever combats it now has. */
const toEnd = (game: Game): void => game.advanceUntil((s) => s.turn.step === "end" && s.priority.holder === A);

describe("attack-with: exactly N", () => {
  it("Alluring Suitor transforms on exactly two attackers, itself or not", () => {
    const { game, a } = table({ life: 100 });
    const suitor = spawn(game, "Alluring Suitor");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    attack(game, a, bears);
    expect(transformed(game, suitor)).toBe(true);
    expect(pt(game, suitor)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, suitor).has("trample")).toBe(true);
    // Deadly Dancer's {R}{R} has outlasted the combat phase.
    expect(poolCounts(game.state.players[A].manaPool).R).toBe(2);
  });

  it.each([1, 3])("doesn't fire on %i attackers", (n) => {
    const { game, a } = table({ life: 100 });
    const suitor = spawn(game, "Alluring Suitor");
    const bears = Array.from({ length: n }, () => spawn(game, "Grizzly Bears"));
    attack(game, a, bears);
    expect(transformed(game, suitor)).toBe(false);
  });

  it("isn't another player's attack", () => {
    const { game, b } = table({ life: 100 });
    const suitor = spawn(game, "Alluring Suitor");
    const bears = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "precombat-main" && s.priority.holder === B);
    attack(game, b, bears, A);
    expect(transformed(game, suitor)).toBe(false);
    expect(life(game, A)).toBe(96);
  });
});

describe("attack-with: total power", () => {
  it("Desert Were-Worm: 12 power untaps the attackers and adds one combat, the first time only", () => {
    const { game, a } = table({ life: 100 });
    const worm = spawn(game, "Desert Were-Worm");
    lands(game, "Mountain", 6);
    expect(pt(game, worm).power).toBe(12);
    attack(game, a, [worm]);
    // Two combats, not an endless run of them: the second attack is as big,
    // and not the first time.
    expect(game.state.turn.combatPhases).toBe(2);
    expect(life(game, B)).toBe(76);
    expect(game.state.objects[worm].tapped).toBe(true);
  });

  it("11 power isn't enough", () => {
    const { game, a } = table({ life: 100 });
    const worm = spawn(game, "Desert Were-Worm");
    lands(game, "Mountain", 4);
    const other = spawn(game, "Hill Giant");
    attack(game, a, [worm, other]);
    expect(life(game, B)).toBe(89);
    expect(game.state.turn.combatPhases).toBe(1);
  });

  it("adds up every attacker, the Were-Worm attacking or not", () => {
    const { game, a } = table({ life: 100 });
    spawn(game, "Desert Were-Worm");
    const big = [spawn(game, "Craw Wurm"), spawn(game, "Craw Wurm")];
    attack(game, a, big);
    expect(game.state.turn.combatPhases).toBe(2);
  });

  it("a smaller first attack doesn't use it up", () => {
    const { game, a } = table({ life: 100 });
    const worm = spawn(game, "Desert Were-Worm");
    lands(game, "Mountain", 6);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(game.state.turn.combatPhases).toBe(1);
    cast(game, toHand(game, "Relentless Assault"));
    a.declareAttackersFn = () => [{ attacker: worm, defender: B }];
    toEnd(game);
    // The second combat fired it, and that made a third; the third didn't.
    expect(game.state.turn.combatPhases).toBe(3);
  });

  it("an attack that big before the Were-Worm arrived was the first time", () => {
    const { game, a } = table({ life: 100 });
    const big = [spawn(game, "Craw Wurm"), spawn(game, "Craw Wurm")];
    attack(game, a, big);
    expect(game.state.turn.combatPhases).toBe(1);
    spawn(game, "Desert Were-Worm");
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Relentless Assault"));
    toEnd(game);
    expect(game.state.turn.combatPhases).toBe(2);
    expect(life(game, B)).toBe(100 - 24);
  });
});

describe("attacks-player: at least N", () => {
  it("Horn of the Mark fires once per player attacked by two or more", () => {
    const { game, a } = table({ players: 3, life: 100, deck: "Grizzly Bears" });
    spawn(game, "Horn of the Mark");
    const before = hand(game).length;
    const [x, y, z, w] = [1, 2, 3, 4].map(() => spawn(game, "Hill Giant"));
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    a.declareAttackersFn = () => [
      { attacker: x, defender: B },
      { attacker: y, defender: B },
      { attacker: z, defender: C },
      { attacker: w, defender: C },
    ];
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.priority.holder === A);
    expect(hand(game).length).toBe(before + 2);
  });

  it("two creatures split between two players, or at a planeswalker, don't fire it", () => {
    const { game, a } = table({ players: 3, life: 100, deck: "Grizzly Bears" });
    spawn(game, "Horn of the Mark");
    const walker = spawn(game, "Jace Beleren", B);
    const before = hand(game).length;
    const [x, y, z] = [1, 2, 3].map(() => spawn(game, "Hill Giant"));
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    a.declareAttackersFn = () => [
      { attacker: x, defender: B },
      { attacker: y, defender: C },
      { attacker: z, defender: walker },
    ];
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.priority.holder === A);
    expect(hand(game).length).toBe(before);
    expect(life(game, B)).toBe(97);
    expect(life(game, C)).toBe(97);
  });

  it("Landroval: target attacking creature without flying gains flying", () => {
    const { game, a } = table({ life: 100 });
    const landroval = spawn(game, "Landroval, Horizon Witness");
    const x = spawn(game, "Grizzly Bears");
    const y = spawn(game, "Hill Giant");
    const seen = watchTargets(a, () => [y]);
    attack(game, a, [landroval, x, y]);
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([x, y].sort());
    expect(keywords(game, y).has("flying")).toBe(true);
    expect(keywords(game, x).has("flying")).toBe(false);
  });

  it("Landroval's ability doesn't fire on one attacker", () => {
    const { game, a } = table({ life: 100 });
    spawn(game, "Landroval, Horizon Witness");
    const x = spawn(game, "Grizzly Bears");
    attack(game, a, [x]);
    expect(keywords(game, x).has("flying")).toBe(false);
  });
});

describe("how many attacked, as an amount", () => {
  it("Grand Warlord Radha adds that much mana, and it lasts past combat", () => {
    const { game, a } = table({ life: 100 });
    const radha = spawn(game, "Grand Warlord Radha");
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    attack(game, a, [radha, bears, other]);
    const pool = poolCounts(game.state.players[A].manaPool);
    expect(pool.R + pool.G).toBe(3);
  });

  it("The Earth King: up to as many basics as attackers with power 4 or greater", () => {
    const { game, a } = table({ life: 100, deck: "Forest" });
    enter(game, "The Earth King");
    expect(tokensNamed(game, "Bear Token (Green 4/4)", A)).toBe(1);
    const big = [spawn(game, "Craw Wurm"), spawn(game, "Craw Wurm")];
    const small = spawn(game, "Grizzly Bears");
    toLibrary(game, "Forest");
    let most = 0;
    a.chooseFromZoneFn = (_view, eligible, _min, max) => {
      most = max;
      return eligible.slice(0, max);
    };
    attack(game, a, [...big, small]);
    expect(most).toBe(2);
    const forests = named(game, "Forest", A).filter((id) => game.state.objects[id].zone === "battlefield");
    expect(forests.length).toBe(2);
    expect(forests.every((id) => game.state.objects[id].tapped)).toBe(true);
  });
});
