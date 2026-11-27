/**
 * Tawnos's Coffin: "{3}, {T}: Exile target creature and all Auras attached to
 * it. Note the number and kind of counters that were on that creature. When
 * this artifact leaves the battlefield or becomes untapped, return that
 * exiled card to the battlefield under its owner's control tapped with the
 * noted number and kind of counters on it. If you do, return the other exiled
 * cards to the battlefield under their owner's control attached to that
 * permanent." A `flicker` with `withAuras`, `keepCounters`, `tapped` and a
 * "whenever" `returnAt` (becomes untapped, `orLeaves`).
 */
import { describe, expect, it } from "vitest";

import { invalidateComputedCache } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, controller, counters, destroy, lands, ref, settle, spawn, table, zone } from "./harness.js";

function attach(game: Game, aura: ObjectId, host: ObjectId): void {
  game.state.objects[aura].attachedTo = host;
  invalidateComputedCache();
}

function untap(game: Game, id: ObjectId): void {
  game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(id)]);
  settle(game);
}

function coffinOn(game: Game, host: ObjectId): ObjectId {
  const coffin = spawn(game, "Tawnos's Coffin", A);
  lands(game, "Wastes", 3);
  activate(game, coffin, 0, { targets: [ref(host)] });
  return coffin;
}

describe("Tawnos's Coffin", () => {
  it("exiles the creature with its Auras, and returns them tapped with its counters as the Coffin untaps [Tawnos's Coffin]", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    game.state.objects[giant].counters["+1/+1"] = 2;
    game.state.objects[giant].counters["-1/-1"] = 1;
    const armor = spawn(game, "Blanchwood Armor", B);
    attach(game, armor, giant);
    const coffin = coffinOn(game, giant);
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, armor)).toBe("exile");
    expect(game.state.objects[coffin].tapped).toBe(true);

    untap(game, coffin);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(controller(game, giant)).toBe(B);
    expect(counters(game, giant)).toBe(1); // +1/+1 and -1/-1 annihilate (704.5q)
    expect(zone(game, armor)).toBe("battlefield");
    expect(game.state.objects[armor].attachedTo).toBe(giant);
    expect(game.state.objects[armor].tapped).toBe(false);

    // Once: tapping and untapping the Coffin again does nothing more.
    game.state.objects[coffin].tapped = true;
    untap(game, coffin);
    expect(zone(game, giant)).toBe("battlefield");
  });

  it("returns the creature as the Coffin leaves the battlefield [Tawnos's Coffin]", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    game.state.objects[giant].counters["+1/+1"] = 3;
    const coffin = coffinOn(game, giant);
    destroy(game, coffin);
    expect(zone(game, giant)).toBe("battlefield");
    expect(counters(game, giant)).toBe(3);
    expect(game.state.objects[giant].tapped).toBe(true);
  });

  it("a token never returns, and its Auras stay exiled [Tawnos's Coffin]", () => {
    const { game } = table();
    game.debugApplyEffect(B, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    settle(game);
    const token = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].isToken)!;
    const armor = spawn(game, "Blanchwood Armor", B);
    attach(game, armor, token);
    const coffin = coffinOn(game, token);
    expect(zone(game, armor)).toBe("exile");
    untap(game, coffin);
    expect(zone(game, armor)).toBe("exile");
  });

  it("leaves the creature exiled forever if the Coffin left before the ability resolved [Tawnos's Coffin]", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    const coffin = spawn(game, "Tawnos's Coffin", A);
    lands(game, "Wastes", 3);
    activate(game, coffin, 0, { targets: [ref(giant)], settle: false });
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(coffin)]);
    settle(game);
    expect(zone(game, coffin)).toBe("graveyard");
    expect(zone(game, giant)).toBe("exile");
  });
});
