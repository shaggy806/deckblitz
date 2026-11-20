/**
 * A delayed trigger remembering the permanents matching a filter as it's set
 * up (`ObjectSetRef` `{ onBattlefield }`), read by `sacrifice-all`'s `inSet`:
 * Tears of Rage's "attacking creatures you control get +X/+0 … Sacrifice
 * those creatures at the beginning of the next end step" — the creatures the
 * pump affected (rule 611.2c), each only while it's still that object (400.7).
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, lands, pt, spawn, table, toHand, toStep, zone } from "./harness.js";

describe("Tears of Rage", () => {
  it("pumps the attackers by the number attacking and sacrifices only those at the end step", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const ox = spawn(game, "Hill Giant");
    const home = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 4);
    const tears = toHand(game, "Tears of Rage");
    a.declareAttackersFn = () => [bears, ox].map((attacker) => ({ attacker, defender: B }));
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.awaiting === null && s.priority.holder === A);
    cast(game, tears);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(pt(game, ox)).toEqual({ power: 5, toughness: 3 });
    expect(pt(game, home)).toEqual({ power: 2, toughness: 2 });
    // One that came onto the battlefield after it resolved isn't one of them.
    const late = spawn(game, "Grizzly Bears");
    toStep(game, "end", A);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, ox)).toBe("graveyard");
    expect(zone(game, home)).toBe("battlefield");
    expect(zone(game, late)).toBe("battlefield");
  });

  it("can't be cast outside the declare attackers step", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 4);
    const tears = toHand(game, "Tears of Rage");
    toStep(game, "precombat-main");
    expect(() => cast(game, tears)).toThrow();
  });

  it("spares one that left and came back before the end step", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 4);
    const tears = toHand(game, "Tears of Rage");
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.awaiting === null && s.priority.holder === A);
    cast(game, tears);
    game.debugMove(bears, "hand");
    game.debugMove(bears, "battlefield");
    toStep(game, "end", A);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(zone(game, bears)).toBe("battlefield");
  });
});
