/**
 * "Redistribute any number of players' life totals" (Reverse the Sands): the
 * caster gives each player one of the totals they all had, one question per
 * player from the caster on, each total to one player (the rulings); each
 * gains or loses the difference (rule 119.5); no higher total for a player
 * who can't gain life, no lower one for a player who can't lose it (rules
 * 119.7–8). Written from the card's Oracle text and rulings.
 */
import { describe, expect, it } from "vitest";

import type { GameEvent } from "../events.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";
import { A, B, C, D, cast, enter, lands, life, pickModes, table, toHand } from "./harness.js";

function sands(game: Game): void {
  lands(game, "Plains", 8);
  cast(game, toHand(game, "Reverse the Sands"));
}

function setLives(game: Game, lives: Partial<Record<PlayerId, number>>): void {
  for (const [player, total] of Object.entries(lives)) {
    if (total !== undefined) game.state.players[player as PlayerId].life = total;
  }
}

const lives = (game: Game, ...players: PlayerId[]): number[] => players.map((p) => life(game, p));

describe("Reverse the Sands", () => {
  it("two players: alice takes bob's 15, and bob gets her 5 without being asked about", () => {
    const { game, a, b } = table();
    setLives(game, { [A]: 5, [B]: 15 });
    const asked: (readonly string[])[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      asked.push(texts);
      return [1];
    };
    b.chooseModesFn = () => {
      throw new Error("bob doesn't choose");
    };
    sands(game);
    expect(asked).toEqual([[`${A} keeps 5 life`, `${A} gets 15 life (has 5)`]]);
    expect(lives(game, A, B)).toEqual([15, 5]);
  });

  it("each gains or loses the difference: a life-gained and a life-lost event", () => {
    const { game, a } = table();
    setLives(game, { [A]: 5, [B]: 15 });
    pickModes(a, 1);
    sands(game);
    const changes = game.state.eventLog.filter(
      (e): e is Extract<GameEvent, { type: "life-changed" }> => e.type === "life-changed",
    );
    expect(changes.map((e) => [e.player, e.delta])).toEqual([
      [A, 10],
      [B, -10],
    ]);
  });

  it("the totals may be left as they are", () => {
    const { game, a } = table();
    setLives(game, { [A]: 5, [B]: 15 });
    pickModes(a, 0);
    sands(game);
    expect(lives(game, A, B)).toEqual([5, 15]);
  });

  it("four players: one question each but the last, from the totals left", () => {
    const { game, a } = table({ players: 4 });
    setLives(game, { [A]: 10, [B]: 20, [C]: 30, [D]: 40 });
    const asked: (readonly string[])[] = [];
    const picks = [`${A} gets 40 life (has 10)`, `${B} gets 10 life (has 20)`, `${C} gets 20 life (has 30)`];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      asked.push(texts);
      return [texts.indexOf(picks[asked.length - 1])];
    };
    sands(game);
    expect(asked).toEqual([
      [`${A} keeps 10 life`, `${A} gets 40 life (has 10)`, `${A} gets 30 life (has 10)`, `${A} gets 20 life (has 10)`],
      [`${B} keeps 20 life`, `${B} gets 30 life (has 20)`, `${B} gets 10 life (has 20)`],
      [`${C} keeps 30 life`, `${C} gets 20 life (has 30)`],
    ]);
    expect(lives(game, A, B, C, D)).toEqual([40, 10, 20, 30]);
  });

  it("equal totals are one option", () => {
    const { game, a } = table({ players: 3 });
    setLives(game, { [A]: 20, [B]: 20, [C]: 7 });
    const asked: (readonly string[])[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      asked.push(texts);
      return [texts.length - 1];
    };
    sands(game);
    expect(asked[0]).toEqual([`${A} keeps 20 life`, `${A} gets 7 life (has 20)`]);
  });

  it("a player whose life total can't change keeps it, unasked; the rest are redistributed", () => {
    const { game, a } = table({ players: 3 });
    setLives(game, { [A]: 5, [B]: 15, [C]: 10 });
    enter(game, "Platinum Emperion", A);
    const asked: (readonly string[])[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      asked.push(texts);
      return [1];
    };
    sands(game);
    expect(asked).toEqual([[`${B} keeps 15 life`, `${B} gets 10 life (has 15)`]]);
    expect(lives(game, A, B, C)).toEqual([5, 10, 15]);
  });

  it("nobody can be given a higher total while players can't gain life: nothing is asked", () => {
    const { game, a } = table({ players: 3 });
    setLives(game, { [A]: 5, [B]: 15, [C]: 10 });
    enter(game, "Leyline of Punishment", B);
    a.chooseModesFn = () => {
      throw new Error("nothing to choose");
    };
    sands(game);
    expect(lives(game, A, B, C)).toEqual([5, 15, 10]);
  });

  it("a replacement still applies to the life gained: under Sulfuric Vortex alice gains none, bob still loses", () => {
    const { game, a } = table();
    setLives(game, { [A]: 5, [B]: 15 });
    // "If a player would gain life, that player gains no life instead" isn't
    // "can't gain life" (rule 119.7): the totals may be redistributed.
    enter(game, "Sulfuric Vortex", B);
    pickModes(a, 1);
    sands(game);
    expect(lives(game, A, B)).toEqual([5, 5]);
  });

  it("an opponent who can't gain life can be given less, never more", () => {
    const { game, a } = table({ players: 3 });
    // Erebos: alice's opponents can't gain life.
    setLives(game, { [A]: 5, [B]: 15, [C]: 10 });
    enter(game, "Erebos, God of the Dead", A);
    const asked: (readonly string[])[] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      asked.push(texts);
      return [texts.indexOf(`${A} gets 10 life (has 5)`)];
    };
    sands(game);
    // With carol's 10 taken, carol (10) can't be given bob's 15: bob keeps
    // his, unasked, and carol gets alice's 5.
    expect(asked).toEqual([[`${A} keeps 5 life`, `${A} gets 15 life (has 5)`, `${A} gets 10 life (has 5)`]]);
    expect(lives(game, A, B, C)).toEqual([10, 15, 5]);
  });
});
