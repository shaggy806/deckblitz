/**
 * "You may exile a Human you control and an artifact you control. If you do,
 * …" — a `choose-permanents` with `together.oneEach`: one permanent a slot,
 * offered only when every slot can be filled by a different permanent (rule
 * 608.2d) — Fugitive of the Judoon.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, enter, pickFromZone, pickModes, pickPermanents, ref, settle, spawn, table, toLibrary, toStep, tokensNamed, zone } from "./harness.js";

const HUMAN = "Human Token (ward {2})";

const namedOnBattlefield = (game: Game, ...names: readonly string[]): ObjectId[] =>
  game.state.zones.shared.battlefield.filter((id) => names.includes(game.state.objects[id].cardName));

describe("exile a Human and an artifact, if you may (Fugitive of the Judoon)", () => {
  it("makes its tokens, then exiles the pair and puts a Doctor onto the battlefield", () => {
    const { game, a } = table();
    const doctor = toLibrary(game, "The Tenth Doctor");
    // The draws take these, off the top.
    for (let i = 0; i < 4; i++) toLibrary(game, "Plains");
    const saga = enter(game, "Fugitive of the Judoon");
    expect(tokensNamed(game, HUMAN, A)).toBe(1);
    expect(tokensNamed(game, "Alien Rhino Token", A)).toBe(1);
    toStep(game, "precombat-main");
    settle(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
    pickModes(a, 0);
    const pair = namedOnBattlefield(game, HUMAN, "Clue Token");
    const chose = pickPermanents(a, ...pair);
    pickFromZone(a, doctor);
    toStep(game, "precombat-main");
    settle(game);
    expect(chose.offered).toEqual(expect.arrayContaining(pair));
    expect(tokensNamed(game, HUMAN, A)).toBe(0);
    expect(tokensNamed(game, "Clue Token", A)).toBe(0);
    expect(tokensNamed(game, "Alien Rhino Token", A)).toBe(1);
    expect(zone(game, doctor)).toBe("battlefield");
    expect(zone(game, saga)).toBe("graveyard");
  });

  it("isn't offered with only an Artifact Human to fill both", () => {
    const { game, a } = table();
    const doctor = toLibrary(game, "The Tenth Doctor");
    // The draws take these, off the top.
    for (let i = 0; i < 4; i++) toLibrary(game, "Plains");
    enter(game, "Fugitive of the Judoon");
    toStep(game, "precombat-main");
    settle(game);
    // The Human token and the Clue gone: an Artifact Human is all that's left.
    for (const id of namedOnBattlefield(game, HUMAN, "Clue Token")) {
      game.debugApplyEffect(A, { kind: "exile", target: 0 }, [ref(id)]);
    }
    const sentinel = spawn(game, "Esper Sentinel");
    pickModes(a, 0);
    pickPermanents(a, sentinel);
    pickFromZone(a, doctor);
    toStep(game, "precombat-main");
    settle(game);
    expect(zone(game, sentinel)).toBe("battlefield");
    expect(zone(game, doctor)).toBe("library");
  });

  it("is offered with an Artifact Human and another Human, the Artifact Human for the artifact", () => {
    const { game, a } = table();
    const doctor = toLibrary(game, "The Tenth Doctor");
    // The draws take these, off the top.
    for (let i = 0; i < 4; i++) toLibrary(game, "Plains");
    enter(game, "Fugitive of the Judoon");
    toStep(game, "precombat-main");
    settle(game);
    for (const id of namedOnBattlefield(game, "Clue Token")) {
      game.debugApplyEffect(A, { kind: "exile", target: 0 }, [ref(id)]);
    }
    const sentinel = spawn(game, "Esper Sentinel");
    const [human] = namedOnBattlefield(game, HUMAN);
    pickModes(a, 0);
    pickPermanents(a, sentinel, human);
    pickFromZone(a, doctor);
    toStep(game, "precombat-main");
    settle(game);
    expect(zone(game, sentinel)).toBe("exile");
    expect(zone(game, doctor)).toBe("battlefield");
  });
});
