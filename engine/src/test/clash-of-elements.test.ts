/**
 * Clash of Elements: "Choose target nonland permanent. Its owner may put it on
 * top of their library. If they do, Clash of Elements deals 2 damage to them.
 * If they didn't put the card on top of their library, they put it on the
 * bottom." The owner answers (`as-player` `{ ownerOf: 0 }` around a `may`),
 * not the caster, and not the permanent's controller.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, lands, life, pickModes, ref, spawn, table, toHand, zone } from "./harness.js";

describe("Clash of Elements", () => {
  it("on top if the owner says so, and they're dealt 2 damage [Clash of Elements]", () => {
    const { game, b } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Island", 1);
    lands(game, "Mountain", 2);
    pickModes(b, 0);
    cast(game, toHand(game, "Clash of Elements"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("library");
    expect(game.state.zones.perPlayer[B].library[0]).toBe(giant);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });

  it("on the bottom, and no damage, if the owner declines [Clash of Elements]", () => {
    const { game, b } = table();
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Island", 1);
    lands(game, "Mountain", 2);
    pickModes(b);
    cast(game, toHand(game, "Clash of Elements"), { targets: [ref(giant)] });
    const library = game.state.zones.perPlayer[B].library;
    expect(library[library.length - 1]).toBe(giant);
    expect(life(game, B)).toBe(20);
  });

  it("asks the owner, not the controller, of a stolen permanent [Clash of Elements]", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant", B);
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(giant)]);
    lands(game, "Island", 1);
    lands(game, "Mountain", 2);
    pickModes(a);
    pickModes(b, 0);
    cast(game, toHand(game, "Clash of Elements"), { targets: [ref(giant)] });
    expect(game.state.zones.perPlayer[B].library[0]).toBe(giant);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });
});
