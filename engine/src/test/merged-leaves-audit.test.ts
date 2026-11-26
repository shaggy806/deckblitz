import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import { A, B, cast, destroy, enter, lands, pickModes, pickTargets, ref, settle, spawn, table, toHand, toStep } from "./harness.js";

/**
 * A rules audit (2026-11-26): what follows a merged permanent as it leaves
 * the battlefield finds every card it became (rule 730.3c), and a
 * replacement of its move applies to all of them (730.3d).
 */

/** Every object of that name, by zone. */
const where = (game: Game, name: string): string[] =>
  Object.values(game.state.objects)
    .filter((o) => o.cardName === name)
    .map((o) => o.zone)
    .sort();

/** Alice's Glowstone Recluse mutated on top of her Grizzly Bears. */
function merged(): ReturnType<typeof table> & { bears: ReturnType<typeof spawn> } {
  const t = table();
  const bears = spawn(t.game, "Grizzly Bears");
  lands(t.game, "Forest", 4);
  pickModes(t.a, 0);
  cast(t.game, toHand(t.game, "Glowstone Recluse"), { overload: true, targets: [ref(bears)] });
  return { ...t, bears };
}

describe("a merged permanent leaving, audited", () => {
  it("exiled until a Banisher Priest leaves: every card it was comes back, each its own permanent (rule 730.3c)", () => {
    const { game, b, bears } = merged();
    pickTargets(b, bears);
    const priest = enter(game, "Banisher Priest", B);
    expect(where(game, "Grizzly Bears")).toEqual(["exile"]);
    expect(where(game, "Glowstone Recluse")).toEqual(["exile"]);
    destroy(game, priest, A);
    settle(game);
    expect(where(game, "Grizzly Bears")).toEqual(["battlefield"]);
    expect(where(game, "Glowstone Recluse")).toEqual(["battlefield"]);
    const onField = game.state.zones.shared.battlefield.filter((id) =>
      ["Grizzly Bears", "Glowstone Recluse"].includes(game.state.objects[id].cardName),
    );
    expect(onField.length).toBe(2);
    expect(onField.every((id) => game.state.objects[id].controller === A)).toBe(true);
  });

  it("blinked: every card it was returns, each its own permanent (rule 730.3c)", () => {
    const { game, bears } = merged();
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Cloudshift"), { targets: [ref(bears)] });
    expect(where(game, "Grizzly Bears")).toEqual(["battlefield"]);
    expect(where(game, "Glowstone Recluse")).toEqual(["battlefield"]);
  });

  it("dying under Rest in Peace: every card it was is exiled (rule 730.3d)", () => {
    const { game, bears } = merged();
    spawn(game, "Rest in Peace", B);
    destroy(game, bears);
    toStep(game, "postcombat-main");
    expect(where(game, "Grizzly Bears")).toEqual(["exile"]);
    expect(where(game, "Glowstone Recluse")).toEqual(["exile"]);
  });

  it("a merged commander exiled until a Priest leaves: the commander goes home, the other card returns alone (rules 903.9a, 730.3c)", () => {
    const { game, a, b } = table({ commanders: ["Brokkos, Apex of Forever"] });
    const brokkos = game.state.zones.shared.command.find((id) => game.state.objects[id].cardName === "Brokkos, Apex of Forever")!;
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    lands(game, "Swamp", 2);
    pickModes(a, 0);
    cast(game, brokkos, { overload: true, targets: [ref(bears)] });
    pickTargets(b, bears);
    const priest = enter(game, "Banisher Priest", B);
    toStep(game, "postcombat-main");
    expect(where(game, "Brokkos, Apex of Forever")).toEqual(["command"]);
    expect(where(game, "Grizzly Bears")).toEqual(["exile"]);
    destroy(game, priest, A);
    settle(game);
    expect(where(game, "Grizzly Bears")).toEqual(["battlefield"]);
    expect(where(game, "Brokkos, Apex of Forever")).toEqual(["command"]);
  });
});
