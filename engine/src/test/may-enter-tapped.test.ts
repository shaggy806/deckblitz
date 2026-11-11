/**
 * "You may have this land enter tapped. If you do, …" — an
 * `enters-battlefield` replacement's `mayEnterTapped` (rule 614.1c), asked
 * before the land moves, on Mariposa Military Base.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { playerCountersHeld } from "../state.js";
import { A, hand, lands, ref, settle, spawn, table, toHand, zone } from "./harness.js";

const BASE = "Mariposa Military Base";
const TEXT = "You may have this land enter tapped. If you do, you get two rad counters.";

const rad = (game: Game, player: PlayerId = A): number => playerCountersHeld(game.state, player, "rad");
const play = (game: Game, card: ObjectId): void => {
  game.dispatch({ type: "play-land", player: A, card });
  settle(game);
};

describe("Mariposa Military Base", () => {
  it("asks as it's played; entering tapped gives two rad counters with nothing on the stack", () => {
    const { game, a } = table();
    const asked: { options: string[]; where: string; prompt: unknown }[] = [];
    const base = toHand(game, BASE);
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      const awaiting = game.state.awaiting;
      asked.push({
        options: [...options],
        where: zone(game, base),
        prompt: awaiting?.kind === "choose-creature-type" ? awaiting.prompt : undefined,
      });
      return options[1];
    };
    play(game, base);
    // Asked before it moved (rule 614.12).
    expect(asked).toEqual([{ options: ["Enter untapped", "Enter tapped"], where: "hand", prompt: TEXT }]);
    expect(zone(game, base)).toBe("battlefield");
    expect(game.state.objects[base].tapped).toBe(true);
    expect(rad(game)).toBe(2);
    expect(game.state.zones.shared.stack).toEqual([]);
  });

  it("entering untapped gives none", () => {
    const { game, a } = table();
    a.chooseCreatureTypeFn = (_view, _source, options) => options[0];
    const base = toHand(game, BASE);
    play(game, base);
    expect(zone(game, base)).toBe("battlefield");
    expect(game.state.objects[base].tapped).toBe(false);
    expect(rad(game)).toBe(0);
  });

  it("is asked however it enters: put onto the battlefield by an effect", () => {
    const { game, a } = table();
    let asks = 0;
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      asks += 1;
      return options[1];
    };
    const base = toHand(game, BASE);
    game.debugApplyEffect(A, { kind: "put-onto-battlefield", target: 0 }, [ref(base)]);
    settle(game);
    expect(asks).toBe(1);
    expect(game.state.objects[base].tapped).toBe(true);
    expect(rad(game)).toBe(2);
  });

  it("its draw costs {1} less for each rad counter you have", () => {
    const { game } = table();
    const base = spawn(game, BASE);
    lands(game, "Wastes", 2);
    const draw = { type: "activate-ability", player: A, source: base, abilityIndex: 1, targets: [] } as const;
    expect(game.canDispatch(draw)).not.toBeNull();

    game.debugApplyEffect(A, { kind: "add-player-counters", counter: "rad", amount: 3, who: "you" });
    settle(game);
    const before = hand(game).length;
    game.dispatch(draw);
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    expect(game.state.objects[base].tapped).toBe(true);
  });

  it("under Spelunking the choice still gives the counters, and you order the two replacements (rule 616.1)", () => {
    for (const [applyFirst, tapped] of [
      ["tapped", false],
      ["untapped", true],
    ] as const) {
      const { game, a } = table();
      spawn(game, "Spelunking");
      a.chooseCreatureTypeFn = (_view, _source, options) => options[1];
      const offered: string[][] = [];
      a.chooseReplacementOrderFn = (_view, offer) => {
        offered.push(offer.options.map((o) => `${o.name} ${o.text}`));
        return offer.options.findIndex((o) => o.key === applyFirst);
      };
      const base = toHand(game, BASE);
      play(game, base);
      expect(offered).toEqual([[`${BASE} enters tapped`, "Spelunking enters untapped"]]);
      expect(zone(game, base)).toBe("battlefield");
      expect(game.state.objects[base].tapped).toBe(tapped);
      expect(rad(game)).toBe(2);
    }
  });

  it("under Spelunking, entering untapped by choice asks nothing more", () => {
    const { game, a } = table();
    spawn(game, "Spelunking");
    a.chooseCreatureTypeFn = (_view, _source, options) => options[0];
    let orders = 0;
    a.chooseReplacementOrderFn = (_view, offer) => {
      orders += 1;
      return offer.best;
    };
    const base = toHand(game, BASE);
    play(game, base);
    expect(orders).toBe(0);
    expect(game.state.objects[base].tapped).toBe(false);
    expect(rad(game)).toBe(0);
  });
});
