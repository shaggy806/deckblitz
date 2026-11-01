/**
 * How many times an activated ability has been activated this turn (rule
 * 602.5b): "activate no more than twice each turn" (`timesEachTurn`, a
 * number — Pit Imp, Sewer Rats), "no more times each turn than the number of
 * snow Swamps you control" (a count read as it would be activated — Withering
 * Wisps), and "if this ability has been activated four or more times this
 * turn" (the `activated-this-turn` condition — Dragon Whelp).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, life, lands, nextTurn, pt, ref, settle, spawn, table, toStep, zone } from "./harness.js";

const canActivate = (game: Game, source: ObjectId, player = A): boolean =>
  game.legalActions(player).some((a) => a.kind === "activate-ability" && a.source === source);
/** Activate without letting it resolve: on the stack, priority kept. */
const hold = (game: Game, source: ObjectId): void => activate(game, source, 0, { settle: false });

describe("activate no more than N times each turn (timesEachTurn)", () => {
  it("Pit Imp: twice, then no more, and again next turn", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const imp = spawn(game, "Pit Imp");
    activate(game, imp);
    activate(game, imp);
    expect(pt(game, imp).power).toBe(2);
    expect(canActivate(game, imp)).toBe(false);
    expect(() => activate(game, imp)).toThrow(/as many times this turn/);
    nextTurn(game);
    nextTurn(game);
    expect(canActivate(game, imp)).toBe(true);
  });

  it("Pit Imp: activations still on the stack count against the limit", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const imp = spawn(game, "Pit Imp");
    hold(game, imp);
    hold(game, imp);
    expect(canActivate(game, imp)).toBe(false);
    settle(game);
    expect(pt(game, imp).power).toBe(2);
  });

  it("Sewer Rats: three times, each paying 1 life", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const rats = spawn(game, "Sewer Rats");
    activate(game, rats);
    activate(game, rats);
    activate(game, rats);
    expect(pt(game, rats).power).toBe(4);
    expect(life(game)).toBe(17);
    expect(canActivate(game, rats)).toBe(false);
  });

  it("the limit stays with the object through a change of control (602.5b)", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Swamp", 2, B);
    const imp = spawn(game, "Pit Imp");
    const other = spawn(game, "Pit Imp");
    activate(game, imp);
    activate(game, imp);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(imp)]);
    settle(game);
    expect(game.state.objects[imp].controller).toBe(B);
    // Bob gets priority with something on the stack.
    hold(game, other);
    game.dispatch({ type: "pass-priority", player: A });
    expect(game.state.priority.holder).toBe(B);
    expect(game.canDispatch({ type: "activate-ability", player: B, source: imp, abilityIndex: 0, targets: [] })).toMatch(
      /as many times this turn/,
    );
  });
});

describe("a limit read from a count (Withering Wisps)", () => {
  it("as many activations as snow Swamps you control, damaging each creature and each player", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Snow-Covered Swamp", 2);
    const wisps = spawn(game, "Withering Wisps");
    const bear = spawn(game, "Grizzly Bears", B);
    activate(game, wisps);
    expect(life(game, A)).toBe(19);
    expect(life(game, B)).toBe(19);
    activate(game, wisps);
    expect(zone(game, bear)).toBe("graveyard");
    expect(canActivate(game, wisps)).toBe(false);
  });

  it("no snow Swamps, no activations", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const wisps = spawn(game, "Withering Wisps");
    expect(canActivate(game, wisps)).toBe(false);
  });

  it("losing a snow Swamp after activating can leave none to spare", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const [snow] = lands(game, "Snow-Covered Swamp", 2);
    const wisps = spawn(game, "Withering Wisps");
    activate(game, wisps);
    game.debugMove(snow, "graveyard");
    expect(canActivate(game, wisps)).toBe(false);
  });

  it("sacrificed at an end step with no creatures on the battlefield", () => {
    const { game } = table();
    const wisps = spawn(game, "Withering Wisps");
    toStep(game, "end", A);
    settle(game);
    expect(zone(game, wisps)).toBe("graveyard");
  });
});

describe("if this ability has been activated N or more times this turn (Dragon Whelp)", () => {
  it("three activations: no sacrifice at the end step", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const whelp = spawn(game, "Dragon Whelp");
    activate(game, whelp);
    activate(game, whelp);
    activate(game, whelp);
    expect(pt(game, whelp).power).toBe(5);
    nextTurn(game);
    expect(zone(game, whelp)).toBe("battlefield");
  });

  it("the fourth activation sets up the sacrifice at the next end step", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const whelp = spawn(game, "Dragon Whelp");
    for (let i = 0; i < 4; i += 1) activate(game, whelp);
    expect(pt(game, whelp).power).toBe(6);
    expect(zone(game, whelp)).toBe("battlefield");
    nextTurn(game);
    expect(zone(game, whelp)).toBe("graveyard");
  });

  it("with four on the stack at once, the first to resolve already sees four", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const whelp = spawn(game, "Dragon Whelp");
    for (let i = 0; i < 4; i += 1) hold(game, whelp);
    settle(game);
    expect((game.state.delayedTriggers ?? []).length).toBe(4);
  });

  it("the count restarts each turn", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const whelp = spawn(game, "Dragon Whelp");
    activate(game, whelp);
    activate(game, whelp);
    nextTurn(game);
    nextTurn(game);
    activate(game, whelp);
    activate(game, whelp);
    nextTurn(game);
    expect(zone(game, whelp)).toBe("battlefield");
  });
});
