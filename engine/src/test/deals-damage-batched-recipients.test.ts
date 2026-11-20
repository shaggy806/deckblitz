/**
 * "Whenever this deals damage to one or more creatures": a `deals-damage`
 * trigger with a recipient named and `batched`, once per simultaneous damage
 * event however many matching recipients it hit (rule 603.2c) — Briarbridge
 * Patrol (its ruling: once a combat damage step), Arashin War Beast's "one or
 * more blocking creatures". Plus Briarbridge Patrol's end-step put-in, read
 * from the journal's sacrificed Clues.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, attack, lands, named, pickFromZone, settle, spawn, table, toHand, toStep, tokensNamed, zone } from "./harness.js";

const faceDown = (game: Game, player: PlayerId): number =>
  game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].controller === player && game.state.objects[id].faceDown !== undefined)
    .length;

describe("deals damage to one or more recipients, once per event", () => {
  it("Briarbridge Patrol: blocked by two creatures and dealing damage to both, it investigates once", () => {
    const { game, a, b } = table();
    const patrol = spawn(game, "Briarbridge Patrol");
    const elves = spawn(game, "Llanowar Elves", B);
    const lions = spawn(game, "Savannah Lions", B);
    b.declareBlockersFn = () => [
      { blocker: elves, attacker: patrol },
      { blocker: lions, attacker: patrol },
    ];
    attack(game, a, [patrol]);
    expect(zone(game, elves)).toBe("graveyard");
    expect(zone(game, lions)).toBe("graveyard");
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });

  it("Briarbridge Patrol: damage to a player alone doesn't investigate", () => {
    const { game, a } = table();
    const patrol = spawn(game, "Briarbridge Patrol");
    attack(game, a, [patrol]);
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
  });

  it("Arashin War Beast: two blockers dealt combat damage at once manifest one card", () => {
    const { game, a, b } = table();
    const beast = spawn(game, "Arashin War Beast");
    const elves = spawn(game, "Llanowar Elves", B);
    const lions = spawn(game, "Savannah Lions", B);
    b.declareBlockersFn = () => [
      { blocker: elves, attacker: beast },
      { blocker: lions, attacker: beast },
    ];
    attack(game, a, [beast]);
    expect(faceDown(game, A)).toBe(1);
  });
});

describe("Briarbridge Patrol's end step", () => {
  /** A makes `n` Clues and sacrifices each to its own ability. */
  const sacrificeClues = (game: Game, n: number): void => {
    lands(game, "Wastes", 2 * n);
    for (let i = 0; i < n; i++) {
      game.debugApplyEffect(A, { kind: "create-token", token: "Clue Token", count: 1, investigate: true });
      settle(game);
      const [clue] = named(game, "Clue Token", A) as ObjectId[];
      // On another's turn, its active player passes first.
      const holder = game.state.priority.holder;
      if (holder !== null && holder !== A) game.dispatch({ type: "pass-priority", player: holder });
      activate(game, clue);
    }
  };

  it("three Clues sacrificed this turn: at the end step a creature card comes from hand", () => {
    const { game, a } = table();
    spawn(game, "Briarbridge Patrol");
    sacrificeClues(game, 3);
    const giant = toHand(game, "Hill Giant");
    pickFromZone(a, giant);
    toStep(game, "end", A);
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("two Clues aren't enough, and an opponent's end step counts too", () => {
    const { game, a } = table();
    spawn(game, "Briarbridge Patrol");
    sacrificeClues(game, 2);
    const giant = toHand(game, "Hill Giant");
    pickFromZone(a, giant);
    toStep(game, "end", A);
    settle(game);
    expect(zone(game, giant)).toBe("hand");
    // Bob's turn: Alice sacrifices three there, and his end step asks.
    toStep(game, "upkeep", B);
    sacrificeClues(game, 3);
    toStep(game, "end", B);
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
  });
});
