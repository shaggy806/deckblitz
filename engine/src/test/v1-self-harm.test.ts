/**
 * What v1 (`HeuristicBotController`) no longer casts at itself. v1 casts what
 * it can, and a v2 search cut short by its clock plays v1's cast unscored
 * (`EvalBotController.unscoredCast`), so on a board too wide to search these
 * were live plays (room K6DYC, 2026-11-14): Crux of Fate destroying only the
 * bot's own Dragons, Teferi's Protection in its own upkeep, mana spent in
 * answer to its own upkeep trigger.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import { createDefaultRegistry } from "../cards.js";
import { HeuristicBotController } from "../controller.js";
import { effectWorth } from "../effect-worth.js";
import type { EffectSpec } from "../effects.js";
import { Game } from "../game.js";
import { asPlayerId } from "../primitives.js";
import type { ObjectId } from "../primitives.js";

const A = asPlayerId("alice");
const B = asPlayerId("bob");
const registry = createDefaultRegistry();

/** Alice's first main phase, both hands empty, `setup`'s board in place. */
function mainPhase(setup: (game: Game) => void): Game {
  const game = Game.create({
    seed: 3,
    registry,
    decks: [A, B].map((player) => ({ player, cards: Array<string>(40).fill("Forest") })),
  });
  game.advanceUntil((s) => s.priority.holder === A && s.turn.step === "precombat-main");
  for (const player of [A, B]) game.state.zones.perPlayer[player].hand = [];
  setup(game);
  return game;
}

const onBoard = (game: Game, name: string, player = A, tapped = false): ObjectId =>
  game.debugSpawn(name, player, "battlefield", { summoningSick: false, tapped });

const lands = (game: Game, name: string, count: number, player = A): void => {
  for (let i = 0; i < count; i += 1) onBoard(game, name, player);
};

const v1 = (game: Game): Action => new HeuristicBotController(A, registry).act(game.controllerView(A));

const casts = (action: Action, card: ObjectId): boolean => action.type === "cast-spell" && action.card === card;

describe("v1 doesn't cast a sweep at itself", () => {
  it("leaves Crux of Fate in hand when only its own creatures would die", () => {
    let crux: ObjectId = "" as ObjectId;
    const game = mainPhase((g) => {
      lands(g, "Swamp", 5);
      onBoard(g, "Shivan Dragon");
      onBoard(g, "Grizzly Bears");
      crux = g.debugSpawn("Crux of Fate", A, "hand");
    });
    expect(casts(v1(game), crux)).toBe(false);
  });

  it("casts Crux of Fate at the non-Dragons when those are the opponent's", () => {
    let crux: ObjectId = "" as ObjectId;
    const game = mainPhase((g) => {
      lands(g, "Swamp", 5);
      onBoard(g, "Shivan Dragon");
      onBoard(g, "Grizzly Bears", B);
      onBoard(g, "Grizzly Bears", B);
      crux = g.debugSpawn("Crux of Fate", A, "hand");
    });
    const action = v1(game);
    expect(casts(action, crux)).toBe(true);
    expect(action.type === "cast-spell" ? action.modes : undefined).toEqual([1]);
  });

  it("casts Crux of Fate at the Dragons when those are the opponent's", () => {
    let crux: ObjectId = "" as ObjectId;
    const game = mainPhase((g) => {
      lands(g, "Swamp", 5);
      onBoard(g, "Grizzly Bears");
      onBoard(g, "Shivan Dragon", B);
      onBoard(g, "Shivan Dragon", B);
      crux = g.debugSpawn("Crux of Fate", A, "hand");
    });
    const action = v1(game);
    expect(casts(action, crux)).toBe(true);
    expect(action.type === "cast-spell" ? action.modes : undefined).toEqual([0]);
  });

  it("leaves Wrath of God in hand with only its own creatures on the board, and casts it at the opponent's", () => {
    let wrath: ObjectId = "" as ObjectId;
    const alone = mainPhase((g) => {
      lands(g, "Plains", 4);
      onBoard(g, "Craw Wurm");
      wrath = g.debugSpawn("Wrath of God", A, "hand");
    });
    expect(casts(v1(alone), wrath)).toBe(false);
    const theirs = mainPhase((g) => {
      lands(g, "Plains", 4);
      onBoard(g, "Craw Wurm", B);
      onBoard(g, "Grizzly Bears", B);
      wrath = g.debugSpawn("Wrath of God", A, "hand");
    });
    expect(casts(v1(theirs), wrath)).toBe(true);
  });
});

