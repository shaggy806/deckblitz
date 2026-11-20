import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, cast, lands, ref, spawn, table, toHand, zone } from "./harness.js";

/**
 * Rule 800.4a: what a player owns leaves the game as they do, so a target
 * choice another player has open when they concede stops offering it (and
 * them). A copy keeps the target it has (707.10c); a trigger left with no
 * legal target for a required slot is removed (603.3d).
 */
const asked = (game: Game) => {
  const awaiting = game.state.awaiting;
  if (awaiting?.kind !== "choose-targets") throw new Error(`asked ${awaiting?.kind ?? "nothing"}`);
  return awaiting;
};
const offered = (game: Game): string[] =>
  asked(game).options.flatMap((slot) => slot.map((t) => (t.kind === "object" ? t.object : t.player)));
const passAll = (game: Game): void => {
  for (const p of [A, B, C]) if (game.state.awaiting === null) game.dispatch({ type: "pass-priority", player: p });
};

/** Alice's Twincast copy of her Shock (at bob's Bears) asking for new targets. */
function copyAsking(): { game: Game; bobs: ObjectId; carols: ObjectId } {
  const { game } = table({ players: 3 });
  lands(game, "Mountain", 2);
  lands(game, "Island", 2);
  const bobs = spawn(game, "Grizzly Bears", B);
  const carols = spawn(game, "Grizzly Bears", C);
  cast(game, toHand(game, "Shock"), { targets: [ref(bobs)], settle: false });
  const shock = game.state.zones.shared.stack.at(-1)!;
  cast(game, toHand(game, "Twincast"), { targets: [ref(shock)], settle: false });
  passAll(game);
  expect(offered(game)).toContain(carols);
  expect(offered(game)).toContain(C);
  return { game, bobs, carols };
}

describe("a player concedes while another is choosing targets", () => {
  it("a copy's new targets no longer offer them or what they own", () => {
    const { game, bobs, carols } = copyAsking();
    game.concede(C);
    expect(offered(game)).not.toContain(carols);
    expect(offered(game)).not.toContain(C);
    expect(offered(game)).toContain(bobs);
    const legal = game.legalActions(A).flatMap((a) => ("targetOptions" in a ? a.targetOptions.flat() : []));
    expect(legal.some((t) => t.kind === "object" && t.object === carols)).toBe(false);
    game.dispatch({ type: "choose-targets", player: A, targets: [ref(B)] });
    expect(game.state.awaiting).toBeNull();
  });

  it("a copy whose target left with them keeps it, and the choice stays answerable", () => {
    const { game } = table({ players: 3 });
    lands(game, "Mountain", 2);
    lands(game, "Island", 2);
    const carols = spawn(game, "Grizzly Bears", C);
    cast(game, toHand(game, "Shock"), { targets: [ref(carols)], settle: false });
    const shock = game.state.zones.shared.stack.at(-1)!;
    cast(game, toHand(game, "Twincast"), { targets: [ref(shock)], settle: false });
    passAll(game);
    game.concede(C);
    const now = asked(game);
    // The target it has stays first, kept whether or not it's legal.
    expect(now.options[0][0]).toEqual(ref(carols));
    expect(offered(game)).not.toContain(C);
    game.dispatch({ type: "choose-targets", player: A, targets: [ref(B)] });
    expect(game.state.awaiting).toBeNull();
  });

  it("a trigger's targets no longer offer what they own", () => {
    const { game } = table({ players: 3 });
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Grizzly Bears", C);
    game.debugSpawn("Ravenous Chupacabra", A, "battlefield", { announceEntry: true, summoningSick: false });
    game.advanceUntil((s) => s.awaiting !== null);
    expect(offered(game)).toContain(carols);
    game.concede(C);
    expect(offered(game)).toEqual([bobs]);
    game.dispatch({ type: "choose-targets", player: A, targets: [ref(bobs)] });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(zone(game, bobs)).toBe("graveyard");
  });

  it("a trigger left with no legal target is removed", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Grizzly Bears", C);
    spawn(game, "Hill Giant", C);
    game.debugSpawn("Ravenous Chupacabra", A, "battlefield", { announceEntry: true, summoningSick: false });
    game.advanceUntil((s) => s.awaiting !== null);
    expect(asked(game).options[0]).toHaveLength(2);
    game.concede(C);
    expect(game.state.awaiting).toBeNull();
    expect(game.state.pendingTargetedTrigger).toBeNull();
    expect(game.state.zones.shared.stack).toHaveLength(0);
    expect(game.state.priority.holder).toBe(A);
  });
});
