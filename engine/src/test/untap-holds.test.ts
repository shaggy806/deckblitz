/**
 * A permanent held down through the next N untap steps of a chosen player: `tap`'s
 * `doesntUntapSteps` (N) and `untapStepOf` (whose). Telekinesis counts two of its controllers' steps;
 * Reveka, Samite Alchemist and Spectral Bears hold it through the activator's; Vorinclex and
 * Dreamshackle Geist are the plain one-step mark on a new source. The rulings: Telekinesis counts its
 * untap steps "regardless of who its controller was".
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import type { ScriptedController } from "../controller.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, attack, cast, enter, lands, life, nextTurn, pickTargets, ref, settle, spawn, table, toHand, toStep } from "./harness.js";

/** A real change of control, for as long as the game goes on: Agent of Treachery enters under `player`. */
function takeOver(game: Game, seat: ScriptedController, id: ObjectId): void {
  pickTargets(seat, id);
  enter(game, "Agent of Treachery", seat.playerId);
}

/** Passes until `player`'s next turn has begun and its untap step has happened. */
function toTurnOf(game: Game, player: PlayerId): void {
  nextTurn(game);
  if (activePlayerOf(game.state) !== player) nextTurn(game);
}

describe("held through N untap steps", () => {
  it("Telekinesis: tapped, and it stays down through two of its controller's untap steps", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const giant = spawn(game, "Hill Giant", B);
    const spell = toHand(game, "Telekinesis");
    cast(game, spell, { targets: [ref(giant)] });
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(game.state.objects[giant].skipsFurtherUntaps).toBe(1);

    toTurnOf(game, B); // Its controller's first untap step: still down.
    expect(game.state.objects[giant].tapped).toBe(true);
    toTurnOf(game, A);
    toTurnOf(game, B); // The second: still down, and that's the last.
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(game.state.objects[giant].skipsNextUntap).toBeUndefined();
    expect(game.state.objects[giant].skipsFurtherUntaps).toBeUndefined();
    toTurnOf(game, A);
    toTurnOf(game, B); // The third untaps it.
    expect(game.state.objects[giant].tapped).toBe(false);
  });

  it("Telekinesis' count follows the creature: a step under each controller is one of the two (the ruling)", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Telekinesis"), { targets: [ref(giant)] });
    toTurnOf(game, B); // One served under B.
    expect(game.state.objects[giant].tapped).toBe(true);
    takeOver(game, a, giant);
    toTurnOf(game, A); // One served under A: still down, and done.
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(game.state.objects[giant].skipsNextUntap).toBeUndefined();
    toTurnOf(game, B); // B's step isn't its controller's: nothing.
    expect(game.state.objects[giant].tapped).toBe(true);
    toTurnOf(game, A); // Now it untaps.
    expect(game.state.objects[giant].tapped).toBe(false);
  });

  it("two holds overlap rather than add: a one-step mark on top of Telekinesis' two ends with it", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const cage = spawn(game, "Barl's Cage");
    lands(game, "Wastes", 3);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Telekinesis"), { targets: [ref(giant)] });
    activate(game, cage, 0, { targets: [ref(giant)] });
    toTurnOf(game, B);
    toTurnOf(game, A);
    toTurnOf(game, B); // Two served.
    expect(game.state.objects[giant].tapped).toBe(true);
    toTurnOf(game, A);
    toTurnOf(game, B); // A third would be a sum: it untaps.
    expect(game.state.objects[giant].tapped).toBe(false);
  });

  it("a change of zone ends the hold", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Telekinesis"), { targets: [ref(giant)] });
    game.state.objects[giant].tapped = false;
    game.state.objects[giant].skipsFurtherUntaps = 1;
    expect(game.state.objects[giant].skipsNextUntap).toBe(true);
    lands(game, "Island", 2);
    const unsummon = toHand(game, "Boomerang");
    cast(game, unsummon, { targets: [ref(giant)] });
    expect(game.state.objects[giant].skipsNextUntap).toBeUndefined();
    expect(game.state.objects[giant].skipsFurtherUntaps).toBeUndefined();
  });
});

