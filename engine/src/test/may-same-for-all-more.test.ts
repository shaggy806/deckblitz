/**
 * "The same for all of them" past a trigger's plain "you may" (see
 * `may-same-for-all.test.ts` for that): a resolving trigger's choice among
 * several modes, a "you may" asked after another decision in the same
 * resolution, the later players of an "each player may", and a trigger an
 * effect granted. Each is a shortcut (rule 732.2a) over identical triggers.
 */

import { describe, expect, it } from "vitest";

import type { TriggeredAbility } from "../abilities.js";
import { defineCard } from "../cards/define.js";
import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import type { GameState } from "../state.js";
import { A, B, life, quiet, spawn, table } from "./harness.js";
import type { Table } from "./harness.js";

const CHOICE = "Test Landfall Choice";
const SCRY_THEN_MAY = "Test Landfall Scry Then May";
const EACH_MAY = "Test Landfall Each Player May";

const landfall = (name: string, effect: EffectSpec): ReturnType<typeof defineCard> =>
  defineCard({
    name,
    manaCost: "{0}",
    types: ["enchantment"],
    text: name,
    triggered: [
      {
        trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
        targets: [],
        effect,
        resolve: null,
        text: name,
      },
    ],
  });

const MAY_GAIN_2: TriggeredAbility = {
  trigger: { on: "enters-battlefield", who: "you-control", filter: { type: "land" } },
  targets: [],
  effect: { kind: "may", prompt: "Gain 2 life?", effect: { kind: "gain-life", amount: 2 } },
  resolve: null,
  text: "Whenever a land you control enters, you may gain 2 life.",
};

const board = (): Table => {
  const t = table({ ownRegistry: true, deck: "Island" });
  t.game.registry.register(
    landfall(CHOICE, {
      kind: "modal",
      minModes: 1,
      maxModes: 1,
      modes: [
        { text: "Gain 1 life", effect: { kind: "gain-life", amount: 1 } },
        { text: "Gain 3 life", effect: { kind: "gain-life", amount: 3 } },
      ],
    }),
  );
  t.game.registry.register(
    landfall(SCRY_THEN_MAY, {
      kind: "sequence",
      effects: [
        { kind: "scry", amount: 1 },
        { kind: "may", prompt: "Gain 2 life?", effect: { kind: "gain-life", amount: 2 } },
      ],
    }),
  );
  t.game.registry.register(
    landfall(EACH_MAY, {
      kind: "each-player-may",
      who: "each-player",
      prompt: "Gain 1 life?",
      effect: { kind: "gain-life", amount: 1, who: "you" },
    } as EffectSpec),
  );
  return t;
};

const asking = (s: GameState): boolean => s.awaiting?.kind === "choose-modes";
const askedOf = (game: Game): PlayerId | null =>
  game.state.awaiting?.kind === "choose-modes" ? game.state.awaiting.player : null;

/** Three copies of `name`, then a land: three identical triggers. */
const threeThenLand = (t: Table, name: string): void => {
  for (let i = 0; i < 3; i += 1) spawn(t.game, name);
  t.game.debugSpawn("Forest", A, "battlefield", { summoningSick: false, announceEntry: true });
  t.game.advanceUntil(asking);
};

/** Every question a seat answers itself (not by a standing answer). */
const record = (t: Table): { a: string[]; b: string[] } => {
  const asked = { a: [] as string[], b: [] as string[] };
  t.a.chooseModesFn = (_view, _min, _max, texts) => {
    asked.a.push(texts.join(" / "));
    return [0];
  };
  t.b.chooseModesFn = (_view, _min, _max, texts) => {
    asked.b.push(texts.join(" / "));
    return [0];
  };
  return asked;
};

const offer = (game: Game, player: PlayerId) => game.legalActions(player).find((a) => a.kind === "choose-modes");

describe("the same for all, past a plain you may", () => {
  it("a choice among several modes: one answer chooses the same mode for each", () => {
    const t = board();
    const asked = record(t);
    const before = life(t.game);
    threeThenLand(t, CHOICE);
    expect(offer(t.game, A)).toMatchObject({ modeTexts: ["Gain 1 life", "Gain 3 life"], sameForAll: 2 });
    t.game.dispatch({ type: "choose-modes", player: A, modes: [1], forAll: true });
    t.game.advanceUntil(quiet);
    expect(asked.a).toEqual([]);
    expect(life(t.game)).toBe(before + 9);
  });

  it("a choice among several modes, answered one at a time, asks each", () => {
    const t = board();
    const asked = record(t);
    threeThenLand(t, CHOICE);
    t.game.dispatch({ type: "choose-modes", player: A, modes: [1] });
    t.game.advanceUntil(quiet);
    expect(asked.a).toEqual(["Gain 1 life / Gain 3 life", "Gain 1 life / Gain 3 life"]);
  });

  it("a you may asked after a scry in the same resolution still offers it", () => {
    const t = board();
    const asked = record(t);
    const before = life(t.game);
    threeThenLand(t, SCRY_THEN_MAY);
    expect(offer(t.game, A)).toMatchObject({ modeTexts: ["Gain 2 life?"], sameForAll: 2 });
    t.game.dispatch({ type: "choose-modes", player: A, modes: [0], forAll: true });
    t.game.advanceUntil(quiet);
    expect(asked.a).toEqual([]);
    expect(life(t.game)).toBe(before + 6);
  });

  it("each player may: the second player is offered it too, for their own answers", () => {
    const t = board();
    const asked = record(t);
    const [lifeA, lifeB] = [life(t.game, A), life(t.game, B)];
    threeThenLand(t, EACH_MAY);
    expect(askedOf(t.game)).toBe(A);
    expect(offer(t.game, A)).toMatchObject({ sameForAll: 2 });
    t.game.dispatch({ type: "choose-modes", player: A, modes: [0], forAll: true });
    t.game.advanceUntil(asking);
    expect(askedOf(t.game)).toBe(B);
    expect(offer(t.game, B)).toMatchObject({ sameForAll: 2 });
    t.game.dispatch({ type: "choose-modes", player: B, modes: [], forAll: true });
    t.game.advanceUntil(quiet);
    expect(asked).toEqual({ a: [], b: [] });
    expect(life(t.game, A)).toBe(lifeA + 3);
    expect(life(t.game, B)).toBe(lifeB);
  });

  it("a trigger an effect granted: the same granted ability on three creatures", () => {
    const t = board();
    const asked = record(t);
    const before = life(t.game);
    for (let i = 0; i < 3; i += 1) {
      const bears = spawn(t.game, "Grizzly Bears");
      t.game.debugApplyEffect(A, { kind: "grant-triggered", target: 0, ability: MAY_GAIN_2, duration: "end-of-turn" }, [
        { kind: "object", object: bears },
      ]);
    }
    t.game.debugSpawn("Forest", A, "battlefield", { summoningSick: false, announceEntry: true });
    t.game.advanceUntil(asking);
    expect(offer(t.game, A)).toMatchObject({ modeTexts: ["Gain 2 life?"], sameForAll: 2 });
    t.game.dispatch({ type: "choose-modes", player: A, modes: [0], forAll: true });
    t.game.advanceUntil(quiet);
    expect(asked.a).toEqual([]);
    expect(life(t.game)).toBe(before + 6);
  });
});
