/**
 * "You may cast target creature card in a graveyard this turn. When you cast
 * it this turn, this creature gains all activated abilities of that card until
 * end of turn" (Havengul Lich — the need key
 * `static:gain-activated-abilities-of-card`): a one-card permission's
 * `whenCast`, a delayed triggered ability of the effect that gave it (rule
 * 603.7) that finds the spell only when it's cast this way (400.7h), on the
 * stack above it (the ruling), its `"source"` the permanent that gave it.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, lands, life, named, nextTurn, ref, settle, spawn, table, toGraveyard, zone } from "./harness.js";

const granted = (game: Game, id: ObjectId) => game.state.objects[id].modifiers.flatMap((m) => m.grantsActivated ?? []);

describe("Havengul Lich", () => {
  it("casts a creature card from an opponent's graveyard, and gains its activated abilities as it's cast", () => {
    const { game } = table();
    const lich = spawn(game, "Havengul Lich");
    lands(game, "Island", 4);
    const sorcerer = toGraveyard(game, "Prodigal Sorcerer", B);
    activate(game, lich, 0, { targets: [ref(sorcerer)] });
    expect(granted(game, lich)).toHaveLength(0);
    // Cast with its ordinary costs (the ruling); the trigger above it
    // resolves first.
    cast(game, sorcerer, { via: "graveyard-permission", settle: false });
    const stack = game.state.zones.shared.stack;
    expect(stack).toHaveLength(2);
    settle(game);
    expect(zone(game, sorcerer)).toBe("battlefield");
    expect(game.state.objects[sorcerer].controller).toBe(A);
    expect(granted(game, lich)).toHaveLength(1);
    // The Lich pings with it.
    activate(game, lich, 1, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    // Until end of turn only.
    nextTurn(game);
    nextTurn(game);
    expect(granted(game, lich)).toHaveLength(0);
  });

  it("gains nothing when the card isn't cast", () => {
    const { game } = table();
    const lich = spawn(game, "Havengul Lich");
    lands(game, "Island", 1);
    const sorcerer = toGraveyard(game, "Prodigal Sorcerer");
    activate(game, lich, 0, { targets: [ref(sorcerer)] });
    expect(game.state.delayedTriggers).toHaveLength(0);
    nextTurn(game);
    nextTurn(game);
    // The permission is gone with the turn.
    lands(game, "Island", 3);
    expect(() => cast(game, sorcerer, { via: "graveyard-permission" })).toThrow();
    expect(granted(game, lich)).toHaveLength(0);
  });

  it("a card cast some other way isn't the one it waits for (400.7h)", () => {
    const { game } = table();
    const lich = spawn(game, "Havengul Lich");
    lands(game, "Island", 1);
    const sorcerer = toGraveyard(game, "Prodigal Sorcerer");
    activate(game, lich, 0, { targets: [ref(sorcerer)] });
    // Another creature spell, from hand: no trigger.
    lands(game, "Forest", 1);
    cast(game, game.debugSpawn("Llanowar Elves", A, "hand"));
    expect(granted(game, lich)).toHaveLength(0);
    expect(named(game, "Llanowar Elves")).toHaveLength(1);
  });

  it("a Lich gone from the battlefield gains nothing, but the card can still be cast", () => {
    const { game } = table();
    const lich = spawn(game, "Havengul Lich");
    lands(game, "Island", 4);
    const sorcerer = toGraveyard(game, "Prodigal Sorcerer");
    activate(game, lich, 0, { targets: [ref(sorcerer)] });
    game.debugMove(lich, "graveyard");
    settle(game);
    cast(game, sorcerer, { via: "graveyard-permission" });
    expect(zone(game, sorcerer)).toBe("battlefield");
    expect(granted(game, lich)).toHaveLength(0);
  });
});
