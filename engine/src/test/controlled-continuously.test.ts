/**
 * "Controlled continuously since the turn began": rule 302.6's test as a
 * filter clause, `controlledContinuously`, that works on any permanent —
 * as the source's condition (Rocket Launcher), on a target (Nettling Imp) and
 * on what a player sacrifices (Keldon Twilight).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, attack, cast, lands, life, nextTurn, ref, settle, spawn, table, toHand, toStep, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { GameState } from "../state.js";

/** Alice's priority in `step` of bob's turn 2. */
const onBobsTurn = (game: Game, step: GameState["turn"]["step"]): void => {
  game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === step && s.priority.holder === A);
};

describe("Rocket Launcher: an artifact, asked rule 302.6's question", () => {
  const launch = (launcher: ObjectId) =>
    ({ type: "activate-ability", player: A, source: launcher, abilityIndex: 0, targets: [ref(B)] }) as const;

  const launcherWithMana = (sick = false): { game: Game; launcher: ObjectId } => {
    const { game } = table();
    const launcher = spawn(game, "Rocket Launcher", A, { sick });
    lands(game, "Wastes", 4);
    return { game, launcher };
  };

  it("can't be activated until your next turn has begun, an opponent's in between not counting", () => {
    const { game, launcher } = launcherWithMana(true);
    expect(game.canDispatch(launch(launcher))).not.toBeNull();
    onBobsTurn(game, "precombat-main");
    expect(game.canDispatch(launch(launcher))).not.toBeNull();
    nextTurn(game);
    expect(game.canDispatch(launch(launcher))).toBeNull();
  });

  it("deals its 1 damage and dies at the next end step, not before", () => {
    const { game, launcher } = launcherWithMana();
    activate(game, launcher, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    expect(zone(game, launcher)).toBe("battlefield");
    toStep(game, "end");
    settle(game);
    expect(zone(game, launcher)).toBe("graveyard");
  });

  it("activated in an end step, it lasts until the next one", () => {
    const { game, launcher } = launcherWithMana();
    toStep(game, "end");
    activate(game, launcher, 0, { targets: [ref(B)] });
    game.advanceUntil((s) => s.turn.number === 2);
    expect(zone(game, launcher)).toBe("battlefield");
    game.advanceUntil((s) => s.turn.number === 3);
    expect(zone(game, launcher)).toBe("graveyard");
  });

  it("is usable on an opponent's turn, once you've had it since yours began", () => {
    const { game, launcher } = launcherWithMana();
    onBobsTurn(game, "upkeep");
    expect(game.canDispatch(launch(launcher))).toBeNull();
  });
});

describe("Nettling Imp: a target the active player has controlled since the turn began", () => {
  const offer = (game: Game, imp: ObjectId, target: ObjectId) =>
    game.canDispatch({ type: "activate-ability", player: A, source: imp, abilityIndex: 0, targets: [ref(target)] });

  const board = (): { game: Game; imp: ObjectId; old: ObjectId; b: ReturnType<typeof table>["b"] } => {
    const { game, b } = table();
    const imp = spawn(game, "Nettling Imp");
    const old = spawn(game, "Grizzly Bears", B);
    onBobsTurn(game, "upkeep");
    return { game, imp, old, b };
  };

  it("takes the active player's old creature; not a new one, a Wall or another player's", () => {
    const { game, imp, old } = board();
    expect(offer(game, imp, old)).toBeNull();
    expect(offer(game, imp, spawn(game, "Grizzly Bears", B, { sick: true }))).not.toBeNull();
    expect(offer(game, imp, spawn(game, "Wall of Omens", B))).not.toBeNull();
    expect(offer(game, imp, spawn(game, "Grizzly Bears", A))).not.toBeNull();
  });

  it("not a creature that just changed hands, though it's been on the battlefield for turns", () => {
    const { game, imp } = board();
    const taken = spawn(game, "Grizzly Bears", A);
    lands(game, "Mountain", 3, B);
    game.advanceUntil((s) => s.turn.step === "precombat-main" && s.priority.holder === B);
    cast(game, toHand(game, "Act of Treason", B), { player: B, targets: [ref(taken)] });
    game.advanceUntil((s) => s.turn.step === "begin-combat" && s.priority.holder === A);
    expect(game.state.objects[taken].controller).toBe(B);
    expect(offer(game, imp, taken)).not.toBeNull();
  });

  it("can't be used on your own turn, or once attackers have been declared", () => {
    const { game } = table();
    const imp = spawn(game, "Nettling Imp");
    expect(offer(game, imp, spawn(game, "Grizzly Bears", A))).not.toBeNull();
    const old = spawn(game, "Grizzly Bears", B);
    onBobsTurn(game, "begin-combat");
    expect(offer(game, imp, old)).toBeNull();
    onBobsTurn(game, "postcombat-main");
    expect(offer(game, imp, old)).not.toBeNull();
  });

  it("forces the attack, and a creature that attacked is spared", () => {
    const { game, imp, old, b } = board();
    activate(game, imp, 0, { targets: [ref(old)] });
    expect(game.state.objects[imp].tapped).toBe(true);
    attack(game, b, [old], A);
    expect(game.state.objects[old].attackedThisTurn).toBe(true);
    game.advanceUntil((s) => s.turn.number === 3);
    expect(zone(game, old)).toBe("battlefield");
  });

  it("holds the active player to the attack: a seat that names no attackers still sends it", () => {
    const { game, imp, old } = board();
    activate(game, imp, 0, { targets: [ref(old)] });
    onBobsTurn(game, "postcombat-main");
    expect(game.state.objects[old].attackedThisTurn).toBe(true);
    game.advanceUntil((s) => s.turn.number === 3);
    expect(zone(game, old)).toBe("battlefield");
  });

  it("Norritt works on your own turn too, and its untap takes only a blue creature", () => {
    const { game } = table();
    const norritt = spawn(game, "Norritt");
    const mine = spawn(game, "Grizzly Bears");
    const force = { type: "activate-ability", player: A, source: norritt, abilityIndex: 1, targets: [ref(mine)] } as const;
    expect(game.canDispatch(force)).toBeNull();
    const untap = { type: "activate-ability", player: A, source: norritt, abilityIndex: 0 } as const;
    expect(game.canDispatch({ ...untap, targets: [ref(mine)] })).not.toBeNull();
    const blue = spawn(game, "Coral Merfolk", A, { tapped: true });
    activate(game, norritt, 0, { targets: [ref(blue)] });
    expect(game.state.objects[blue].tapped).toBe(false);
  });

  it("destroys a creature that didn't attack, at the next end step", () => {
    const { game, imp, old } = board();
    activate(game, imp, 0, { targets: [ref(old)] });
    // Tapped, so it can't: the card asks only whether it did.
    game.state.objects[old].tapped = true;
    onBobsTurn(game, "postcombat-main");
    expect(zone(game, old)).toBe("battlefield");
    game.advanceUntil((s) => s.turn.number === 3);
    expect(zone(game, old)).toBe("graveyard");
  });
});

describe("Keldon Twilight: what a player sacrifices", () => {
  it("offers only a creature they've had since the turn began", () => {
    const { game, a } = table();
    spawn(game, "Keldon Twilight");
    const old = spawn(game, "Grizzly Bears");
    const old2 = spawn(game, "Llanowar Elves");
    const fresh = spawn(game, "Grizzly Bears", A, { sick: true });
    let offered: readonly ObjectId[] = [];
    a.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      return [old2];
    };
    toStep(game, "end");
    settle(game);
    expect(zone(game, old2)).toBe("graveyard");
    expect(zone(game, old)).toBe("battlefield");
    expect(zone(game, fresh)).toBe("battlefield");
    expect(offered).toEqual(expect.arrayContaining([old, old2]));
    expect(offered).not.toContain(fresh);
  });

  it("takes nothing from a player with only new creatures, and nothing after an attack", () => {
    const { game } = table();
    spawn(game, "Keldon Twilight");
    const fresh = spawn(game, "Grizzly Bears", A, { sick: true });
    toStep(game, "end");
    settle(game);
    expect(zone(game, fresh)).toBe("battlefield");

    const second = table();
    spawn(second.game, "Keldon Twilight");
    const attacker = spawn(second.game, "Grizzly Bears");
    const other = spawn(second.game, "Grizzly Bears");
    attack(second.game, second.a, [attacker], B);
    toStep(second.game, "end");
    settle(second.game);
    expect(zone(second.game, attacker)).toBe("battlefield");
    expect(zone(second.game, other)).toBe("battlefield");
  });

  it("asks that player, on each player's end step", () => {
    const { game } = table();
    spawn(game, "Keldon Twilight");
    const mine = spawn(game, "Grizzly Bears", A, { sick: true });
    const bobs = spawn(game, "Grizzly Bears", B);
    game.advanceUntil((s) => s.turn.number === 3);
    expect(zone(game, bobs)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
  });
});
