/**
 * "Each player chooses a card name. Then each player reveals the top card of
 * their library" (Conundrum Sphinx): a `vote` with `choose` for a card name
 * (`for: { cardName }`), every name in — the active player first, then each
 * other player in turn order (the ruling) — before any card is revealed; then
 * `for-each-vote` hands each player their own name (`CHOSEN_THIS_WAY`).
 */
import { describe, expect, it } from "vitest";

import { A, B, C, attack, hand, spawn, table, toLibrary, zone } from "./harness.js";
import type { PlayerId } from "../primitives.js";

describe("Conundrum Sphinx: each player names a card, then each reveals", () => {
  it("asks every name before anything is revealed, active player first", () => {
    const { game, a, b, c } = table({ players: 3 });
    const sphinx = spawn(game, "Conundrum Sphinx");
    const tops = [
      toLibrary(game, "Hill Giant", A),
      toLibrary(game, "Grizzly Bears", B),
      toLibrary(game, "Lightning Bolt", C),
    ];
    const asked: PlayerId[] = [];
    const name = (player: PlayerId, answer: string) => (): string => {
      asked.push(player);
      // Nobody's top card has moved yet.
      for (const id of tops) expect(zone(game, id)).toBe("library");
      return answer;
    };
    a.chooseCardNameFn = name(A, "Hill Giant");
    b.chooseCardNameFn = name(B, "Hill Giant");
    c.chooseCardNameFn = name(C, "Lightning Bolt");
    attack(game, a, [sphinx]);
    expect(asked).toEqual([A, B, C]);
  });

  it("puts a named card into its owner's hand, and any other on the bottom — even another player's name", () => {
    const { game, a, b } = table();
    const sphinx = spawn(game, "Conundrum Sphinx");
    const giant = toLibrary(game, "Hill Giant", A);
    const bears = toLibrary(game, "Grizzly Bears", B);
    a.chooseCardNameFn = () => "Hill Giant";
    // Bob names alice's card, not his own.
    b.chooseCardNameFn = () => "Hill Giant";
    const bobHand = hand(game, B).length;
    attack(game, a, [sphinx]);
    expect(zone(game, giant)).toBe("hand");
    expect(zone(game, bears)).toBe("library");
    const library = game.state.zones.perPlayer[B].library;
    expect(library.at(-1)).toBe(bears);
    expect(library[0]).not.toBe(bears);
    expect(hand(game, B).length).toBe(bobHand);
  });

  it("logs each name as a choice", () => {
    const { game, a, b } = table();
    const sphinx = spawn(game, "Conundrum Sphinx");
    toLibrary(game, "Hill Giant", A);
    a.chooseCardNameFn = () => "Hill Giant";
    b.chooseCardNameFn = () => "Island";
    attack(game, a, [sphinx]);
    const finished = game.state.eventLog.filter((e) => e.type === "votes-finished");
    expect(finished.at(-1)).toMatchObject({
      votes: [
        { voter: A, choice: { name: "Hill Giant" } },
        { voter: B, choice: { name: "Island" } },
      ],
      choice: true,
    });
  });
});
