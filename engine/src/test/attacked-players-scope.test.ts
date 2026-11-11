import { describe, expect, it } from "vitest";

import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, C, D, cast, graveyard, hand, lands, nextTurn, ref, spawn, table, toHand, toStep, tokensNamed } from "./harness.js";

// "Those players" a batch of attackers attacked: the `"attacked-players"` and
// `"you-and-attacked-players"` scopes (rules 506.2, 508.1b) — Zurzoth, Chaos
// Rider.

type Seat = ReturnType<typeof table>["a"];
const attackEach = (game: ReturnType<typeof table>["game"], seat: Seat, at: readonly (readonly [ObjectId, PlayerId | ObjectId])[]): void => {
  seat.declareAttackersFn = () => at.map(([attacker, defender]) => ({ attacker, defender }));
  toStep(game, "postcombat-main", seat.playerId);
};
const drawn = (game: ReturnType<typeof table>["game"], player: PlayerId): number =>
  game.eventsOfType("card-drawn").filter((e) => e.player === player).length;

describe("Zurzoth, Chaos Rider — you and those players", () => {
  it("each player a Devil attacked draws and discards at random, with its controller; nobody else", () => {
    const { game, a } = table({ players: 4 });
    const zurzoth = spawn(game, "Zurzoth, Chaos Rider");
    const devil = spawn(game, "Devil Token");
    const bear = spawn(game, "Grizzly Bears");
    const before = Object.fromEntries([A, B, C, D].map((p) => [p, { drawn: drawn(game, p), hand: hand(game, p).length }]));
    attackEach(game, a, [
      [zurzoth, B],
      [devil, C],
      [bear, D], // not a Devil: Dave isn't one of "those players"
    ]);
    for (const p of [A, B, C]) {
      expect(drawn(game, p) - before[p].drawn).toBe(1);
      expect(graveyard(game, p).length).toBe(1);
      expect(hand(game, p).length).toBe(before[p].hand);
    }
    expect(drawn(game, D) - before[D].drawn).toBe(0);
    expect(graveyard(game, D).length).toBe(0);
  });

  it("triggers once however many Devils attack one player", () => {
    const { game, a } = table({ players: 3 });
    const zurzoth = spawn(game, "Zurzoth, Chaos Rider");
    const devil = spawn(game, "Devil Token");
    const before = drawn(game, B);
    attackEach(game, a, [
      [zurzoth, B],
      [devil, B],
    ]);
    expect(drawn(game, B) - before).toBe(1);
    expect(graveyard(game, A).length).toBe(1);
    expect(graveyard(game, C).length).toBe(0);
  });

  it("a Devil attacking a planeswalker makes nobody draw or discard (the ruling)", () => {
    const { game, a } = table();
    spawn(game, "Zurzoth, Chaos Rider");
    const devil = spawn(game, "Devil Token");
    const jace = spawn(game, "Jace Beleren", B);
    game.state.objects[jace].counters = { loyalty: 3 };
    const before = [drawn(game, A), drawn(game, B)];
    attackEach(game, a, [[devil, jace]]);
    expect([drawn(game, A), drawn(game, B)]).toEqual(before);
    expect(graveyard(game, A).length).toBe(0);
    expect(graveyard(game, B).length).toBe(0);
  });

  it("only the players attacked by Devils that attacked a player, when another Devil attacks a planeswalker", () => {
    const { game, a } = table({ players: 3 });
    const zurzoth = spawn(game, "Zurzoth, Chaos Rider");
    const devil = spawn(game, "Devil Token");
    const jace = spawn(game, "Jace Beleren", C);
    game.state.objects[jace].counters = { loyalty: 3 };
    const before = [drawn(game, B), drawn(game, C)];
    attackEach(game, a, [
      [zurzoth, B],
      [devil, jace],
    ]);
    expect(drawn(game, B) - before[0]).toBe(1);
    expect(drawn(game, C) - before[1]).toBe(0);
  });
});

describe("Zurzoth, Chaos Rider — an opponent's first draw of a turn that isn't theirs", () => {
  it("makes a Devil for the first card only, and none for a draw on their own turn", () => {
    const { game } = table();
    spawn(game, "Zurzoth, Chaos Rider");
    lands(game, "Island", 8);
    cast(game, toHand(game, "Inspiration"), { targets: [ref(B)] }); // Bob draws two
    expect(tokensNamed(game, "Devil Token", A)).toBe(1);
    cast(game, toHand(game, "Inspiration"), { targets: [ref(B)] });
    expect(tokensNamed(game, "Devil Token", A)).toBe(1);
    nextTurn(game); // Bob's turn: his draw step's card is his first, on his turn
    expect(game.state.turn.number).toBe(2);
    expect(tokensNamed(game, "Devil Token", A)).toBe(1);
  });

  it("not for an opponent's draw on that opponent's own turn", () => {
    const { game } = table();
    spawn(game, "Zurzoth, Chaos Rider", B);
    lands(game, "Island", 4);
    cast(game, toHand(game, "Inspiration"), { targets: [ref(A)] }); // Alice's turn, Alice draws: her own turn
    expect(tokensNamed(game, "Devil Token", B)).toBe(0);
  });
});
