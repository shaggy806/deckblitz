/**
 * "Each of those creatures deals damage equal to its toughness to the other"
 * — `fight`'s `byToughness`: both at once, and not a fight — proven on Grim
 * Contest.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, lands, ref, spawn, table, toHand } from "./harness.js";

describe("Grim Contest", () => {
  it("each deals its toughness to the other, and nothing has fought", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Forest", 1);
    const turtle = spawn(game, "Horned Turtle"); // 1/4
    const wurm = spawn(game, "Craw Wurm", B); // 6/4
    const bears = spawn(game, "Grizzly Bears", B);
    const spell = toHand(game, "Grim Contest");
    cast(game, spell, { targets: [ref(turtle), ref(wurm)] });
    // 4 to the wurm (lethal), 4 to the turtle (lethal).
    expect(game.state.objects[wurm].zone).toBe("graveyard");
    expect(game.state.objects[turtle].zone).toBe("graveyard");
    expect(game.eventsOfType("creature-fought").length).toBe(0);
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });

  it("toughness, not power: a 1/4 deals 4 and the 2/2 deals 2", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Forest", 1);
    const turtle = spawn(game, "Horned Turtle");
    const bears = spawn(game, "Grizzly Bears", B);
    const spell = toHand(game, "Grim Contest");
    cast(game, spell, { targets: [ref(turtle), ref(bears)] });
    expect(game.state.objects[bears].zone).toBe("graveyard");
    expect(game.state.objects[turtle].damageMarked).toBe(2);
  });

  it("with one target gone, neither deals or is dealt damage (the ruling)", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Forest", 1);
    const turtle = spawn(game, "Horned Turtle");
    const wurm = spawn(game, "Craw Wurm", B);
    const spell = toHand(game, "Grim Contest");
    cast(game, spell, { targets: [ref(turtle), ref(wurm)], settle: false });
    game.debugMove(turtle, "graveyard");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0);
    expect(game.state.objects[wurm].damageMarked).toBe(0);
    expect(game.state.players[A].life).toBe(20);
  });
});
