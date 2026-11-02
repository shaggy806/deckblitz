/**
 * Ending the turn and the combat phase (rule 724): the stack exiled uncountered,
 * waiting triggers gone, state-based actions with no one getting priority, the
 * skip to the cleanup step or the next phase with nothing skipped happening, and
 * what triggered on the way put on the stack there (724.1f, 724.2f).
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import {
  A,
  B,
  activate,
  cast,
  graveyard,
  hand,
  lands,
  life,
  nextTurn,
  pt,
  ref,
  settle,
  spawn,
  type Table,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

/** Everyone passes in turn until the top of the stack has resolved. */
const passAll = (game: Game): void => {
  for (let i = 0; i < 2; i += 1) {
    const holder = game.state.priority.holder;
    if (holder !== null) game.dispatch({ type: "pass-priority", player: holder });
  }
};

/** Bob answers Alice's stack with a Lightning Bolt at her, handing her priority. */
const boltInResponse = (game: Game): ObjectId => {
  const bolt = toHand(game, "Lightning Bolt", B);
  game.dispatch({ type: "pass-priority", player: A });
  cast(game, bolt, { player: B, targets: [ref(A)], settle: false });
  game.dispatch({ type: "pass-priority", player: B });
  return bolt;
};

/** To Alice's declare attackers step, attacks declared, with her priority. */
const attacking = (game: Game, a: Table["a"], attacker: ObjectId): void => {
  a.declareAttackersFn = () => [{ attacker, defender: B }];
  game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.awaiting === null && s.priority.holder === A);
};

const stepsSince = (game: Game, from: number): readonly string[] =>
  game.state.eventLog.slice(from).flatMap((e) => (e.type === "step-began" ? [e.step] : []));

