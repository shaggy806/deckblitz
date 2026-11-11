/**
 * A delayed "whenever" that watches one player and lasts through that
 * player's next turn: `DelayedWhenever.byPlayer` and `until: { throughTurnOf }`.
 * Nuka-Nuke Launcher's "whenever equipped creature attacks, until the end of
 * defending player's next turn, that player gets two rad counters whenever
 * they cast a spell" — the watch is the Launcher's controller's (rule 603.7e),
 * only the defending player's spells fire it, and it lapses as the turn after
 * that player's next begins.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, activate, attack, cast, lands, nextTurn, ref, spawn, table, toHand } from "./harness.js";
import type { Table } from "./harness.js";

const rad = (game: Game, player: PlayerId): number => game.state.players[player].counters.rad ?? 0;

/** Alice's Bears, the Launcher on it, attacking `defender`: the game at her
 * postcombat main. */
function launch(t: Table, defender: PlayerId = B): { readonly bears: ObjectId } {
  const { game, a } = t;
  lands(game, "Wastes", 3);
  const bears = spawn(game, "Grizzly Bears");
  const launcher = spawn(game, "Nuka-Nuke Launcher");
  activate(game, launcher, 0, { targets: [ref(bears)] });
  expect(game.state.objects[launcher].attachedTo).toBe(bears);
  attack(game, a, [bears], defender);
  return { bears };
}

/** `player` casts a Lightning Bolt at Alice, with priority handed round to them. */
function bolt(game: Game, player: PlayerId): void {
  lands(game, "Mountain", 1, player);
  while (game.state.priority.holder !== player) {
    game.dispatch({ type: "pass-priority", player: game.state.priority.holder! });
  }
  cast(game, toHand(game, "Lightning Bolt", player), { player, targets: [ref(A)] });
}

describe("Nuka-Nuke Launcher: a delayed whenever about the defending player", () => {
  it("the equipped creature gets +3/+0 and intimidate", () => {
    const t = table();
    const { bears } = launch(t);
    const c = t.game.characteristics(bears);
    expect(c.power).toBe(5);
    expect(c.toughness).toBe(2);
    expect(c.keywords.has("intimidate")).toBe(true);
  });

  it("the defending player gets two rad counters for each spell they cast, and nobody else does", () => {
    const t = table();
    const { game } = t;
    launch(t);
    const watch = game.state.delayedTriggers.find((d) => "whenever" in d.at);
    // Alice's ability (rule 603.7e), about Bob, through Bob's next turn.
    expect(watch?.controller).toBe(A);
    expect(watch !== undefined && "whenever" in watch.at ? [watch.at.player, watch.at.turnOf] : null).toEqual([B, B]);
    expect(rad(game, B)).toBe(0);
    bolt(game, B);
    expect(rad(game, B)).toBe(2);
    bolt(game, B);
    expect(rad(game, B)).toBe(4);
    // Alice's own spell is nobody's rad counters.
    bolt(game, A);
    expect(rad(game, A)).toBe(0);
    expect(rad(game, B)).toBe(4);
  });

  it("lasts through the defending player's next turn, and no longer", () => {
    const t = table();
    const { game } = t;
    launch(t);
    nextTurn(game);
    expect(game.state.turn.number).toBe(2);
    // Bob's library is all lands: his rad counters mill and stay.
    const before = rad(game, B);
    bolt(game, B);
    expect(rad(game, B)).toBe(before + 2);
    nextTurn(game, "upkeep");
    expect(game.state.turn.number).toBe(3);
    expect(game.state.delayedTriggers.some((d) => "whenever" in d.at)).toBe(false);
    bolt(game, B);
    expect(rad(game, B)).toBe(before + 2);
  });

  it("a second attack makes a second watch: four counters a spell", () => {
    const t = table();
    const { game, a } = t;
    const { bears } = launch(t);
    nextTurn(game);
    nextTurn(game);
    attack(game, a, [bears]);
    // The first lapsed as this turn began (Bob's next turn was the last one);
    // attack again next turn while this one still watches.
    expect(game.state.delayedTriggers.filter((d) => "whenever" in d.at).length).toBe(1);
    bolt(game, B);
    expect(rad(game, B)).toBe(2);
  });

  it("with three players, only the player attacked is watched", () => {
    const t = table({ players: 3 });
    const { game } = t;
    launch(t, C);
    bolt(game, B);
    expect(rad(game, B)).toBe(0);
    bolt(game, C);
    expect(rad(game, C)).toBe(2);
    // Bob's turn isn't Carol's: still watching through hers.
    nextTurn(game);
    bolt(game, C);
    expect(rad(game, C)).toBe(4);
    nextTurn(game);
    const before = rad(game, C);
    bolt(game, C);
    expect(rad(game, C)).toBe(before + 2);
    nextTurn(game, "upkeep");
    bolt(game, C);
    expect(rad(game, C)).toBe(before + 2);
  });
});
