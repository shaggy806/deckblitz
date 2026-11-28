/**
 * `xIs: { amount }` — a cost's X defined by the ability's text as an amount
 * read as it's activated (rule 107.3c): "X is the number of sleight counters
 * on this Aura" (Chromatic Armor), Voodoo Doll's `{X}{X}` of its pin counters.
 * And a colour chosen as an ability resolves, kept on the permanent as "the
 * last chosen color" (`choose-value` then `note { word: CHOSEN_COLOR }`), or
 * set into the delayed ability it makes (Zombie Boa).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import { A, B, activate, attack, cast, counters, lands, life, ref, settle, spawn, table, toHand } from "./harness.js";

type Activate = Extract<LegalAction, { kind: "activate-ability" }>;

const offeredX = (game: Game, source: ObjectId, player: PlayerId = A): (number | undefined)[] =>
  game
    .legalActions(player)
    .filter((a): a is Activate => a.kind === "activate-ability" && a.source === source)
    .map((a) => (a.xCost !== undefined && (a.xCost.minX ?? 0) === a.xCost.maxX ? a.xCost.maxX : undefined));

const chooseColor = (game: Game, color: string, player: PlayerId = A): void => {
  game.advanceUntil((s) => s.awaiting?.kind === "choose-creature-type");
  game.dispatch({ type: "choose-creature-type", player, creatureType: color });
};

const hit = (game: Game, source: ObjectId, to: TargetRef, amount: number): void =>
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount, target: 0 }, [to], { source });

describe("Chromatic Armor", () => {
  const armored = () => {
    const t = table();
    const { game } = t;
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 2);
    lands(game, "Island", 4);
    const armor = toHand(game, "Chromatic Armor");
    cast(game, armor, { targets: [ref(bear)], settle: false });
    chooseColor(game, "R");
    settle(game);
    return { ...t, bear, armor };
  };

  it("enters with a sleight counter and prevents damage from the chosen colour only", () => {
    const { game, bear, armor } = armored();
    expect(game.state.objects[armor].attachedTo).toBe(bear);
    expect(counters(game, armor, "sleight")).toBe(1);
    hit(game, spawn(game, "Raging Goblin", B), ref(bear), 1);
    expect(game.state.objects[bear].damageMarked).toBe(0);
    hit(game, spawn(game, "Grizzly Bears", B), ref(bear), 1);
    expect(game.state.objects[bear].damageMarked).toBe(1);
  });

  it("X is its sleight counters: offered at that X alone, and any other refused", () => {
    const { game, armor } = armored();
    expect(offeredX(game, armor)).toEqual([1]);
    expect(() => activate(game, armor, 0, { x: 2 })).toThrow();
    expect(() => activate(game, armor, 0, { x: 0 })).toThrow();
  });

  it("each activation adds a counter, and the colour it chooses is the last chosen", () => {
    const { game, bear, armor } = armored();
    activate(game, armor, 0, { x: 1, settle: false });
    chooseColor(game, "G");
    settle(game);
    expect(counters(game, armor, "sleight")).toBe(2);
    // Red no longer prevented; green is.
    hit(game, spawn(game, "Raging Goblin", B), ref(bear), 1);
    expect(game.state.objects[bear].damageMarked).toBe(1);
    hit(game, spawn(game, "Grizzly Bears", B), ref(bear), 1);
    expect(game.state.objects[bear].damageMarked).toBe(1);
    // Two counters now: X is 2.
    expect(offeredX(game, armor)).toEqual([2]);
  });
});

describe("Voodoo Doll", () => {
  it("{X}{X}: twice its pin counters, dealing that many", () => {
    const { game } = table();
    const doll = spawn(game, "Voodoo Doll");
    game.state.objects[doll].counters.pin = 2;
    const swamps = lands(game, "Swamp", 5);
    expect(offeredX(game, doll)).toEqual([2]);
    expect(() => activate(game, doll, 0, { x: 1, targets: [ref(B)] })).toThrow();
    activate(game, doll, 0, { x: 2, targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(swamps.filter((id) => game.state.objects[id].tapped)).toHaveLength(4);
  });

  it("too few lands for twice its counters: not offered", () => {
    const { game } = table();
    const doll = spawn(game, "Voodoo Doll");
    game.state.objects[doll].counters.pin = 3;
    lands(game, "Swamp", 5);
    expect(offeredX(game, doll)).toEqual([]);
  });

  it("gains a pin each upkeep, and untapped at your end step is destroyed and deals its pins to you", () => {
    const { game } = table();
    const doll = spawn(game, "Voodoo Doll", B);
    game.state.objects[doll].counters.pin = 1;
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "draw");
    expect(counters(game, doll, "pin")).toBe(2);
    game.advanceUntil((s) => s.turn.number === 3);
    expect(game.state.objects[doll].zone).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });

  it("tapped at your end step, nothing happens", () => {
    const { game } = table();
    const doll = spawn(game, "Voodoo Doll");
    game.state.objects[doll].counters.pin = 1;
    lands(game, "Swamp", 2);
    activate(game, doll, 0, { x: 1, targets: [ref(B)] });
    game.advanceUntil((s) => s.turn.step === "end" && s.zones.shared.stack.length === 0 && s.turn.number === 1 && s.priority.holder === A);
    expect(game.state.objects[doll].zone).toBe("battlefield");
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(19);
  });
});

describe("Zombie Boa", () => {
  it("destroys a blocker of the chosen colour, this turn only", () => {
    const { game, a, b } = table();
    const boa = spawn(game, "Zombie Boa");
    lands(game, "Swamp", 2);
    const knight = spawn(game, "White Knight", B);
    activate(game, boa, 0, { settle: false });
    chooseColor(game, "W");
    settle(game);
    b.declareBlockersFn = () => [{ blocker: knight, attacker: boa }];
    attack(game, a, [boa]);
    expect(game.state.objects[knight].zone).toBe("graveyard");
  });

  it("a blocker of another colour is untouched", () => {
    const { game, a, b } = table();
    const boa = spawn(game, "Zombie Boa");
    lands(game, "Swamp", 2);
    const wall = spawn(game, "Wall of Stone", B);
    activate(game, boa, 0, { settle: false });
    chooseColor(game, "W");
    settle(game);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: boa }];
    attack(game, a, [boa]);
    expect(game.state.objects[wall].zone).toBe("battlefield");
  });

  it("each activation's colour is its own, and none lasts into the next turn", () => {
    const { game, a, b } = table();
    const boa = spawn(game, "Zombie Boa");
    lands(game, "Swamp", 4);
    const wall = spawn(game, "Wall of Stone", B);
    activate(game, boa, 0, { settle: false });
    chooseColor(game, "W");
    settle(game);
    activate(game, boa, 0, { settle: false });
    chooseColor(game, "R");
    settle(game);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: boa }];
    attack(game, a, [boa]);
    expect(game.state.objects[wall].zone).toBe("graveyard");
  });

  it("is gone by the next turn", () => {
    const { game, a, b } = table();
    const boa = spawn(game, "Zombie Boa");
    lands(game, "Swamp", 2);
    const wall = spawn(game, "Wall of Stone", B);
    activate(game, boa, 0, { settle: false });
    chooseColor(game, "R");
    settle(game);
    // Through bob's turn to alice's next.
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main" && s.priority.holder === A);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: boa }];
    attack(game, a, [boa]);
    expect(game.state.objects[wall].zone).toBe("battlefield");
  });
});
