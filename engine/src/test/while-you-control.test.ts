/**
 * "For as long as you control ~" (rule 611.2b): the effect ends as the
 * source leaves the battlefield or changes hands — Aladdin, Dragonlord
 * Silumgar, Aegis Angel — and, with "and ~ remains tapped", as it untaps
 * (Rubinia Soulsinger).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, controller, destroy, keywords, lands, nextTurn, pickPermanents, ref, spawn, table } from "./harness.js";

describe("for as long as you control ~", () => {
  it("Aladdin: the artifact goes back when Aladdin changes hands", () => {
    const { game } = table();
    const aladdin = spawn(game, "Aladdin");
    lands(game, "Mountain", 3);
    const rock = spawn(game, "Mind Stone", B);
    activate(game, aladdin, 0, { targets: [ref(rock)] });
    expect(controller(game, rock)).toBe(A);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(aladdin)]);
    expect(controller(game, aladdin)).toBe(B);
    expect(controller(game, rock)).toBe(B);
  });

  it("Aladdin: and when Aladdin leaves the battlefield", () => {
    const { game } = table();
    const aladdin = spawn(game, "Aladdin");
    lands(game, "Mountain", 3);
    const rock = spawn(game, "Mind Stone", B);
    activate(game, aladdin, 0, { targets: [ref(rock)] });
    destroy(game, aladdin);
    expect(controller(game, rock)).toBe(B);
  });

  it("Aegis Angel: indestructible lasts only while you control the Angel", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 6);
    const angel = spawn(game, "Aegis Angel", A, { sick: false });
    // Spawned, its enters trigger isn't fired: grant it as the trigger would.
    game.debugApplyEffect(
      A,
      { kind: "grant-keyword", target: 0, keyword: "indestructible", duration: "while-you-control-source" },
      [ref(bears)],
      { source: angel },
    );
    expect(keywords(game, bears).has("indestructible")).toBe(true);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(angel)]);
    expect(keywords(game, bears).has("indestructible")).toBe(false);
  });

  it("Rubinia Soulsinger: control ends as Rubinia untaps", () => {
    const { game, a } = table();
    const rubinia = spawn(game, "Rubinia Soulsinger");
    const giant = spawn(game, "Hill Giant", B);
    activate(game, rubinia, 0, { targets: [ref(giant)] });
    expect(controller(game, giant)).toBe(A);
    // Kept tapped through Alice's next untap step: still hers.
    pickPermanents(a, rubinia);
    nextTurn(game);
    nextTurn(game);
    expect(controller(game, giant)).toBe(A);
    // Let untap: the Giant goes back.
    pickPermanents(a);
    nextTurn(game);
    nextTurn(game);
    expect(controller(game, giant)).toBe(B);
  });
});
