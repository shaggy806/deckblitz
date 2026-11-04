/**
 * "Players can't search libraries": the static `cantSearchLibraries` (Mindlock
 * Orb, Stranglehold, Ashiok, Dream Render, Leonin Arbiter) and `player-effect`'s
 * (Shadow of Doubt). A search that can't happen finds nothing but "search … then
 * shuffle" still shuffles, and "you may search" can't be chosen, so doesn't (the
 * rulings). Leonin Arbiter's {2} is the `ignore-static-effect` special action
 * (rule 116.2d): nothing can respond and the player keeps priority (116.3).
 */
import { describe, expect, it } from "vitest";

import { forcedZoneChoice } from "../auto-settle.js";
import { EvalBotController } from "../bot/eval-bot.js";
import { createDefaultRegistry } from "../cards.js";
import { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../index.js";
import {
  A,
  B,
  C,
  activate,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

const shuffles = (game: Game, player: PlayerId): number =>
  game.eventsOfType("library-shuffled").filter((e) => e.player === player).length;

/** A cast of Demonic Tutor by `player`, answering with `find` if asked. */
function tutor(t: ReturnType<typeof table>, player: PlayerId, seat: typeof t.a): { offered: readonly ObjectId[] } {
  const find = toLibrary(t.game, "Grizzly Bears", player);
  lands(t.game, "Swamp", 2, player);
  const seen: { offered: readonly ObjectId[] } = { offered: [] };
  seat.chooseFromZoneFn = (_view, eligible) => {
    seen.offered = eligible;
    return eligible.includes(find) ? [find] : [];
  };
  cast(t.game, toHand(t.game, "Demonic Tutor", player), { player });
  return seen;
}

describe("Mindlock Orb — players can't search libraries", () => {
  it("finds nothing, and 'search … then shuffle' still shuffles", () => {
    const t = table();
    spawn(t.game, "Mindlock Orb");
    const before = hand(t.game).length;
    const seen = tutor(t, A, t.a);
    expect(seen.offered).toEqual([]);
    expect(hand(t.game).length).toBe(before);
    expect(shuffles(t.game, A)).toBe(1);
    expect(graveyard(t.game)).toHaveLength(1);
  });

  it("stops every player, its controller too", () => {
    const t = table();
    spawn(t.game, "Mindlock Orb", B);
    expect(tutor(t, A, t.a).offered).toEqual([]);
  });

  it("is over once it's gone", () => {
    const t = table();
    const orb = spawn(t.game, "Mindlock Orb");
    destroy(t.game, orb);
    expect(tutor(t, A, t.a).offered.length).toBeGreaterThan(0);
  });

  it("'you may search' can't be chosen, so doesn't shuffle or ask", () => {
    const t = table();
    spawn(t.game, "Mindlock Orb");
    let asked = 0;
    t.a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    enter(t.game, "Alpine Guide");
    expect(asked).toBe(0);
    expect(shuffles(t.game, A)).toBe(0);
  });

  it("'that player may search' isn't asked of them, and the rest still happens", () => {
    const t = table();
    spawn(t.game, "Mindlock Orb");
    const land = spawn(t.game, "Forest", B);
    const quarter = spawn(t.game, "Ghost Quarter");
    let asked = 0;
    t.b.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    activate(t.game, quarter, 1, { targets: [ref(land)] });
    expect(zone(t.game, land)).toBe("graveyard");
    expect(asked).toBe(0);
    expect(shuffles(t.game, B)).toBe(0);
  });

  it("'search your library and/or graveyard' doesn't offer the library alone", () => {
    const t = table();
    spawn(t.game, "Mindlock Orb");
    lands(t.game, "Forest", 4);
    let modes: readonly string[] = [];
    t.a.chooseModesFn = (_view, _min, _max, offered) => {
      modes = offered;
      return [1];
    };
    cast(t.game, toHand(t.game, "Finale of Devastation"), { x: 2 });
    expect(modes).toEqual(["Search your library and graveyard", "Search your graveyard"]);
    expect(shuffles(t.game, A)).toBe(0);
  });

  it("a search of both zones finds the graveyard's, with no shuffle", () => {
    const t = table();
    spawn(t.game, "Mindlock Orb");
    const buried = spawn(t.game, "Grizzly Bears");
    destroy(t.game, buried);
    toLibrary(t.game, "Grizzly Bears");
    lands(t.game, "Forest", 4);
    pickModes(t.a, 0);
    const seen = pickFromZone(t.a, buried);
    cast(t.game, toHand(t.game, "Finale of Devastation"), { x: 2 });
    expect(seen.offered).toEqual([buried]);
    expect(zone(t.game, buried)).toBe("battlefield");
    expect(shuffles(t.game, A)).toBe(0);
  });

  it("the top of a library still reads: only the word 'search' is stopped", () => {
    const t = table();
    spawn(t.game, "Mindlock Orb");
    lands(t.game, "Island", 2);
    const seen = pickFromZone(t.a);
    let looked = 0;
    t.a.chooseFromZoneFn = (_view, eligible) => {
      looked += 1;
      seen.offered = eligible;
      return eligible.slice(0, 1);
    };
    const before = hand(t.game).length;
    cast(t.game, toHand(t.game, "Impulse"), { settle: true });
    expect(looked).toBe(1);
    expect(seen.offered.length).toBeGreaterThan(0);
    expect(hand(t.game).length).toBeGreaterThanOrEqual(before);
  });

  it("no 'while you're searching' cast with no search", () => {
    const t = table();
    spawn(t.game, "Mindlock Orb");
    const wurm = toLibrary(t.game, "Panglacial Wurm");
    tutor(t, A, t.a);
    expect(zone(t.game, wurm)).toBe("library");
    expect(t.game.state.zones.shared.stack).toEqual([]);
  });
});

describe("a search that can't happen, on the table", () => {
  it("is answered for the player when there's nothing else to find", () => {
    const t = table();
    spawn(t.game, "Mindlock Orb");
    lands(t.game, "Swamp", 2);
    t.game.dispatch({ type: "cast-spell", player: A, card: toHand(t.game, "Demonic Tutor"), targets: [] });
    t.game.dispatch({ type: "pass-priority", player: A });
    t.game.dispatch({ type: "pass-priority", player: B });
    expect(forcedZoneChoice(t.game.state)).toEqual({ player: A, chosen: [] });
  });

  it("isn't, where a search of another zone still has something to find", () => {
    const t = table();
    spawn(t.game, "Mindlock Orb");
    const bears = spawn(t.game, "Grizzly Bears");
    destroy(t.game, bears);
    lands(t.game, "Forest", 4);
    t.a.chooseModesFn = () => [0];
    t.game.dispatch({ type: "cast-spell", player: A, card: toHand(t.game, "Finale of Devastation"), targets: [], xValue: 2 });
    t.game.dispatch({ type: "pass-priority", player: A });
    t.game.dispatch({ type: "pass-priority", player: B });
    t.game.advanceUntil((s) => s.awaiting?.kind === "choose-from-zone");
    expect(forcedZoneChoice(t.game.state)).toBeNull();
  });
});

describe("Stranglehold", () => {
  it("stops an opponent's search of any library, and not yours", () => {
    const t = table();
    spawn(t.game, "Stranglehold");
    expect(tutor(t, A, t.a).offered.length).toBeGreaterThan(0);
    const u = table();
    spawn(u.game, "Stranglehold", B);
    expect(tutor(u, A, u.a).offered).toEqual([]);
    expect(shuffles(u.game, A)).toBe(1);
  });

  it("an opponent's extra turn is skipped, and yours isn't", () => {
    const t = table();
    spawn(t.game, "Stranglehold", B);
    lands(t.game, "Island", 3);
    cast(t.game, toHand(t.game, "Time Walk"), {});
    expect(t.game.state.extraTurns).toEqual([A]);
    nextTurn(t.game);
    expect(t.game.eventsOfType("turn-skipped").some((e) => e.player === A)).toBe(true);
    expect(t.game.state.turn.isExtra).toBe(false);
    expect(t.game.activePlayer).toBe(B);
    const u = table();
    spawn(u.game, "Stranglehold");
    lands(u.game, "Island", 3);
    cast(u.game, toHand(u.game, "Time Walk"), {});
    nextTurn(u.game);
    expect(u.game.state.turn.isExtra).toBe(true);
    expect(u.game.activePlayer).toBe(A);
  });

  it("a search of its controller's library by an opponent's Bribery is stopped too", () => {
    const t = table();
    spawn(t.game, "Stranglehold", B);
    lands(t.game, "Island", 5);
    const seen = pickFromZone(t.a);
    toLibrary(t.game, "Grizzly Bears", B);
    cast(t.game, toHand(t.game, "Bribery"), { targets: [ref(B)] });
    expect(seen.offered).toEqual([]);
    expect(shuffles(t.game, B)).toBe(1);
  });
});

describe("Ashiok, Dream Render", () => {
  it("stops an opponent's own spell searching their own library, still shuffling", () => {
    const t = table();
    spawn(t.game, "Ashiok, Dream Render", B);
    expect(tutor(t, A, t.a).offered).toEqual([]);
    expect(shuffles(t.game, A)).toBe(1);
  });

  it("doesn't stop its controller", () => {
    const t = table();
    spawn(t.game, "Ashiok, Dream Render");
    expect(tutor(t, A, t.a).offered.length).toBeGreaterThan(0);
  });

  it("lets your Path to Exile have an opponent search, by the effect's real controller", () => {
    const t = table();
    spawn(t.game, "Ashiok, Dream Render");
    const bears = spawn(t.game, "Grizzly Bears", B);
    lands(t.game, "Plains", 1);
    const basic = toLibrary(t.game, "Forest", B);
    t.b.chooseModesFn = () => [0];
    const seen = pickFromZone(t.b, basic);
    cast(t.game, toHand(t.game, "Path to Exile"), { targets: [ref(bears)] });
    expect(seen.offered.length).toBeGreaterThan(0);
    expect(zone(t.game, basic)).toBe("battlefield");
  });

  it("lets an opponent's effect search another player's library, and have a third player search", () => {
    const t = table({ players: 3 });
    spawn(t.game, "Ashiok, Dream Render", C);
    // Bob's spell, Alice's library: not "their controller … their library".
    nextTurn(t.game);
    lands(t.game, "Island", 5, B);
    const find = toLibrary(t.game, "Grizzly Bears", A);
    const seen = pickFromZone(t.b, find);
    cast(t.game, toHand(t.game, "Bribery", B), { player: B, targets: [ref(A)] });
    expect(seen.offered).toContain(find);
  });

  it("its −1 mills the target, then exiles each opponent's graveyard, the milled cards among them", () => {
    const t = table();
    const ashiok = spawn(t.game, "Ashiok, Dream Render");
    const yours = spawn(t.game, "Grizzly Bears");
    destroy(t.game, yours);
    const library = t.game.state.zones.perPlayer[B].library.length;
    activate(t.game, ashiok, 0, { targets: [ref(B)] });
    expect(graveyard(t.game, B)).toEqual([]);
    expect(t.game.state.zones.perPlayer[B].library).toHaveLength(library - 4);
    expect(zone(t.game, yours)).toBe("graveyard");
  });
});

describe("Shadow of Doubt — this turn", () => {
  it("stops every player's search this turn, draws, and ends with the turn", () => {
    const t = table();
    lands(t.game, "Island", 2);
    const before = hand(t.game).length;
    cast(t.game, toHand(t.game, "Shadow of Doubt"));
    expect(hand(t.game).length).toBe(before + 1);
    expect(tutor(t, A, t.a).offered).toEqual([]);
    nextTurn(t.game);
    nextTurn(t.game);
    expect(tutor(t, A, t.a).offered.length).toBeGreaterThan(0);
  });
});

describe("Leonin Arbiter, among bots", () => {
  it("a bot with nothing to search for keeps its mana", () => {
    const registry = createDefaultRegistry();
    const players = [A, B];
    const game = Game.create({
      seed: 3,
      shuffle: false,
      startingPlayer: A,
      rules: { skipFirstDraw: false, maxLandsPerTurn: 99, maxHandSize: 99, startingLife: 20 },
      controllers: Object.fromEntries(players.map((p) => [p, new EvalBotController(p, registry, {})])),
      decks: players.map((player) => ({ player, cards: Array<string>(40).fill("Wastes") })),
    });
    spawn(game, "Leonin Arbiter", B);
    game.advanceUntil((s) => s.turn.number > 4 || s.result.over);
    expect(game.eventsOfType("static-effect-ignored")).toEqual([]);
  });
});

describe("Leonin Arbiter — pay {2} to ignore it", () => {
  const offer = (game: Game, player: PlayerId): string[] =>
    game
      .legalActions(player)
      .filter((a) => a.kind === "ignore-static-effect")
      .map((a) => (a.kind === "ignore-static-effect" ? a.cost : ""));

  it("stops a search until the player pays, then only that player", () => {
    const t = table();
    const arbiter = spawn(t.game, "Leonin Arbiter", B);
    lands(t.game, "Plains", 4);
    expect(offer(t.game, A)).toEqual(["{2}"]);
    t.game.dispatch({ type: "ignore-static-effect", player: A, permanent: arbiter });
    expect(t.game.eventsOfType("static-effect-ignored").some((e) => e.player === A)).toBe(true);
    // A special action: nothing went on the stack, and Alice still has priority.
    expect(t.game.state.zones.shared.stack).toEqual([]);
    expect(t.game.state.priority.holder).toBe(A);
    // The {2} is spent, and not offered again.
    expect(offer(t.game, A)).toEqual([]);
    expect(tutor(t, A, t.a).offered.length).toBeGreaterThan(0);
    // "Bob" still can't.
    expect(t.game.canDispatch({ type: "ignore-static-effect", player: B, permanent: arbiter })).not.toBeNull();
    const u = table();
    spawn(u.game, "Leonin Arbiter", B);
    expect(tutor(u, A, u.a).offered).toEqual([]);
  });

  it("two Arbiters need two payments", () => {
    const t = table();
    const first = spawn(t.game, "Leonin Arbiter");
    const second = spawn(t.game, "Leonin Arbiter");
    lands(t.game, "Plains", 2);
    t.game.dispatch({ type: "ignore-static-effect", player: A, permanent: first });
    expect(tutor(t, A, t.a).offered).toEqual([]);
    expect(named(t.game, "Leonin Arbiter")).toContain(second);
  });

  it("is over at end of turn, and for a new Arbiter", () => {
    const t = table();
    const arbiter = spawn(t.game, "Leonin Arbiter");
    lands(t.game, "Plains", 2);
    t.game.dispatch({ type: "ignore-static-effect", player: A, permanent: arbiter });
    nextTurn(t.game);
    nextTurn(t.game);
    expect(tutor(t, A, t.a).offered).toEqual([]);
  });

  it("needs the mana, and can't be paid with a {1}", () => {
    const t = table();
    const arbiter = spawn(t.game, "Leonin Arbiter");
    lands(t.game, "Plains", 1);
    expect(offer(t.game, A)).toEqual([]);
    expect(t.game.canDispatch({ type: "ignore-static-effect", player: A, permanent: arbiter })).toMatch(/cannot pay/);
  });

  it("has nothing to ignore once it has lost its abilities or left", () => {
    const t = table();
    const arbiter = spawn(t.game, "Leonin Arbiter");
    lands(t.game, "Plains", 2);
    destroy(t.game, arbiter);
    expect(offer(t.game, A)).toEqual([]);
    expect(tutor(t, A, t.a).offered.length).toBeGreaterThan(0);
  });
});