describe("end the turn (rule 724.1)", () => {
  it("exiles the whole stack, uncountered, itself included, and skips to the cleanup step", () => {
    const { game } = table();
    lands(game, "Island", 6);
    lands(game, "Mountain", 1, B);
    const from = game.state.eventLog.length;
    const bolt = boltInResponse(game);
    const stop = toHand(game, "Time Stop");
    cast(game, stop, { settle: false });
    passAll(game);
    expect(zone(game, stop)).toBe("exile");
    expect(zone(game, bolt)).toBe("exile");
    expect(graveyard(game, A)).not.toContain(stop);
    expect(game.state.eventLog.slice(from).some((e) => e.type === "spell-resolved")).toBe(false);
    expect(life(game, A)).toBe(20);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    // Straight to cleanup: no combat, no second main phase, no end step.
    expect(stepsSince(game, from).slice(0, 2)).toEqual(["cleanup", "untap"]);
  });

  it("skips the end step, so 'your next end step' is a later turn's (Glorious End)", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const end = toHand(game, "Glorious End");
    cast(game, end, { settle: false });
    passAll(game);
    expect(zone(game, end)).toBe("exile");
    expect(game.state.players[A].hasLost).toBe(false);
    // Bob's end step isn't hers.
    toStep(game, "end", B);
    expect(game.state.players[A].hasLost).toBe(false);
    expect(game.state.zones.shared.stack.length).toBe(0);
    // Her next one is.
    toStep(game, "end");
    expect(game.state.zones.shared.stack.length).toBe(1);
    game.advanceUntil((s) => s.players[A].hasLost);
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("removes everything from combat and ends this turn's effects", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    lands(game, "Forest", 1);
    const bear = spawn(game, "Grizzly Bears");
    attacking(game, a, bear);
    expect(game.state.objects[bear].attacking).not.toBeNull();
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bear)] });
    expect(pt(game, bear).power).toBe(5);
    cast(game, toHand(game, "Time Stop"), { settle: false });
    passAll(game);
    nextTurn(game);
    expect(game.state.objects[bear].attacking).toBeNull();
    expect(pt(game, bear).power).toBe(2);
    expect(life(game, B)).toBe(20);
  });

  it("asks the active player's discard in the cleanup step it skips to", () => {
    const { game } = table();
    lands(game, "Island", 6);
    game.state.players[A].maxHandSize = 7;
    for (let i = 0; i < 9; i += 1) toHand(game, "Grizzly Bears");
    cast(game, toHand(game, "Time Stop"), { settle: false });
    passAll(game);
    expect(game.state.turn.step).toBe("cleanup");
    expect(game.state.awaiting?.kind).toBe("discard");
    nextTurn(game);
    expect(hand(game, A).length).toBe(7);
    expect(activePlayerOf(game.state)).toBe(B);
  });

  it("makes triggers waiting as it begins cease to exist (724.1a): Ultima's dies triggers", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const artist = spawn(game, "Blood Artist");
    cast(game, toHand(game, "Ultima"), { settle: false });
    passAll(game);
    expect(zone(game, artist)).toBe("graveyard");
    expect(game.state.zones.shared.stack.length).toBe(0);
    expect(game.state.pendingTriggers.length).toBe(0);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);
  });

  it("puts what triggers during it on the stack in the cleanup step, with another cleanup step after (724.1f)", () => {
    const { game } = table();
    lands(game, "Island", 6);
    spawn(game, "Zulaport Cutthroat");
    const doomed = spawn(game, "Grizzly Bears");
    const from = game.state.eventLog.length;
    cast(game, toHand(game, "Time Stop"), { settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    // Lethal damage, for the process's own state-based actions to find.
    game.state.objects[doomed].damageMarked = 2;
    game.dispatch({ type: "pass-priority", player: B });
    expect(zone(game, doomed)).toBe("graveyard");
    expect(game.state.turn.step).toBe("cleanup");
    expect(game.state.zones.shared.stack.length).toBe(1);
    expect(game.state.priority.holder).toBe(A);
    settle(game);
    expect(life(game, A)).toBe(21);
    expect(life(game, B)).toBe(19);
    nextTurn(game);
    expect(stepsSince(game, from).slice(0, 3)).toEqual(["cleanup", "cleanup", "untap"]);
  });

  it("waits for an answer the state-based actions ask, then carries on", () => {
    const { game } = table();
    lands(game, "Island", 6);
    cast(game, toHand(game, "Time Stop"), { settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    spawn(game, "Obeka, Brute Chronologist");
    spawn(game, "Obeka, Brute Chronologist");
    game.dispatch({ type: "pass-priority", player: B });
    expect(game.state.awaiting?.kind).toBe("legend-rule");
    expect(game.state.turn.step).toBe("precombat-main");
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    expect(game.state.endingPhase).toBeUndefined();
  });

  it("takes the combat phases the turn was still owed with it", () => {
    const { game } = table();
    lands(game, "Island", 6);
    game.state.extraCombats = 1;
    const from = game.state.eventLog.length;
    cast(game, toHand(game, "Time Stop"), { settle: false });
    passAll(game);
    nextTurn(game);
    expect(stepsSince(game, from)).not.toContain("begin-combat");
    expect(activePlayerOf(game.state)).toBe(B);
  });

  it("a new cleanup step begins if it happens in one (724.1d)", () => {
    const { game } = table();
    lands(game, "Island", 6);
    spawn(game, "Zulaport Cutthroat");
    const doomed = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Time Stop"), { settle: false });
    game.dispatch({ type: "pass-priority", player: A });
    game.state.objects[doomed].damageMarked = 2;
    game.dispatch({ type: "pass-priority", player: B });
    // In the cleanup step with Zulaport Cutthroat's ability on the stack.
    const second = toHand(game, "Time Stop");
    lands(game, "Island", 6);
    const from = game.state.eventLog.length;
    cast(game, second, { settle: false });
    passAll(game);
    expect(zone(game, second)).toBe("exile");
    expect(game.state.zones.shared.stack.length).toBe(0);
    expect(life(game, A)).toBe(20);
    nextTurn(game);
    expect(stepsSince(game, from).slice(0, 2)).toEqual(["cleanup", "untap"]);
  });

  it("asks the player whose turn it is, whoever activated it (Obeka)", () => {
    const { game, a } = table();
    const obeka = spawn(game, "Obeka, Brute Chronologist", B);
    game.dispatch({ type: "pass-priority", player: A });
    a.chooseModesFn = () => [];
    activate(game, obeka, 0, { player: B, settle: false });
    passAll(game);
    settle(game);
    // Alice said no: still her main phase, the ability gone as usual.
    expect(game.state.turn.step).toBe("precombat-main");
    expect(game.state.zones.shared.stack.length).toBe(0);
    expect(activePlayerOf(game.state)).toBe(A);

    a.chooseModesFn = () => [0];
    game.state.objects[obeka].tapped = false;
    game.dispatch({ type: "pass-priority", player: A });
    activate(game, obeka, 0, { player: B, settle: false });
    passAll(game);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    expect(game.state.zones.shared.stack.length).toBe(0);
  });
});

describe("end the combat phase (rule 724.2)", () => {
  it("removes everything from combat, exiles the stack and goes on to the next phase", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    lands(game, "Mountain", 2, B);
    const bear = spawn(game, "Grizzly Bears");
    attacking(game, a, bear);
    const from = game.state.eventLog.length;
    const bolt = boltInResponse(game);
    const mandate = toHand(game, "Mandate of Peace");
    cast(game, mandate, { settle: false });
    passAll(game);
    expect(game.state.turn.step).toBe("postcombat-main");
    expect(game.state.priority.holder).toBe(A);
    expect(zone(game, mandate)).toBe("exile");
    expect(zone(game, bolt)).toBe("exile");
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);
    expect(game.state.objects[bear].attacking).toBeNull();
    // No damage step, no end of combat step (724.2e).
    expect(stepsSince(game, from)).toEqual(["postcombat-main"]);
    // "Your opponents can't cast spells this turn" outlasts it.
    game.dispatch({ type: "pass-priority", player: A });
    const another = toHand(game, "Lightning Bolt", B);
    expect(game.canDispatch({ type: "cast-spell", player: B, card: another, targets: [ref(A)] })).not.toBeNull();
  });

  it("leaves a turn's additional combat phase owed, and only ends this one", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const bear = spawn(game, "Grizzly Bears");
    attacking(game, a, bear);
    game.state.extraCombats = 1;
    cast(game, toHand(game, "Mandate of Peace"), { settle: false });
    passAll(game);
    expect(game.state.turn.step).toBe("postcombat-main");
    a.declareAttackersFn = () => [];
    game.advanceUntil((s) => s.turn.step === "begin-combat");
    expect(game.state.turn.combatPhases).toBe(2);
  });

  it("can only be cast during combat", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    expect(() => cast(game, toHand(game, "Mandate of Peace"), { settle: false })).toThrow(/can't be cast now/);
  });

  it("does nothing outside a combat phase (724.2g)", () => {
    const { game } = table();
    lands(game, "Mountain", 1, B);
    const bolt = boltInResponse(game);
    const source = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "end-the-combat-phase" }, [], { source });
    expect(zone(game, bolt)).toBe("stack");
    expect(game.state.endingPhase).toBeUndefined();
    expect(game.state.turn.step).toBe("precombat-main");
  });
});
