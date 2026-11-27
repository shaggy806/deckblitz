/**
 * "Whenever another creature becomes the target of an ability of a land you
 * control named Labyrinth of Skophos, you may have this creature fight that
 * creature" (Skophos Maze-Warden): `becomes-target`'s `abilitySource`, the
 * targeting ability's source matched as it is (rule 113.7a), then an optional
 * fight (rule 701.14a).
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ScriptedController } from "../controller.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, lands, nextTurn, pickModes, ref, settle, spawn, table, zone } from "./harness.js";

/** Bob's Grizzly Bears attacking alice, at the declare attackers step with
 * alice's priority. */
function bobAttacks(game: Game, b: ScriptedController, holder: PlayerId = A): ObjectId {
  const bears = spawn(game, "Grizzly Bears", B, { sick: false });
  nextTurn(game);
  b.declareAttackersFn = () => [{ attacker: bears, defender: A }];
  game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === holder && s.zones.shared.stack.length === 0 && s.awaiting === null && (s.objects[bears].attacking ?? null) !== null,
  );
  b.declareAttackersFn = () => [];
  return bears;
}

const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked ?? 0;

function labyrinth(game: Game, player: PlayerId): ObjectId {
  lands(game, "Wastes", 4, player);
  return spawn(game, "Labyrinth of Skophos", player);
}

describe("Skophos Maze-Warden", () => {
  it("may fight a creature its controller's Labyrinth of Skophos targets", () => {
    const { game, a, b } = table();
    const warden = spawn(game, "Skophos Maze-Warden", A);
    const lab = labyrinth(game, A);
    const bears = bobAttacks(game, b);
    pickModes(a, 0);
    activate(game, lab, 1, { targets: [ref(bears)] });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(damage(game, warden)).toBe(2);
  });

  it("may decline the fight", () => {
    const { game, a, b } = table();
    const warden = spawn(game, "Skophos Maze-Warden", A);
    const lab = labyrinth(game, A);
    const bears = bobAttacks(game, b);
    pickModes(a);
    activate(game, lab, 1, { targets: [ref(bears)] });
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(damage(game, warden)).toBe(0);
  });

  it("doesn't see an opponent's Labyrinth of Skophos", () => {
    const { game, a, b } = table();
    const warden = spawn(game, "Skophos Maze-Warden", A);
    const lab = labyrinth(game, B);
    const bears = bobAttacks(game, b, B);
    // Alice would fight if asked.
    pickModes(a, 0);
    activate(game, lab, 1, { player: B, targets: [ref(bears)] });
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(damage(game, warden)).toBe(0);
  });
});
