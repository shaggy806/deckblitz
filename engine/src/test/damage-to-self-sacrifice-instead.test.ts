/**
 * "If damage would be dealt to this creature, sacrifice that many permanents
 * instead" (Dralnu, Lich Lord): a `would-deal-damage` replacement whose
 * `{ effect }` is a `sacrifice` of `"x"` permanents (rules 614.1a, 614.6) —
 * no damage dealt, so nothing that triggers on it sees any.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

import { A, B, activate, attack, cast, graveyard, lands, named, ref, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

describe("Dralnu, Lich Lord", () => {
  it("sacrifices that many permanents instead of being dealt the damage", () => {
    const { game, a } = table();
    const dralnu = spawn(game, "Dralnu, Lich Lord");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    let offered: readonly ObjectId[] = [];
    let asked = 0;
    a.chooseSacrificesFn = (_view, eligible, count) => {
      offered = eligible;
      asked = count;
      return bears.slice(0, count);
    };
    const bolt = toHand(game, "Lightning Bolt");
    lands(game, "Mountain", 1);
    cast(game, bolt, { targets: [ref(dralnu)] });
    settle(game);
    expect(asked).toBe(3);
    expect(offered).toContain(dralnu);
    expect(game.state.objects[dralnu].damageMarked ?? 0).toBe(0);
    expect(zone(game, dralnu)).toBe("battlefield");
    expect(bears.filter((id) => zone(game, id) === "graveyard")).toHaveLength(3);
  });

  it("with fewer permanents than the damage, sacrifices them all, itself included", () => {
    const { game } = table();
    const dralnu = spawn(game, "Dralnu, Lich Lord");
    const bear = spawn(game, "Grizzly Bears");
    const bolt = toHand(game, "Lightning Bolt");
    lands(game, "Mountain", 1);
    cast(game, bolt, { targets: [ref(dralnu)] });
    settle(game);
    expect(zone(game, dralnu)).toBe("graveyard");
    expect(zone(game, bear)).toBe("graveyard");
    expect(named(game, "Dralnu, Lich Lord", A)).toHaveLength(0);
  });

  it("combat damage to it is replaced too: none marked, its controller's permanents go", () => {
    const { game, a, b } = table();
    const dralnu = spawn(game, "Dralnu, Lich Lord", B);
    const own = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
    b.chooseSacrificesFn = (_view, _eligible, count) => own.slice(0, count);
    const bears = spawn(game, "Grizzly Bears");
    b.declareBlockersFn = () => [{ blocker: dralnu, attacker: bears }];
    attack(game, a, [bears]);
    expect(zone(game, dralnu)).toBe("battlefield");
    expect(game.state.objects[dralnu].damageMarked ?? 0).toBe(0);
    expect(graveyard(game, B)).toHaveLength(2);
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("{T}: an instant or sorcery card in your graveyard gains flashback", () => {
    const { game } = table();
    const dralnu = spawn(game, "Dralnu, Lich Lord");
    const bolt = toGraveyard(game, "Lightning Bolt");
    activate(game, dralnu, 0, { targets: [ref(bolt)] });
    expect(game.state.objects[bolt].grantedFlashback?.cost).toBe("{R}");
    lands(game, "Mountain", 1);
    cast(game, bolt, { targets: [ref(B)], via: "flashback" });
    expect(zone(game, bolt)).toBe("exile");
  });
});
