/**
 * "It can't phase in for as long as you control this Saga" (`phase-out`'s
 * `cantPhaseIn`, `PhasedOutStatus.held`): the permanent skips its controller's
 * untap steps (rule 502.1) while the duration lasts, which ends for good the
 * first moment it doesn't (rule 611.2b) — the Saga leaving, changing hands or
 * phasing out (the duration ignores phased-out objects) — and it then phases
 * in at the next one as usual. The Phasing of Zhalfir.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, controller, destroy, lands, nextTurn, pickTargets, ref, settle, spawn, table, toHand, tokensNamed, zone } from "./harness.js";

const phasedOut = (game: Game, id: ObjectId): boolean => zone(game, id) === "phased-out";

/** Alice casts The Phasing of Zhalfir, starting at `chapter`. */
function castZhalfir(game: Game, a: ScriptedController, chapter: string): ObjectId {
  lands(game, "Island", 4);
  a.chooseCreatureTypeFn = () => chapter;
  const saga = toHand(game, "The Phasing of Zhalfir");
  game.dispatch({ type: "cast-spell", player: A, card: saga, targets: [] });
  settle(game);
  return saga;
}

describe("The Phasing of Zhalfir", () => {
  it("chapter I phases out another nonland permanent, which stays out through its controller's untap step", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    castZhalfir(game, a, "1");
    expect(phasedOut(game, bears)).toBe(true);
    nextTurn(game);
    expect(phasedOut(game, bears)).toBe(true);
  });

  it("the permanent phases in at its controller's next untap step once the Saga has left", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const saga = castZhalfir(game, a, "1");
    destroy(game, saga);
    // Not at once: leaving ends the hold, and the untap step brings it back.
    expect(phasedOut(game, bears)).toBe(true);
    nextTurn(game);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("the hold ends for good as the Saga changes hands, even if it comes back", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const saga = castZhalfir(game, a, "1");
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(saga)]);
    settle(game);
    expect(controller(game, saga)).toBe(B);
    game.debugApplyEffect(A, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(saga)]);
    settle(game);
    expect(controller(game, saga)).toBe(A);
    nextTurn(game);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("the hold ends as the Saga phases out", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const saga = castZhalfir(game, a, "1");
    game.debugApplyEffect(A, { kind: "phase-out", target: 0 }, [ref(saga)]);
    settle(game);
    expect(phasedOut(game, saga)).toBe(true);
    nextTurn(game);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("holds both chapters' permanents until chapter III's sacrifice, then they phase in", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const ogre = spawn(game, "Gray Ogre", B);
    pickTargets(a, bears);
    const saga = castZhalfir(game, a, "1");
    // Chapter II, on alice's next turn: the Ogre.
    pickTargets(a, ogre);
    nextTurn(game);
    nextTurn(game);
    settle(game);
    expect(phasedOut(game, bears)).toBe(true);
    expect(phasedOut(game, ogre)).toBe(true);
    nextTurn(game);
    expect(phasedOut(game, bears)).toBe(true);
    expect(phasedOut(game, ogre)).toBe(true);
    // Chapter III: the wrath misses them; then the Saga is sacrificed.
    nextTurn(game);
    settle(game);
    expect(zone(game, saga)).toBe("graveyard");
    expect(phasedOut(game, bears)).toBe(true);
    nextTurn(game);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, ogre)).toBe("battlefield");
  });

  it("does nothing more than phase it out if the Saga is gone as the chapter resolves (rule 611.2b)", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    lands(game, "Island", 4);
    a.chooseCreatureTypeFn = () => "1";
    const saga = toHand(game, "The Phasing of Zhalfir");
    game.dispatch({ type: "cast-spell", player: A, card: saga, targets: [] });
    // The Saga resolves and its chapter I goes on the stack; destroy it in response.
    game.advanceUntil((s) => s.objects[saga]?.zone === "battlefield" && s.zones.shared.stack.length === 1);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(saga)]);
    settle(game);
    expect(zone(game, saga)).toBe("graveyard");
    expect(phasedOut(game, bears)).toBe(true);
    nextTurn(game);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("chapter III destroys all creatures, each controller making a Phyrexian per creature of theirs", () => {
    const { game, a } = table();
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Gray Ogre", B);
    const saga = castZhalfir(game, a, "3");
    expect(tokensNamed(game, "Phyrexian Token (The Phasing of Zhalfir)", A)).toBe(1);
    expect(tokensNamed(game, "Phyrexian Token (The Phasing of Zhalfir)", B)).toBe(2);
    expect(zone(game, saga)).toBe("graveyard");
  });
});
