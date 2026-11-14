/**
 * `ActivatedAbility.otherChooserControls` — "You choose target creature an
 * opponent controls, and **that opponent** chooses target creature" (Mogg
 * Assassin): the opponent who chooses (`opponentChoosesTargets`, rules
 * 602.2b, 601.2c) is the controller of the activator's own target, chosen
 * first (the ruling).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { A, B, C, pickTargets, ref, spawn, table, zone } from "./harness.js";

type Offer = Extract<LegalAction, { kind: "activate-ability" }>;

describe("the opponent who chooses controls the activator's target — Mogg Assassin", () => {
  it("offers a variant per opponent with a creature, each with only their creatures", () => {
    const { game } = table({ players: 3 });
    const assassin = spawn(game, "Mogg Assassin");
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", A);
    const offers = game
      .legalActions(A)
      .filter((o): o is Offer => o.kind === "activate-ability" && o.source === assassin);
    // Carol controls no creature: nobody could choose for her slot.
    expect(offers.map((o) => o.otherChooser)).toEqual([B]);
    expect(offers[0].targetSpecs).toHaveLength(1);
    expect(offers[0].targetOptions[0]).toEqual([ref(bears)]);

    const giant = spawn(game, "Hill Giant", C);
    const byChooser = new Map(
      game
        .legalActions(A)
        .filter((o): o is Offer => o.kind === "activate-ability" && o.source === assassin)
        .map((o) => [o.otherChooser, o.targetOptions[0]]),
    );
    expect(byChooser.get(B)).toEqual([ref(bears)]);
    expect(byChooser.get(C)).toEqual([ref(giant)]);
  });

  it("refuses naming an opponent who doesn't control the activator's target", () => {
    const { game } = table({ players: 3 });
    const assassin = spawn(game, "Mogg Assassin");
    const bears = spawn(game, "Grizzly Bears", B);
    spawn(game, "Hill Giant", C);
    const action = { type: "activate-ability", player: A, source: assassin, abilityIndex: 0, targets: [ref(bears)] } as const;
    expect(game.canDispatch({ ...action, otherChooser: C })).not.toBeNull();
    expect(game.canDispatch({ ...action, otherChooser: B })).toBeNull();
  });

  it("that opponent chooses, then the coin destroys one of the two", () => {
    const outcomes = new Set<string>();
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const { game, b } = table({ seed });
      const assassin = spawn(game, "Mogg Assassin");
      const elf = spawn(game, "Llanowar Elves", A);
      const bears = spawn(game, "Grizzly Bears", B);
      pickTargets(b, elf);
      game.dispatch({ type: "activate-ability", player: A, source: assassin, abilityIndex: 0, targets: [ref(bears)], otherChooser: B });
      game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
      const died = [zone(game, bears), zone(game, elf)];
      // Won: Alice's choice (Bob's Bears); lost: Bob's choice (Alice's Elves).
      expect(died.filter((z) => z === "graveyard")).toHaveLength(1);
      outcomes.add(died[0] === "graveyard" ? "won" : "lost");
    }
    expect([...outcomes].sort()).toEqual(["lost", "won"]);
  });
});