describe("held through your next untap step", () => {
  it("Reveka: 2 damage, and its activator's next untap step passes it by", () => {
    const { game } = table();
    const reveka = spawn(game, "Reveka, Wizard Savant");
    const bear = spawn(game, "Grizzly Bears", B);
    activate(game, reveka, 0, { targets: [ref(bear)] });
    expect(game.state.objects[bear].zone).toBe("graveyard");
    expect(game.state.objects[reveka].tapped).toBe(true);
    toTurnOf(game, B);
    expect(game.state.objects[reveka].tapped).toBe(true);
    toTurnOf(game, A); // Your next untap step: still down, and it's spent.
    expect(game.state.objects[reveka].tapped).toBe(true);
    expect(game.state.objects[reveka].skipsUntapOf).toBeUndefined();
    toTurnOf(game, B);
    toTurnOf(game, A);
    expect(game.state.objects[reveka].tapped).toBe(false);
  });

  it("Reveka under another player untaps in their step: the hold is on the activator's step, not its controller's", () => {
    const { game, b } = table();
    const reveka = spawn(game, "Reveka, Wizard Savant");
    activate(game, reveka, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    takeOver(game, b, reveka);
    toTurnOf(game, B);
    expect(game.state.objects[reveka].tapped).toBe(false);
  });

  it("a hold by each of two players is kept for each: one doesn't overwrite the other", () => {
    const { game, a, b } = table();
    const reveka = spawn(game, "Reveka, Wizard Savant");
    activate(game, reveka, 0, { targets: [ref(B)] });
    takeOver(game, b, reveka);
    toTurnOf(game, B); // It untaps under B, and B activates it in turn.
    expect(game.state.objects[reveka].tapped).toBe(false);
    activate(game, reveka, 0, { player: B, targets: [ref(A)] });
    expect(game.state.objects[reveka].skipsUntapOf?.map((hold) => hold.player).sort()).toEqual([A, B].sort());
    takeOver(game, a, reveka);
    toTurnOf(game, A); // A's hold still stands.
    expect(game.state.objects[reveka].tapped).toBe(true);
    expect(game.state.objects[reveka].skipsUntapOf?.map((hold) => hold.player)).toEqual([B]);
  });

  it("Samite Alchemist: prevents the next 4, taps your creature, and holds it through your next untap step", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const alchemist = spawn(game, "Samite Alchemist");
    const giant = spawn(game, "Hill Giant");
    activate(game, alchemist, 0, { targets: [ref(giant)] });
    expect(game.state.objects[giant].tapped).toBe(true);
    toTurnOf(game, B);
    toTurnOf(game, A);
    expect(game.state.objects[giant].tapped).toBe(true);
    expect(game.state.objects[alchemist].tapped).toBe(false);
    toTurnOf(game, B);
    toTurnOf(game, A);
    expect(game.state.objects[giant].tapped).toBe(false);
  });

  it("Spectral Bears: held only if defending player controls no black nontoken permanent", () => {
    const free = table();
    const bears = spawn(free.game, "Spectral Bears");
    attack(free.game, free.a, [bears]);
    expect(free.game.state.objects[bears].skipsUntapOf).toEqual([{ player: A, steps: 1 }]);
    toTurnOf(free.game, B);
    toTurnOf(free.game, A);
    expect(free.game.state.objects[bears].tapped).toBe(true);

    const blocked = table();
    const others = spawn(blocked.game, "Spectral Bears");
    spawn(blocked.game, "Vampire Nighthawk", B);
    attack(blocked.game, blocked.a, [others]);
    expect(blocked.game.state.objects[others].skipsUntapOf).toBeUndefined();
  });

  it("a mana land's own hold is its activator's too: Cinder Marsh under someone else untaps in their step", () => {
    const { game, b } = table();
    const marsh = spawn(game, "Cinder Marsh");
    activate(game, marsh, 1);
    expect(game.state.objects[marsh].tapped).toBe(true);
    takeOver(game, b, marsh);
    toTurnOf(game, B);
    expect(game.state.objects[marsh].tapped).toBe(false);
  });
});

describe("the one-step mark on new sources", () => {
  it("Vorinclex: your land makes one more; an opponent's tapped land skips its controller's next untap step", () => {
    const { game } = table();
    const vorinclex = spawn(game, "Vorinclex, Voice of Hunger");
    const mine = spawn(game, "Forest");
    activate(game, mine, 0);
    expect(game.state.players[A].manaPool).toHaveLength(2);
    expect(game.state.objects[vorinclex].zone).toBe("battlefield");

    toTurnOf(game, B);
    const theirs = spawn(game, "Swamp", B);
    activate(game, theirs, 0, { player: B });
    settle(game);
    expect(game.state.objects[theirs].skipsNextUntap).toBe(true);
    expect(game.state.objects[mine].skipsNextUntap).toBeUndefined();
    toTurnOf(game, A);
    toTurnOf(game, B);
    expect(game.state.objects[theirs].tapped).toBe(true);
  });

  it("Dreamshackle Geist: up to one mode, and either of them or none is an answer", () => {
    const { game, a } = table();
    spawn(game, "Dreamshackle Geist");
    const giant = spawn(game, "Hill Giant", B, { tapped: true });
    const bear = spawn(game, "Grizzly Bears", B);
    a.chooseModesFn = () => [1];
    a.chooseTargetsFn = () => [ref(giant)];
    toStep(game, "begin-combat");
    settle(game);
    expect(game.state.objects[giant].skipsNextUntap).toBe(true);
    expect(game.state.objects[bear].tapped).toBe(false);

    a.chooseModesFn = () => [];
    toTurnOf(game, B);
    toTurnOf(game, A);
    toStep(game, "begin-combat");
    settle(game);
    expect(game.state.turn.step).toBe("begin-combat");
    expect(game.state.objects[bear].tapped).toBe(false);
  });
});
