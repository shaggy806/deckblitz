/**
 * "Target creature that's attacking alone" — `CardFilter.attackingAlone` (rule
 * 506.5: attacking while no other creature is, whoever controls it), proven on
 * Viper, Cruel Conspirator and Crowd of True Believers.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ScriptedController } from "../controller.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { A, B, activate, keywords, lands, life, pickModes, pt, ref, spawn, table } from "./harness.js";

/** `seat`'s `attackers` attack the other player; the game stops in the
 * declare attackers step with the active player holding priority. */
const intoCombat = (game: Game, seat: ScriptedController, attackers: readonly ObjectId[], defender: PlayerId): void => {
  seat.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender }));
  game.advanceUntil(
    (s) =>
      s.turn.step === "declare-attackers" &&
      s.awaiting === null &&
      s.priority.holder === activePlayerOf(s) &&
      s.zones.shared.battlefield.some((id) => s.objects[id].attacking !== null),
  );
};

describe("Viper, Cruel Conspirator", () => {
  it("pumps a creature attacking alone", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const viper = spawn(game, "Viper, Cruel Conspirator");
    const bears = spawn(game, "Grizzly Bears");
    intoCombat(game, a, [bears], B);
    activate(game, viper, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });

  it("gives it your choice of lifelink", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const viper = spawn(game, "Viper, Cruel Conspirator");
    const bears = spawn(game, "Grizzly Bears");
    intoCombat(game, a, [bears], B);
    pickModes(a, 1);
    activate(game, viper, 1, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    expect(keywords(game, bears).has("deathtouch")).toBe(false);
  });

  it("can't target a creature attacking beside another", () => {
    const { game, a } = table();
    lands(game, "Swamp", 1);
    const viper = spawn(game, "Viper, Cruel Conspirator");
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    intoCombat(game, a, [bears, elves], B);
    expect(() => activate(game, viper, 0, { targets: [ref(bears)] })).toThrow(/target/i);
  });

  it("can't target a creature that isn't attacking", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const viper = spawn(game, "Viper, Cruel Conspirator");
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, viper, 0, { targets: [ref(bears)] })).toThrow(/target/i);
  });

  it("targets an opponent's creature attacking alone too", () => {
    const { game, b } = table();
    const viper = spawn(game, "Viper, Cruel Conspirator");
    lands(game, "Swamp", 1);
    const theirs = spawn(game, "Grizzly Bears", B);
    // Bob's turn: his bears attack Alice alone.
    game.advanceUntil((s) => activePlayerOf(s) === B && s.turn.step === "precombat-main");
    intoCombat(game, b, [theirs], A);
    game.dispatch({ type: "pass-priority", player: B });
    activate(game, viper, 0, { player: A, targets: [ref(theirs)] });
    expect(pt(game, theirs)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Crowd of True Believers", () => {
  it("gives your creature attacking alone +1/+0, and you gain 1 life", () => {
    const { game, a } = table();
    const crowd = spawn(game, "Crowd of True Believers");
    const bears = spawn(game, "Grizzly Bears");
    intoCombat(game, a, [bears], B);
    activate(game, crowd, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(life(game, A)).toBe(21);
  });

  it("can't target an opponent's creature attacking alone", () => {
    const { game, b } = table();
    const crowd = spawn(game, "Crowd of True Believers");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.advanceUntil((s) => activePlayerOf(s) === B && s.turn.step === "precombat-main");
    intoCombat(game, b, [theirs], A);
    game.dispatch({ type: "pass-priority", player: B });
    expect(() => activate(game, crowd, 0, { player: A, targets: [ref(theirs)] })).toThrow(/target/i);
  });
});
