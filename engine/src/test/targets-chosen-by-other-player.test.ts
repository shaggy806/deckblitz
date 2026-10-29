/**
 * `TriggeredAbility.targetsChosenBy`: "target creature **of defending
 * player's choice**" (Erithizon), "… of **that player's** choice"
 * (Bladegriff Prototype). The `choose-targets` decision is asked of that
 * player as the ability goes on the stack (rule 603.3d, as 700.2e has
 * another player choose a mode), with `targetsFor` its controller: the
 * targets are still the controller's, legal as they'd choose them — "one of
 * your opponents" is the controller's opponents.
 */

import { describe, expect, it } from "vitest";

import { A, B, C, attack, counters, pickTargets, spawn, table, zone } from "./harness.js";

describe("targets chosen by another player", () => {
  it("Erithizon: the defending player picks which creature gets the counter", () => {
    const { game, a, b } = table();
    const erithizon = spawn(game, "Erithizon", A);
    const bears = spawn(game, "Grizzly Bears", B);
    let alicePicked = false;
    a.chooseTargetsFn = () => {
      alicePicked = true;
      return [];
    };
    let offered: readonly unknown[] = [];
    b.chooseTargetsFn = (view, _name, _specs, options) => {
      offered = options[0];
      expect(view.state.awaiting?.kind === "choose-targets" && view.state.awaiting.targetsFor).toBe(A);
      return [{ kind: "object", object: bears }];
    };
    attack(game, a, [erithizon]);
    expect(alicePicked).toBe(false);
    expect(offered.length).toBe(2);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, erithizon)).toBe(0);
  });

  it("Bladegriff Prototype: the damaged player picks among the controller's opponents' nonland permanents", () => {
    const { game, a, b } = table({ players: 3 });
    const griffin = spawn(game, "Bladegriff Prototype", A);
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Grizzly Bears", C);
    const alices = spawn(game, "Grizzly Bears", A);
    let offered: readonly unknown[] = [];
    b.chooseTargetsFn = (_view, _name, _specs, options) => {
      offered = options[0];
      return [{ kind: "object", object: carols }];
    };
    pickTargets(a);
    attack(game, a, [griffin]);
    expect(offered).toEqual(expect.arrayContaining([{ kind: "object", object: bobs }, { kind: "object", object: carols }]));
    expect(offered).not.toContainEqual({ kind: "object", object: alices });
    expect([zone(game, carols), zone(game, bobs), zone(game, alices)]).toEqual(["graveyard", "battlefield", "battlefield"]);
  });
});