describe("effectWorth prices a sweep by whose permanents it takes", () => {
  const wrath: EffectSpec = { kind: "destroy-all", filter: { type: "creature" } };
  const worth = (game: Game, effect: EffectSpec): number =>
    effectWorth(effect, { state: game.state, me: A, controller: A, targets: [], cards: registry });

  it("is negative with only our creatures, positive with only theirs", () => {
    expect(worth(mainPhase((g) => void onBoard(g, "Craw Wurm")), wrath)).toBeLessThan(0);
    expect(worth(mainPhase((g) => void onBoard(g, "Craw Wurm", B)), wrath)).toBeGreaterThan(0);
    expect(worth(mainPhase(() => {}), wrath)).toBe(0);
  });

  it("leaves out an indestructible creature a destroy wouldn't take (rule 702.12b)", () => {
    const game = mainPhase((g) => void onBoard(g, "Darksteel Colossus"));
    expect(worth(game, wrath)).toBe(0);
    expect(worth(game, { kind: "exile-all", filter: { type: "creature" } })).toBeLessThan(0);
  });

  it("counts a creature damage would kill, not one it wouldn't", () => {
    const game = mainPhase((g) => {
      onBoard(g, "Grizzly Bears", B);
      onBoard(g, "Craw Wurm");
    });
    // 2 to each creature: their 2/2 dies, our 6/4 doesn't.
    expect(worth(game, { kind: "damage-all", filter: { type: "creature" }, amount: 2 })).toBeGreaterThan(0);
    expect(worth(game, { kind: "damage-all", filter: { type: "creature" }, amount: 4 })).toBe(0);
  });
});

describe("v1 holds Teferi's Protection for something to answer", () => {
  it("doesn't phase its own board out in its own main phase", () => {
    let protection: ObjectId = "" as ObjectId;
    const game = mainPhase((g) => {
      lands(g, "Plains", 3);
      onBoard(g, "Craw Wurm");
      protection = g.debugSpawn("Teferi's Protection", A, "hand");
    });
    expect(casts(v1(game), protection)).toBe(false);
  });

  it("casts it with an opponent's spell on the stack", () => {
    const game = Game.create({
      seed: 3,
      registry,
      decks: [A, B].map((player) => ({ player, cards: Array<string>(40).fill("Forest") })),
    });
    game.advanceUntil(
      (s) => s.turnOrder[s.turn.activePlayerIndex] === B && s.priority.holder === B && s.turn.step === "precombat-main",
    );
    for (const player of [A, B]) game.state.zones.perPlayer[player].hand = [];
    lands(game, "Plains", 3);
    onBoard(game, "Craw Wurm");
    lands(game, "Plains", 4, B);
    const protection = game.debugSpawn("Teferi's Protection", A, "hand");
    const wrath = game.debugSpawn("Wrath of God", B, "hand");
    game.dispatch({ type: "cast-spell", player: B, card: wrath, targets: [] });
    game.advanceUntil((s) => s.priority.holder === A);
    expect(game.state.zones.shared.stack.length).toBe(1);
    expect(casts(v1(game), protection)).toBe(true);
  });
});

describe("v1 keeps its mana in its upkeep", () => {
  it("doesn't answer its own upkeep trigger with a spell its main phase could cast", () => {
    const game = mainPhase((g) => {
      lands(g, "Island", 2);
      onBoard(g, "Mana Vault", A, true);
    });
    // Alice's next upkeep, Mana Vault's "you may pay {4}" trigger on the stack.
    game.advanceUntil(
      (s) =>
        s.turn.number > 1 &&
        s.turnOrder[s.turn.activePlayerIndex] === A &&
        s.turn.step === "upkeep" &&
        s.priority.holder === A &&
        s.zones.shared.stack.length > 0,
    );
    expect(game.state.turn.step).toBe("upkeep");
    game.state.zones.perPlayer[A].hand = [];
    const opt = game.debugSpawn("Opt", A, "hand");
    expect(casts(v1(game), opt)).toBe(false);
  });

  it("still casts that spell in its main phase", () => {
    let opt: ObjectId = "" as ObjectId;
    const game = mainPhase((g) => {
      lands(g, "Island", 2);
      opt = g.debugSpawn("Opt", A, "hand");
    });
    expect(casts(v1(game), opt)).toBe(true);
  });
});

