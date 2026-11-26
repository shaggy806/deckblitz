import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { printedCardName } from "../state.js";
import { B, cast, destroy, lands, pickModes, ref, settle, spawn, table, toHand, toStep } from "./harness.js";

/**
 * A rules audit's sixth slice (2026-11-26): a commander that is part of a
 * merged (mutate, rule 730) or melded (701.42) permanent. 903.3c: the merged
 * permanent is that player's commander. 903.9c: put into the command zone
 * from it, only the commander card goes there, the rest to the zone it was
 * headed for.
 */

const ON_TOP = 0;
const UNDER = 1;
const BROKKOS = "Brokkos, Apex of Forever";

/** Every object of that name, wherever it is. */
const where = (game: Game, name: string): string[] =>
  Object.values(game.state.objects)
    .filter((o) => o.cardName === name)
    .map((o) => o.zone)
    .sort();

/** Alice's Brokkos, her commander, cast from the command zone for its
 * mutate cost onto her Grizzly Bears, over or under. */
function brokkosOnBears(side: number): { game: Game; bears: ObjectId } {
  const { game, a } = table({ commanders: [BROKKOS] });
  const brokkos = game.state.zones.shared.command.find((id) => game.state.objects[id].cardName === BROKKOS)!;
  const bears = spawn(game, "Grizzly Bears");
  lands(game, "Forest", 3);
  lands(game, "Swamp", 2);
  pickModes(a, side);
  cast(game, brokkos, { overload: true, targets: [ref(bears)] });
  settle(game);
  return { game, bears };
}

describe("merged and melded commanders, audited", () => {
  it("a commander mutated on top of a creature: the merged permanent is the commander (rule 903.3c)", () => {
    const { game, bears } = brokkosOnBears(ON_TOP);
    expect(printedCardName(game.state.objects[bears])).toBe(BROKKOS);
    expect(game.state.objects[bears].isCommander).toBe(true);
  });

  it("a commander mutated under a creature: still the commander, though it shows the other card (rule 903.3c)", () => {
    const { game, bears } = brokkosOnBears(UNDER);
    expect(printedCardName(game.state.objects[bears])).toBe("Grizzly Bears");
    expect(game.state.objects[bears].isCommander).toBe(true);
  });

  it("the merged commander dies: the commander card may go to the command zone, the other stays in the graveyard (rules 903.9a, 730.3)", () => {
    for (const side of [ON_TOP, UNDER]) {
      const { game, bears } = brokkosOnBears(side);
      destroy(game, bears);
      toStep(game, "postcombat-main");
      expect(where(game, BROKKOS)).toEqual(["command"]);
      expect(where(game, "Grizzly Bears")).toEqual(["graveyard"]);
    }
  });

  it("the merged commander bounced: the commander card to the command zone, the other to hand (rule 903.9c)", () => {
    for (const side of [ON_TOP, UNDER]) {
      const { game, bears } = brokkosOnBears(side);
      game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(bears)]);
      settle(game);
      expect(where(game, BROKKOS)).toEqual(["command"]);
      expect(where(game, "Grizzly Bears")).toEqual(["hand"]);
    }
  });

  it("a creature mutated onto the commander: merged, still the commander; dying, only the commander goes to the command zone", () => {
    const { game, a } = table({ commanders: [BROKKOS] });
    const brokkos = game.state.zones.shared.command.find((id) => game.state.objects[id].cardName === BROKKOS)!;
    expect(game.debugMove(brokkos, "battlefield")).toBe(true);
    settle(game);
    lands(game, "Forest", 4);
    pickModes(a, ON_TOP);
    cast(game, toHand(game, "Glowstone Recluse"), { overload: true, targets: [ref(brokkos)] });
    const merged = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].merged !== undefined)!;
    expect(game.state.objects[merged].isCommander).toBe(true);
    destroy(game, merged);
    toStep(game, "postcombat-main");
    expect(where(game, BROKKOS)).toEqual(["command"]);
    expect(where(game, "Glowstone Recluse")).toEqual(["graveyard"]);
    const recluse = Object.values(game.state.objects).find((o) => o.cardName === "Glowstone Recluse")!;
    expect(recluse.isCommander).toBe(false);
  });

  it("a melded commander bounced: the commander card to the command zone, the other to hand (rule 903.9c)", () => {
    const { game } = table();
    const rats = spawn(game, "Graf Rats");
    game.state.objects[rats].isCommander = true;
    spawn(game, "Midnight Scavengers");
    toStep(game, "begin-combat");
    settle(game);
    const host = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].melded !== undefined)!;
    expect(game.state.objects[host].isCommander).toBe(true);
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(host)]);
    settle(game);
    expect(where(game, "Graf Rats")).toEqual(["command"]);
    expect(where(game, "Midnight Scavengers")).toEqual(["hand"]);
  });

  it("a melded commander dies: the commander card may go to the command zone, the other stays (rules 903.9a, 712.21)", () => {
    const { game } = table();
    spawn(game, "Graf Rats");
    const scavengers = spawn(game, "Midnight Scavengers");
    game.state.objects[scavengers].isCommander = true;
    toStep(game, "begin-combat");
    settle(game);
    const host = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].melded !== undefined)!;
    destroy(game, host);
    toStep(game, "postcombat-main");
    expect(where(game, "Midnight Scavengers")).toEqual(["command"]);
    expect(where(game, "Graf Rats")).toEqual(["graveyard"]);
  });

  it("the merged commander put into its owner's library: the commander card to the command zone, the other to the library (rule 903.9c)", () => {
    const { game, bears } = brokkosOnBears(UNDER);
    game.debugApplyEffect(B, { kind: "put-on-library", target: 0, position: "top" }, [ref(bears)]);
    settle(game);
    expect(where(game, BROKKOS)).toEqual(["command"]);
    expect(where(game, "Grizzly Bears")).toEqual(["library"]);
  });

  it("commander damage: what the commander dealt before it merged, as the merged permanent, and after, is one count (rule 903.10a)", () => {
    const { game, a } = table({ commanders: [BROKKOS] });
    const brokkos = game.state.zones.shared.command.find((id) => game.state.objects[id].cardName === BROKKOS)!;
    // Brokkos had dealt bob 6 before.
    game.state.players[B].commanderDamageTaken = { [brokkos]: 6 };
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 3);
    lands(game, "Swamp", 2);
    pickModes(a, UNDER);
    cast(game, brokkos, { overload: true, targets: [ref(bears)] });
    settle(game);
    // The merged permanent (a 2/2 Grizzly Bears on top) hits bob for 2.
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toStep(game, "postcombat-main");
    expect(game.state.players[B].commanderDamageTaken).toEqual({ [bears]: 8 });
    // Apart again, the count is the Brokkos card's.
    destroy(game, bears);
    toStep(game, "end");
    const card = Object.values(game.state.objects).find((o) => o.cardName === BROKKOS)!;
    expect(card.zone).toBe("command");
    expect(game.state.players[B].commanderDamageTaken).toEqual({ [card.id]: 8 });
  });
});
