/**
 * "If [a player] would begin [a turn], … skips that turn instead" (rules 500.11,
 * 614.10): `would-begin-turn`, filtered by whose turn and whether it's an extra
 * one; Time Vault's "you may", asked as it would begin; and 614.10b's "if you
 * do, untap", the first thing in the next turn to actually occur.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { ScriptedController } from "../controller.js";
import {
  A,
  activate,
  B,
  C,
  cast,
  counters,
  destroy,
  hand,
  lands,
  nextTurn,
  pt,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const activePlayer = (game: Game): string => game.state.turnOrder[game.state.turn.activePlayerIndex];

/** Each turn that begins, until `turns` of them have, by whose it was. */
const turnsFrom = (game: Game, turns: number): string[] => {
  const seen: string[] = [];
  for (let i = 0; i < turns; i += 1) {
    nextTurn(game);
    seen.push(activePlayer(game));
  }
  return seen;
};

/** Answers Time Vault's question with `answers`, in order, then takes turns. */
const answering = (seat: ScriptedController, answers: readonly string[]): { asked: number; prompts: string[] } => {
  const record = { asked: 0, prompts: [] as string[] };
  seat.chooseCreatureTypeFn = (_view, _source, options) => {
    record.asked += 1;
    record.prompts.push(options.join("|"));
    return answers[record.asked - 1] ?? options[0];
  };
  return record;
};

/** A tapped Time Vault of `player`'s, already on the battlefield. */
const vault = (game: Game, player = A): ObjectId => {
  const id = spawn(game, "Time Vault", player);
  game.state.objects[id].tapped = true;
  return id;
};

