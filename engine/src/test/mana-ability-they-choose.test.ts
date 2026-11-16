/**
 * A decision made by another player inside a mana ability — `add-mana`'s
 * `theyChoose` with `playerOfChoice`, Spectral Searchlight: "{T}: Choose a
 * player. That player adds one mana of any color they choose."
 *
 * It's a mana ability (rule 605.1a: no target), so it resolves at once and
 * never uses the stack (605.3b). The player is named as it's activated — an
 * offer per player still in the game — and the colour is the named player's
 * choice (608.2d): naming themselves, the activator picks it as they activate
 * (as the auto-payer does), and naming another player, that player is asked
 * once the cost is paid, nobody getting priority until the ability has
 * resolved; the activator gets it back afterwards (405.6c).
 */
import { describe, expect, it } from "vitest";

import { EvalBotController } from "../bot/index.js";
import { HeuristicBotController } from "../controller.js";
import type { Game } from "../game.js";
import type { ManaType } from "../mana.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, D, cast, pickModes, ref, settle, spawn, table, toHand, zone } from "./harness.js";

const SEARCHLIGHT = "Spectral Searchlight";

const pool = (game: Game, player: PlayerId): readonly ManaType[] => game.state.players[player].manaPool.map((u) => u.type);

/** The Searchlight's offers to `player`, as the player each names and the colours each picks. */
function offers(game: Game, light: ObjectId, player: PlayerId = A): { manaFor?: PlayerId; manaColors?: readonly ManaType[] }[] {
  return game
    .legalActions(player)
    .flatMap((a) =>
      a.kind === "activate-ability" && a.source === light
        ? [{ ...(a.manaFor !== undefined ? { manaFor: a.manaFor } : {}), ...(a.manaColors !== undefined ? { manaColors: a.manaColors } : {}) }]
        : [],
    );
}

function tapFor(game: Game, light: ObjectId, manaFor: PlayerId, manaColors?: readonly ManaType[], player: PlayerId = A): void {
  game.dispatch({
    type: "activate-ability",
    player,
    source: light,
    abilityIndex: 0,
    targets: [],
    manaFor,
    ...(manaColors !== undefined ? { manaColors } : {}),
  });
}

describe("Spectral Searchlight: the player chosen chooses the colour", () => {
  it("is offered a colour at a time for its controller, and once for each other player", () => {
    const { game } = table();
    const light = spawn(game, SEARCHLIGHT);
    const listed = offers(game, light);
    expect(listed.filter((o) => o.manaFor === A).map((o) => o.manaColors)).toEqual([["W"], ["U"], ["B"], ["R"], ["G"]]);
    // Bob's colour is his, so his offer picks none; it comes after Alice's.
    expect(listed.filter((o) => o.manaFor === B)).toEqual([{ manaFor: B }]);
    expect(listed.map((o) => o.manaFor)).toEqual([A, A, A, A, A, B]);
  });

  it("at four players, one offer for each of the other three", () => {
    const { game } = table({ players: 4 });
    const light = spawn(game, SEARCHLIGHT);
    const listed = offers(game, light);
    expect(listed.filter((o) => o.manaFor === A)).toHaveLength(5);
    expect(listed.filter((o) => o.manaFor !== A)).toEqual([{ manaFor: B }, { manaFor: C }, { manaFor: D }]);
    expect(listed.map((o) => o.manaFor)).toEqual([A, A, A, A, A, B, C, D]);
  });

  it("naming yourself: your colour, at once, nothing asked", () => {
    const { game } = table();
    const light = spawn(game, SEARCHLIGHT);
    tapFor(game, light, A, ["G"]);
    expect(game.state.awaiting).toBeNull();
    expect(pool(game, A)).toEqual(["G"]);
    expect(game.state.objects[light].tapped).toBe(true);
    expect(game.state.priority.holder).toBe(A);
  });

  it("naming another player asks them, off the stack, and their pick goes to their pool", () => {
    const { game } = table();
    const light = spawn(game, SEARCHLIGHT);
    // A colour sent along with the activation is no one's word but Bob's.
    tapFor(game, light, B, ["W"]);
    expect(game.state.zones.shared.stack).toEqual([]);
    expect(game.state.objects[light].tapped).toBe(true);
    const asked = game.state.awaiting;
    expect(asked).toMatchObject({ kind: "choose-modes", player: B, source: light, minModes: 1, maxModes: 1 });
    expect(asked?.kind === "choose-modes" ? asked.modes.map((m) => m.text) : []).toEqual([
      "Add {W}.",
      "Add {U}.",
      "Add {B}.",
      "Add {R}.",
      "Add {G}.",
    ]);
    // Nobody has priority while it's asked, and the mana isn't made yet.
    expect(game.legalActions(A)).toEqual([]);
    expect(pool(game, B)).toEqual([]);
    // Only Bob answers it.
    expect(() => game.dispatch({ type: "choose-modes", player: A, modes: [3] })).toThrow(/not being asked to choose modes/);
    game.dispatch({ type: "choose-modes", player: B, modes: [3] });
    expect(pool(game, B)).toEqual(["R"]);
    expect(pool(game, A)).toEqual([]);
    expect(game.state.awaiting).toBeNull();
    // Alice activated it with priority, so it's hers again (rule 405.6c).
    expect(game.state.priority.holder).toBe(A);
    expect(game.state.priority.passed).toEqual([]);
  });

  it("the question goes through the chosen seat's controller", () => {
    const { game, b, d } = table({ players: 4 });
    const light = spawn(game, SEARCHLIGHT);
    pickModes(b, 0);
    pickModes(d, 4);
    tapFor(game, light, D);
    expect(game.state.awaiting).toMatchObject({ kind: "choose-modes", player: D });
    settle(game);
    expect(pool(game, D)).toEqual(["G"]);
    expect(pool(game, B)).toEqual([]);
  });

  it("resolves once answered: a tap-for-mana doubler doubles what the chosen player chose", () => {
    const { game } = table();
    spawn(game, "Mana Reflection");
    const light = spawn(game, SEARCHLIGHT);
    tapFor(game, light, B);
    game.dispatch({ type: "choose-modes", player: B, modes: [1] });
    expect(pool(game, B)).toEqual(["U", "U"]);
  });

  it("pays its controller's own cost, choosing themselves", () => {
    const { game } = table();
    spawn(game, SEARCHLIGHT);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(game.state.players[B].life).toBe(17);
  });
});

describe("the bots answer the colour", () => {
  const viewFor = (game: Game) => ({ player: B, state: game.state, legalActions: () => game.legalActions(B) });
  const bots = [
    ["v1", (game: Game) => new HeuristicBotController(B, game.registry)],
    ["v2", (game: Game) => new EvalBotController(B, game.registry, { maxSimulations: 8 })],
  ] as const;

  for (const [name, make] of bots) {
    it(`${name} answers with one of the colours, and the mana is its own`, () => {
      const { game } = table();
      const light = spawn(game, SEARCHLIGHT);
      tapFor(game, light, B);
      const answer = make(game).act(viewFor(game));
      expect(answer).toMatchObject({ type: "choose-modes", player: B });
      game.dispatch(answer);
      expect(pool(game, B)).toHaveLength(1);
      expect(pool(game, A)).toEqual([]);
    });
  }

  it("v1 takes the colour its hand wants", () => {
    const { game } = table();
    toHand(game, "Giant Growth", B);
    const light = spawn(game, SEARCHLIGHT);
    tapFor(game, light, B);
    expect(new HeuristicBotController(B, game.registry).act(viewFor(game))).toMatchObject({ modes: [4] });
  });
});
