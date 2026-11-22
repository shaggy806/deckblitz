/**
 * Top-10000 batch 338d (lane replacements-copies): Spider-Woman, Secret
 * Agent's lock — a `prohibit` effect's `untap` act bound to its target and
 * lasting `while-you-control-source`, which stops every untap (not only the
 * untap step's, rule 502.3) until her controller loses her.
 */
import { describe, expect, it } from "vitest";

import { B, enter, nextTurn, pickTargets, settle, spawn, table } from "./harness.js";

describe("top-10000 batch 338d — Spider-Woman, Secret Agent", () => {
  it("taps the creature, which stays tapped through untap steps and untap effects while she stays", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const woman = enter(game, "Spider-Woman, Secret Agent");
    expect(game.state.objects[bears].tapped).toBe(true);
    // An untap effect can't untap it either ("can't become untapped").
    game.debugApplyEffect(B, { kind: "untap", target: 0 }, [{ kind: "object", object: bears }]);
    settle(game);
    expect(game.state.objects[bears].tapped).toBe(true);
    nextTurn(game); // bob's untap step
    expect(game.state.objects[bears].tapped).toBe(true);
    // Once she leaves, the next untap step untaps it.
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [{ kind: "object", object: woman }]);
    settle(game);
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(false);
  });

  it("ends when another player gains control of her", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const woman = enter(game, "Spider-Woman, Secret Agent");
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, duration: "permanent" }, [
      { kind: "object", object: woman },
    ]);
    settle(game);
    expect(game.state.objects[woman].controller).toBe(B);
    nextTurn(game); // bob's untap step
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});
