import { describe, expect, it } from "vitest";

import { A, B, C, attack, grant, life, spawn, table } from "./harness.js";

/**
 * Rule 800.4e: "If combat damage would be assigned to a player who has left
 * the game, that damage isn't assigned." A bug report (2026-11-17, a live
 * four-player game): three double-striking Dragons took a player from 18 to
 * -4 in the first combat damage step, the player lost, and the second step
 * dealt the same 22 again — life to -26, in the log.
 */
describe("combat damage and a player who has left the game (rule 800.4e)", () => {
  const hitsOn = (game: ReturnType<typeof table>["game"], player: typeof B) =>
    game.state.eventLog.filter(
      (e) => e.type === "damage-dealt" && e.combat && e.target.kind === "player" && e.target.player === player,
    );

  it("a double striker's second strike isn't dealt to the player its first strike killed", () => {
    const { game, a } = table({ players: 3 });
    const ace = spawn(game, "Fencing Ace"); // 1/1, double strike
    grant(game, ace, "lifelink");
    game.state.players[B].life = 1;
    const before = life(game, A);

    attack(game, a, [ace], B);

    expect(game.state.players[B].hasLost).toBe(true);
    // The first strike's 1, and nothing after it.
    expect(hitsOn(game, B)).toHaveLength(1);
    expect(life(game, B)).toBe(0);
    // Lifelink is the damage dealt (rule 702.15b): once.
    expect(life(game, A)).toBe(before + 1);
    // The game goes on between the two left.
    expect(game.state.result.over).toBe(false);
    expect(game.state.players[C].hasLost).toBeFalsy();
  });

  it("still strikes twice at a player who lives through the first", () => {
    const { game, a } = table({ players: 3 });
    const ace = spawn(game, "Fencing Ace");
    grant(game, ace, "lifelink");
    game.state.players[B].life = 5;
    const before = life(game, A);

    attack(game, a, [ace], B);

    expect(hitsOn(game, B)).toHaveLength(2);
    expect(life(game, B)).toBe(3);
    expect(life(game, A)).toBe(before + 2);
  });

  it("a second attacker without first strike deals nothing to the player a first striker killed", () => {
    // The regular damage step, after a first-strike step that ended the
    // defender: the Bears' 2 isn't assigned either.
    const { game, a } = table({ players: 3 });
    const ace = spawn(game, "Fencing Ace");
    const bears = spawn(game, "Grizzly Bears");
    grant(game, bears, "lifelink");
    game.state.players[B].life = 1;
    const before = life(game, A);

    attack(game, a, [ace, bears], B);

    expect(game.state.players[B].hasLost).toBe(true);
    expect(hitsOn(game, B)).toHaveLength(1);
    expect(life(game, B)).toBe(0);
    expect(life(game, A)).toBe(before);
  });
});