describe("skipping a turn as it would begin", () => {
  describe("an extra turn (Gerrard's Hourglass Pendant)", () => {
    it("skips anyone's extra turn, and the rotation goes on as it would", () => {
      const { game } = table();
      spawn(game, "Gerrard's Hourglass Pendant", B);
      lands(game, "Island", 5);
      cast(game, toHand(game, "Capture of Jingzhou"));
      expect(game.state.extraTurns).toEqual([A]);
      expect(turnsFrom(game, 2)).toEqual([B, A]);
      expect(game.state.extraTurns).toEqual([]);
    });

    it("leaves a turn in the rotation alone", () => {
      const { game } = table();
      spawn(game, "Gerrard's Hourglass Pendant", A);
      expect(turnsFrom(game, 3)).toEqual([B, A, B]);
    });

    it("stops once the Pendant has gone", () => {
      const { game } = table();
      const pendant = spawn(game, "Gerrard's Hourglass Pendant", B);
      lands(game, "Island", 5);
      cast(game, toHand(game, "Capture of Jingzhou"));
      destroy(game, pendant);
      expect(turnsFrom(game, 1)).toEqual([A]);
      expect(game.state.turn.isExtra).toBe(true);
    });

    it("returns what was put into your graveyard from the battlefield this turn, tapped", () => {
      const { game } = table();
      const pendant = spawn(game, "Gerrard's Hourglass Pendant", A);
      game.state.objects[pendant].summoningSick = false;
      const bears = spawn(game, "Grizzly Bears", A);
      lands(game, "Mountain", 5);
      cast(game, toHand(game, "Lightning Bolt"), { targets: [{ kind: "object", object: bears }] });
      expect(zone(game, bears)).toBe("graveyard");
      activate(game, pendant);
      expect(zone(game, pendant)).toBe("exile");
      expect(zone(game, bears)).toBe("battlefield");
      expect(game.state.objects[bears].tapped).toBe(true);
    });
  });

  describe("a skip owed beside an effect that skips the turn anyway", () => {
    it("asks whether the skip owed is used on the turn: used", () => {
      const { game, a } = table();
      spawn(game, "Gerrard's Hourglass Pendant", B);
      game.state.players[A].turnsToSkip = 1;
      game.state.extraTurns.push(A);
      const asked = answering(a, ["Use the skipped turn I owe on it"]);
      expect(turnsFrom(game, 2)).toEqual([B, A]);
      expect(asked.asked).toBe(1);
      expect(game.state.players[A].turnsToSkip).toBeUndefined();
    });

    it("asks whether the skip owed is used on the turn: kept for their next", () => {
      const { game, a } = table();
      spawn(game, "Gerrard's Hourglass Pendant", B);
      game.state.players[A].turnsToSkip = 1;
      game.state.extraTurns.push(A);
      const asked = answering(a, ["Keep owing it"]);
      expect(turnsFrom(game, 2)).toEqual([B, B]);
      expect(asked.asked).toBe(1);
      expect(game.state.players[A].turnsToSkip).toBeUndefined();
    });
  });

  describe("you may skip it (Time Vault)", () => {
    it("asks as your turn would begin, and taking the turn changes nothing", () => {
      const { game, a } = table();
      const id = vault(game);
      const asked = answering(a, ["Take this turn"]);
      expect(turnsFrom(game, 1)).toEqual([B]); // Bob's turn: not yours, not asked
      expect(asked.asked).toBe(0);
      expect(turnsFrom(game, 1)).toEqual([A]);
      expect(asked.asked).toBe(1);
      expect(game.state.objects[id].tapped).toBe(true); // it doesn't untap in the untap step
    });

    it("skips the turn, and untaps before anything else in the next one to occur (rule 614.10b)", () => {
      const { game, a } = table();
      const id = vault(game);
      const asked = answering(a, ["Skip this turn"]);
      expect(turnsFrom(game, 1)).toEqual([B]);
      expect(game.state.objects[id].tapped).toBe(true);
      // Alice's turn is skipped: Bob's next one is the next to occur.
      expect(turnsFrom(game, 1)).toEqual([B]);
      expect(asked.asked).toBe(1);
      expect(game.state.objects[id].tapped).toBe(false);
      expect(game.state.players[A].turnsToSkip).toBeUndefined();
    });

    it("isn't asked while it's untapped, and its {T} takes an extra turn", () => {
      const { game, a } = table();
      const id = vault(game);
      game.state.objects[id].tapped = false;
      const asked = answering(a, ["Skip this turn"]);
      activate(game, id);
      expect(game.state.objects[id].tapped).toBe(true);
      expect(game.state.extraTurns).toEqual([A]);
      // Tapped now, so it's asked of the extra turn, which it skips.
      expect(turnsFrom(game, 1)).toEqual([B]);
      expect(asked.asked).toBe(1);
      expect(game.state.objects[id].tapped).toBe(false);
    });

    it("enters tapped, and is asked about an extra turn as about any", () => {
      const { game, a } = table();
      lands(game, "Wastes", 2);
      cast(game, toHand(game, "Time Vault"));
      const id = game.battlefield.find((o) => game.state.objects[o].cardName === "Time Vault") as ObjectId;
      expect(game.state.objects[id].tapped).toBe(true);
      game.state.extraTurns.push(A);
      const asked = answering(a, ["Take this turn"]);
      expect(turnsFrom(game, 1)).toEqual([A]);
      expect(game.state.turn.isExtra).toBe(true);
      expect(asked.asked).toBe(1);
    });

    it("with a skip owed too: taking the Vault's leaves it owed, declining uses it (rule 616.1)", () => {
      const first = table();
      vault(first.game);
      first.game.state.players[A].turnsToSkip = 1;
      answering(first.a, ["Skip this turn"]);
      // Bob, Alice's skipped by the Vault, Bob, and Alice's skipped by the one owed.
      expect(turnsFrom(first.game, 3)).toEqual([B, B, B]);
      expect(first.game.state.objects[first.game.battlefield[0]].tapped).toBe(false);

      const second = table();
      const id = vault(second.game);
      second.game.state.players[A].turnsToSkip = 1;
      answering(second.a, ["Take this turn"]);
      expect(turnsFrom(second.game, 3)).toEqual([B, B, A]);
      expect(second.game.state.objects[id].tapped).toBe(true);
    });

    it("two Vaults: one skip is enough for a turn, and only that one untaps", () => {
      const { game, a } = table();
      const one = vault(game);
      const two = vault(game);
      const asked = answering(a, ["Skip this turn", "Take this turn"]);
      expect(turnsFrom(game, 2)).toEqual([B, B]);
      expect(asked.asked).toBe(1);
      expect([game.state.objects[one].tapped, game.state.objects[two].tapped]).toEqual([false, true]);
    });

    it("keeps to the turn order at a four-player table, and nobody else is asked", () => {
      const { game, a, b, c, d } = table({ players: 4 });
      vault(game, C);
      const askedC = answering(c, ["Skip this turn"]);
      const others = [a, b, d].map((seat) => answering(seat, []));
      expect(turnsFrom(game, 3)).toEqual([B, game.state.turnOrder[3], A]);
      expect(askedC.asked).toBe(1);
      expect(others.every((r) => r.asked === 0)).toBe(true);
    });

    it("is a plain decision at the turn's edge: a clone of the state holds the question", () => {
      const { game, a } = table();
      vault(game);
      let cloned = false;
      a.chooseCreatureTypeFn = (_view, _source, options) => {
        const copy = structuredClone(game.state);
        cloned = copy.awaiting?.kind === "choose-creature-type" && copy.awaiting.turnSkip !== undefined;
        return options[0];
      };
      turnsFrom(game, 2);
      expect(cloned).toBe(true);
    });

    it("loses the choice with its abilities", () => {
      const { game, a } = table();
      const id = vault(game);
      const asked = answering(a, ["Skip this turn"]);
      const aura = spawn(game, "Stop Cold", B);
      game.state.objects[aura].attachedTo = id;
      expect(turnsFrom(game, 2)).toEqual([B, A]);
      expect(asked.asked).toBe(0);
    });
  });

  describe("no code needed: the skip-turn effect", () => {
    it("Chronatog: +3/+3 until end of turn, once a turn, and the next turn skipped", () => {
      const { game } = table();
      const tog = spawn(game, "Chronatog", A);
      activate(game, tog);
      expect(pt(game, tog)).toEqual({ power: 4, toughness: 5 });
      expect(() => activate(game, tog)).toThrow();
      expect(turnsFrom(game, 2)).toEqual([B, B]);
    });

    it("Magosi, the Waterveil: a counter and a skipped turn, then the extra turn back", () => {
      const { game } = table();
      const land = spawn(game, "Magosi, the Waterveil", A);
      game.state.objects[land].tapped = false;
      lands(game, "Island", 1);
      activate(game, land, 1);
      expect(counters(game, land, "eon")).toBe(1);
      expect(game.state.players[A].turnsToSkip).toBe(1);
      expect(turnsFrom(game, 1)).toEqual([B]);
      expect(game.state.players[A].turnsToSkip).toBe(1);
      // Alice's skipped: Bob's again. The land untaps with her next real one.
      expect(turnsFrom(game, 1)).toEqual([B]);
      expect(game.state.players[A].turnsToSkip).toBeUndefined();
      expect(turnsFrom(game, 1)).toEqual([A]);
      activate(game, land, 2);
      expect(hand(game)).toContain(land);
      expect(game.state.extraTurns).toEqual([A]);
      toStep(game, "end");
      settle(game);
    });
  });
});
