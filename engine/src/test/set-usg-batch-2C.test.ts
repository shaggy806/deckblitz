/**
 * Urza's Saga (USG; B198) — group C.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  enter,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  tokensNamed,
  toStep,
  types,
  zone,
} from "./harness.js";

const eligibleAttackers = (game: Game): readonly ObjectId[] => {
  game.advanceUntil((s) => s.awaiting?.kind === "attackers" || s.result.over);
  const offer = game.legalActions(A).find((x) => x.kind === "declare-attackers");
  return offer?.kind === "declare-attackers" ? offer.eligible : [];
};

describe("Retaliation", () => {
  it("a creature you control gets +1/+1 for each creature blocking it", () => {
    const { game, a, b } = table();
    spawn(game, "Retaliation");
    const bears = spawn(game, "Grizzly Bears");
    const elf1 = spawn(game, "Llanowar Elves", B);
    const elf2 = spawn(game, "Llanowar Elves", B);
    b.declareBlockersFn = () => [
      { blocker: elf1, attacker: bears },
      { blocker: elf2, attacker: bears },
    ];
    attack(game, a, [bears]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Antagonism", () => {
  it("deals 2 to the player whose end step it is unless one of their opponents was dealt damage this turn", () => {
    const { game } = table();
    enter(game, "Antagonism");
    const elf = spawn(game, "Llanowar Elves", B);
    // Alice's turn 1: nobody was dealt damage.
    nextTurn(game);
    expect(life(game, A)).toBe(18);
    // Bob's turn 2: his opponent (alice) is dealt damage, so he takes none.
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(A)], { source: elf });
    settle(game);
    nextTurn(game);
    expect(life(game, B)).toBe(20);
    expect(life(game, A)).toBe(17);
    // Alice's turn 3: only alice herself is dealt damage — not an opponent of hers.
    game.debugApplyEffect(B, { kind: "damage", amount: 1, target: 0 }, [ref(A)], { source: elf });
    settle(game);
    nextTurn(game);
    expect(life(game, A)).toBe(14);
  });
});

describe("Bulwark", () => {
  it("deals the difference between your hand and the target opponent's", () => {
    const { game, a } = table();
    spawn(game, "Bulwark");
    for (let i = 0; i < 4; i++) toHand(game, "Wastes");
    pickTargets(a, B);
    nextTurn(game, "end");
    const diff = hand(game, A).length - hand(game, B).length;
    expect(diff).toBeGreaterThan(0);
    toStep(game, "precombat-main");
    expect(life(game, B)).toBe(20 - diff);
  });
});

describe("Midsummer Revel", () => {
  it("creates a 3/3 Beast for each verse counter it had as it was sacrificed", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const revel = spawn(game, "Midsummer Revel");
    game.state.objects[revel].counters = { ...game.state.objects[revel].counters, verse: 3 };
    activate(game, revel, 0);
    expect(graveyard(game, A)).toContain(revel);
    expect(tokensNamed(game, "3/3 Beast Token", A)).toBe(3);
  });
});

describe("Chimeric Staff", () => {
  it("becomes an X/X Construct artifact creature", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const staff = spawn(game, "Chimeric Staff");
    activate(game, staff, 0, { x: 3 });
    expect(types(game, staff)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, staff)).toEqual(["Construct"]);
    expect(pt(game, staff)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Hidden Herd", () => {
  it("becomes a 3/3 Beast when an opponent plays a nonbasic land, not a basic one", () => {
    const { game } = table();
    const herd = spawn(game, "Hidden Herd");
    nextTurn(game);
    const forest = toHand(game, "Forest", B);
    game.dispatch({ type: "play-land", player: B, card: forest });
    settle(game);
    expect(types(game, herd)).toEqual(["enchantment"]);
    const tower = toHand(game, "Command Tower", B);
    game.dispatch({ type: "play-land", player: B, card: tower });
    settle(game);
    expect(types(game, herd)).toEqual(["creature"]);
    expect(subtypes(game, herd)).toEqual(["Beast"]);
    expect(pt(game, herd)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Electryte", () => {
  it("deals damage equal to its power to each blocking creature after hitting the defending player", () => {
    const { game, a, b } = table();
    const electryte = spawn(game, "Electryte");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    b.declareBlockersFn = () => [{ blocker: giant, attacker: bears }];
    attack(game, a, [electryte, bears]);
    expect(life(game, B)).toBe(17);
    expect(graveyard(game, B)).toContain(giant);
  });
});

describe("Wirecat", () => {
  it("can attack with no enchantment out", () => {
    const { game } = table();
    const cat = spawn(game, "Wirecat");
    expect(eligibleAttackers(game)).toContain(cat);
  });

  it("can't attack while an opponent's enchantment is on the battlefield", () => {
    const { game } = table();
    const cat = spawn(game, "Wirecat");
    spawn(game, "Glorious Anthem", B);
    expect(eligibleAttackers(game)).not.toContain(cat);
  });
});