describe("v1 keeps the mana a spell needs from an optional payment", () => {
  /** Alice's draw step, asked whether to pay Smothering Tithe's {2}, with
   * `forests` untapped Forests and a Rumbling Baloth ({2}{G}{G}) in hand. */
  function titheAsked(forests: number): Game {
    const game = mainPhase((g) => {
      lands(g, "Forest", forests);
      onBoard(g, "Smothering Tithe", B);
    });
    game.advanceUntil(
      (s) =>
        s.turn.number > 1 &&
        s.turnOrder[s.turn.activePlayerIndex] === A &&
        s.awaiting?.kind === "choose-modes" &&
        s.awaiting.player === A,
    );
    expect(game.state.turn.step).toBe("draw");
    game.state.zones.perPlayer[A].hand = [];
    game.debugSpawn("Rumbling Baloth", A, "hand");
    return game;
  }
  const answer = (game: Game): readonly number[] => {
    const action = v1(game);
    return action.type === "choose-modes" ? action.modes : [-1];
  };

  it("declines Smothering Tithe's {2} when paying leaves its four-drop uncastable", () => {
    expect(answer(titheAsked(4))).toEqual([]);
  });

  it("pays it with mana to spare", () => {
    expect(answer(titheAsked(6))).toEqual([0]);
  });

  it("pays it with nothing in hand to cast", () => {
    const game = titheAsked(4);
    game.state.zones.perPlayer[A].hand = [];
    expect(answer(game)).toEqual([0]);
  });

  it("answers each turn's ask afresh, from one bot over one game", () => {
    // The game changes its state in place, so an answer remembered by the
    // state object stood for every later ask: a bot that declined once
    // declined for the rest of the game.
    const game = titheAsked(4);
    const bot = new HeuristicBotController(A, registry);
    const first = bot.act(game.controllerView(A));
    expect(first.type === "choose-modes" ? first.modes : [-1]).toEqual([]);
    game.dispatch(first);
    const turn = game.state.turn.number;
    game.advanceUntil(
      (s) => s.turn.number > turn && s.awaiting?.kind === "choose-modes" && s.awaiting.player === A,
    );
    game.state.zones.perPlayer[A].hand = [];
    const second = bot.act(game.controllerView(A));
    expect(second.type === "choose-modes" ? second.modes : [-1]).toEqual([0]);
  });
});

describe("v1 holds a reanimation spell for a target worth it", () => {
  /** Alice with a Swamp and Reanimate; `graveyard` in Bob's graveyard, a
   * Craw Wurm of Bob's on the battlefield still to die. */
  function reanimateOffered(graveyard: readonly string[], life = 40): { game: Game; reanimate: ObjectId; cards: ObjectId[] } {
    let reanimate: ObjectId = "" as ObjectId;
    let cards: ObjectId[] = [];
    const game = mainPhase((g) => {
      lands(g, "Swamp", 1);
      onBoard(g, "Craw Wurm", B);
      cards = graveyard.map((name) => g.debugSpawn(name, B, "graveyard"));
      reanimate = g.debugSpawn("Reanimate", A, "hand");
      g.state.players[A].life = life;
    });
    return { game, reanimate, cards };
  }

  it("keeps Reanimate with only a one-drop in the graveyards", () => {
    const { game, reanimate } = reanimateOffered(["Walking Bulwark"]);
    expect(casts(v1(game), reanimate)).toBe(false);
  });

  it("casts it at a six-drop, past the one-drop beside it", () => {
    const { game, reanimate, cards } = reanimateOffered(["Walking Bulwark", "Craw Wurm"]);
    const action = v1(game);
    expect(casts(action, reanimate)).toBe(true);
    expect(action.type === "cast-spell" ? action.targets?.[0] : undefined).toEqual({ kind: "object", object: cards[1] });
  });

  it("takes the one-drop when it's low on life and needs a body", () => {
    const { game, reanimate } = reanimateOffered(["Walking Bulwark"], 8);
    expect(casts(v1(game), reanimate)).toBe(true);
  });
});

describe("a draw keeps a reserve in the library", () => {
  const draw = (n: number): EffectSpec => ({ kind: "draw", amount: n });
  const worth = (game: Game, effect: EffectSpec): number =>
    effectWorth(effect, { state: game.state, me: A, controller: A, targets: [], cards: registry });
  const withLibrary = (cards: number, setup: (game: Game) => void = () => {}): Game =>
    mainPhase((g) => {
      g.state.zones.perPlayer[A].library = g.state.zones.perPlayer[A].library.slice(0, cards);
      setup(g);
    });

  it("is worth a card each with a full library", () => {
    expect(worth(mainPhase(() => {}), draw(2))).toBe(4);
  });

  it("is worth less than nothing once it would take the library below fifteen", () => {
    expect(worth(withLibrary(15), draw(1))).toBeLessThan(0);
    // Sixteen cards: the first of three is spare, the other two aren't.
    expect(worth(withLibrary(16), draw(3))).toBe(-2);
    expect(worth(withLibrary(17), draw(1))).toBe(2);
  });

  it("still reads a draw the library can't pay as losing the game (rule 104.3c)", () => {
    expect(worth(withLibrary(2), draw(3))).toBe(-100);
  });

  it("doesn't cast Harmonize into a library of ten, and does into a full one", () => {
    let harmonize: ObjectId = "" as ObjectId;
    const low = withLibrary(10, (g) => {
      lands(g, "Forest", 4);
      harmonize = g.debugSpawn("Harmonize", A, "hand");
    });
    expect(casts(v1(low), harmonize)).toBe(false);
    const full = mainPhase((g) => {
      lands(g, "Forest", 4);
      harmonize = g.debugSpawn("Harmonize", A, "hand");
    });
    expect(casts(v1(full), harmonize)).toBe(true);
  });
});
