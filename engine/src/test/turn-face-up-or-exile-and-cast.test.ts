/**
 * "Turn this creature face up. If you can't, exile it, then you may cast the
 * exiled card without paying its mana cost" — Etrata, Deadly Fugitive's
 * grant to face-down creatures you control: `turn-face-up` of the source, then
 * a `conditional` on the source still being face down (an instant or sorcery
 * card, 701.40g / 701.58g, or one that can't be turned face up), an `exile`
 * of it and a `cast-now` of `"source-exiled-this-way"`. And its cloak of the
 * damaged opponent's top card. Written from the Oracle text.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, attack, cast, controller, lands, life, ref, settle, spawn, table, toHand, toLibrary, zone } from "./harness.js";

/** `name` manifested from the top of `player`'s library. */
function faceDown(game: Game, name: string, player: PlayerId = A): ObjectId {
  const card = toLibrary(game, name, player);
  game.debugApplyEffect(player, { kind: "manifest", who: "you" });
  settle(game);
  expect(game.state.objects[card].faceDown).toBeDefined();
  return card;
}

describe("Etrata, Deadly Fugitive", () => {
  it("a face-down creature card of yours is turned face up, nothing more", () => {
    const { game, a } = table();
    spawn(game, "Etrata, Deadly Fugitive");
    const bears = faceDown(game, "Grizzly Bears");
    lands(game, "Underground Sea", 4);
    let offered = false;
    a.chooseCastNowFn = () => {
      offered = true;
      return null;
    };
    activate(game, bears, 0);
    expect(game.state.objects[bears].faceDown).toBeUndefined();
    expect(zone(game, bears)).toBe("battlefield");
    expect(offered).toBe(false);
  });

  it("an instant card can't be turned face up: it's exiled, and may be cast free", () => {
    const { game, a } = table();
    spawn(game, "Etrata, Deadly Fugitive");
    const bolt = faceDown(game, "Lightning Bolt");
    lands(game, "Underground Sea", 4);
    a.chooseCastNowFn = () => ({ type: "cast-spell", player: A, card: bolt, targets: [ref(B)], via: "effect", free: true });
    activate(game, bolt, 0);
    expect(life(game, B)).toBe(17);
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("declining the cast leaves the card in exile", () => {
    const { game } = table();
    spawn(game, "Etrata, Deadly Fugitive");
    const bolt = faceDown(game, "Lightning Bolt");
    lands(game, "Underground Sea", 4);
    activate(game, bolt, 0);
    expect(zone(game, bolt)).toBe("exile");
    expect(life(game, B)).toBe(20);
  });

  it("a creature that can't be turned face up (Karlov Watchdog, in its controller's turn) is exiled and may be cast", () => {
    const { game, a } = table();
    spawn(game, "Etrata, Deadly Fugitive");
    spawn(game, "Karlov Watchdog", B);
    const bears = faceDown(game, "Grizzly Bears");
    lands(game, "Underground Sea", 4);
    // Bob's upkeep, Alice holding priority.
    game.advanceUntil((s) => game.activePlayer === B && s.turn.step === "upkeep" && s.priority.holder === A);
    let offered = false;
    a.chooseCastNowFn = () => {
      offered = true;
      return { type: "cast-spell", player: A, card: bears, targets: [], via: "effect", free: true };
    };
    activate(game, bears, 0, { player: A });
    expect(offered).toBe(true);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].faceDown).toBeUndefined();
    expect(controller(game, bears)).toBe(A);
  });

  it("Unable to Scream's loss of all abilities takes the granted one too (rule 613.1f)", () => {
    const { game } = table();
    spawn(game, "Etrata, Deadly Fugitive");
    const bears = faceDown(game, "Grizzly Bears");
    lands(game, "Underground Sea", 5);
    cast(game, toHand(game, "Unable to Scream"), { targets: [ref(bears)] });
    expect(() => activate(game, bears, 0)).toThrow(/no ability/);
  });

  it("only face-down creatures you control have it", () => {
    const { game } = table();
    spawn(game, "Etrata, Deadly Fugitive");
    const theirs = faceDown(game, "Grizzly Bears", B);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Underground Sea", 4);
    expect(() => activate(game, theirs, 0)).toThrow(/no ability|control/);
    expect(() => activate(game, bears, 0)).toThrow(/no ability/);
  });

  it("an Assassin's combat damage to an opponent cloaks the top card of their library, under your control", () => {
    const { game, a } = table();
    const etrata = spawn(game, "Etrata, Deadly Fugitive");
    const top = toLibrary(game, "Hill Giant", B);
    attack(game, a, [etrata]);
    expect(life(game, B)).toBe(19);
    expect(zone(game, top)).toBe("battlefield");
    expect(game.state.objects[top].faceDown).toBeDefined();
    expect(controller(game, top)).toBe(A);
  });
});
