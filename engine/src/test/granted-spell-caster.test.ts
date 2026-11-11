import { describe, expect, it } from "vitest";
import { A, B, C, activate, cast, lands, life, ref, spawn, table, toHand, zone } from "./harness.js";

// A granted "deals damage to the player who cast [this spell]" trigger
// (`deals-damage`'s `to: "spell-caster"`): the grant writes the caster in as
// the spell resolves — Hellish Rebuke.

const passTo = (game: ReturnType<typeof table>["game"], ...from: readonly (typeof A)[]): void => {
  for (const player of from) game.dispatch({ type: "pass-priority", player });
};

describe("a granted trigger on damage to the player who cast the spell", () => {
  it("fires on damage to the caster, and not on damage to another opponent", () => {
    const { game } = table({ players: 3 });
    lands(game, "Swamp", 3);
    const bobs = spawn(game, "Prodigal Pyromancer", B);
    const bobs2 = spawn(game, "Prodigal Pyromancer", B);
    const carols = spawn(game, "Prodigal Pyromancer", C);
    cast(game, toHand(game, "Hellish Rebuke"));

    // Bob's deals damage to Carol: she didn't cast it.
    passTo(game, A);
    activate(game, bobs, 0, { player: B, targets: [ref(C)] });
    expect(life(game, C)).toBe(19);
    expect(zone(game, bobs)).toBe("battlefield");
    expect(life(game, B)).toBe(20);

    // Bob's other one deals damage to Alice: sacrificed, and Bob loses 2.
    passTo(game, A);
    activate(game, bobs2, 0, { player: B, targets: [ref(A)] });
    expect(life(game, A)).toBe(19);
    expect(zone(game, bobs2)).toBe("graveyard");
    expect(life(game, B)).toBe(18);

    // Carol's too: "you" is the permanent's controller.
    passTo(game, A, B);
    activate(game, carols, 0, { player: C, targets: [ref(A)] });
    expect(zone(game, carols)).toBe("graveyard");
    expect(life(game, C)).toBe(17);
  });

  it("a permanent that arrived after it resolved has no such ability", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Hellish Rebuke"));
    const late = spawn(game, "Prodigal Pyromancer", B);
    passTo(game, A);
    activate(game, late, 0, { player: B, targets: [ref(A)] });
    expect(life(game, A)).toBe(19);
    expect(zone(game, late)).toBe("battlefield");
    expect(life(game, B)).toBe(20);
  });

  it("a copy that wasn't cast grants an ability that never triggers", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Island", 2);
    const bobs = spawn(game, "Prodigal Pyromancer", B);
    const rebuke = toHand(game, "Hellish Rebuke");
    cast(game, rebuke, { settle: false });
    // The copy and the original both grant; only the original's has a caster.
    cast(game, toHand(game, "Twincast"), { targets: [ref(rebuke)] });
    expect(game.state.objects[bobs].modifiers.filter((m) => m.grantsTriggered !== undefined)).toHaveLength(2);
    passTo(game, A);
    activate(game, bobs, 0, { player: B, targets: [ref(A)] });
    expect(zone(game, bobs)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });
});
