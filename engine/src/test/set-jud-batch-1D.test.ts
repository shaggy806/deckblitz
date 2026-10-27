/**
 * Judgment, batch 1 group D. One test per card whose behaviour is more than a
 * copied pattern, on the clause most likely to be wrong, written from the
 * Oracle text.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  destroy,
  enter,
  hand,
  lands,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pickPermanents,
  pt,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

describe("Judgment batch 1D", () => {
  describe("Seedtime", () => {
    it("takes an extra turn when an opponent cast a blue spell before it resolved", () => {
      const { game } = table();
      lands(game, "Forest", 2);
      lands(game, "Island", 1, B);
      cast(game, toHand(game, "Seedtime"), { settle: false });
      game.advanceUntil((s) => s.priority.holder === B);
      cast(game, toHand(game, "Opt", B), { player: B });
      expect(game.state.extraTurns).toEqual([A]);
    });

    it("takes no extra turn without one", () => {
      const { game } = table();
      lands(game, "Forest", 2);
      cast(game, toHand(game, "Seedtime"));
      expect(game.state.extraTurns).toEqual([]);
    });

    it("can't be cast during an opponent's turn", () => {
      const { game } = table();
      lands(game, "Forest", 2);
      const seedtime = toHand(game, "Seedtime");
      nextTurn(game);
      game.advanceUntil((s) => s.priority.holder === A);
      expect(() => cast(game, seedtime)).toThrow();
    });
  });

  describe("Hunting Grounds", () => {
    const setup = (cards: number) => {
      const t = table();
      spawn(t.game, "Hunting Grounds");
      for (let i = 0; i < cards; i++) toGraveyard(t.game, "Wastes");
      const bears = toHand(t.game, "Grizzly Bears");
      lands(t.game, "Forest", 2, B);
      pickFromZone(t.a, bears);
      nextTurn(t.game);
      cast(t.game, toHand(t.game, "Llanowar Elves", B), { player: B });
      return { ...t, bears };
    };

    it("with threshold, puts a creature card from hand onto the battlefield when an opponent casts a spell", () => {
      const { game, bears } = setup(7);
      expect(zone(game, bears)).toBe("battlefield");
    });

    it("without threshold, has no such ability", () => {
      const { game, bears } = setup(6);
      expect(zone(game, bears)).toBe("hand");
    });
  });

  describe("Wormfang Drake", () => {
    it("exiles another creature and returns it when it leaves", () => {
      const { game, a } = table();
      const bears = spawn(game, "Grizzly Bears");
      pickModes(a, 0);
      pickPermanents(a, bears);
      const drake = enter(game, "Wormfang Drake");
      expect(zone(game, drake)).toBe("battlefield");
      expect(zone(game, bears)).toBe("exile");
      destroy(game, drake);
      expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
    });

    it("is sacrificed with no other creature to exile", () => {
      const { game } = table();
      const drake = enter(game, "Wormfang Drake");
      expect(zone(game, drake)).toBe("graveyard");
    });
  });

  describe("Fledgling Dragon", () => {
    it("with threshold is 5/5 and has the firebreathing ability", () => {
      const { game } = table();
      const dragon = spawn(game, "Fledgling Dragon");
      lands(game, "Mountain", 1);
      expect(() => activate(game, dragon, 0)).toThrow();
      for (let i = 0; i < 7; i++) toGraveyard(game, "Wastes");
      expect(pt(game, dragon)).toEqual({ power: 5, toughness: 5 });
      activate(game, dragon, 0);
      settle(game);
      expect(pt(game, dragon)).toEqual({ power: 6, toughness: 5 });
    });
  });

  describe("Silver Seraph", () => {
    it("gives only other creatures +2/+2 with threshold", () => {
      const { game } = table();
      const seraph = spawn(game, "Silver Seraph");
      const bears = spawn(game, "Grizzly Bears");
      const theirs = spawn(game, "Grizzly Bears", B);
      expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
      for (let i = 0; i < 7; i++) toGraveyard(game, "Wastes");
      expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
      expect(pt(game, seraph)).toEqual({ power: 6, toughness: 6 });
      expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    });
  });

  describe("Anurid Brushhopper", () => {
    it("discards two to exile itself, returning at the next end step", () => {
      const { game } = table();
      const hopper = spawn(game, "Anurid Brushhopper");
      const before = hand(game).length;
      activate(game, hopper, 0);
      expect(hand(game).length).toBe(before - 2);
      expect(zone(game, hopper)).toBe("exile");
      game.advanceUntil((s) => s.turn.step === "end" && s.zones.shared.stack.length === 0 && s.pendingTriggers.length === 0 && s.awaiting === null && s.priority.holder === A);
      expect(named(game, "Anurid Brushhopper", A)).toHaveLength(1);
    });
  });
});
