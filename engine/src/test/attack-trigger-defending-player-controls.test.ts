/**
 * An attack trigger's intervening "if defending player controls no …"
 * (`of-player` over `"that-player"`, the defending player — rule 603.4):
 * Fear of the Dark's "whenever this creature attacks, if defending player
 * controls no Glimmer creatures, it gains menace and deathtouch until end of
 * turn". Read from the player it attacks, not every opponent.
 */
import { describe, expect, it } from "vitest";

import { B, C, attack, keywords, spawn, table } from "./harness.js";

describe("Fear of the Dark", () => {
  it("gains menace and deathtouch attacking a player with no Glimmer creatures", () => {
    const { game, a } = table();
    const fear = spawn(game, "Fear of the Dark");
    attack(game, a, [fear], B);
    expect(keywords(game, fear).has("menace")).toBe(true);
    expect(keywords(game, fear).has("deathtouch")).toBe(true);
  });

  it("gains nothing attacking a player who controls a Glimmer creature", () => {
    const { game, a } = table();
    const fear = spawn(game, "Fear of the Dark");
    spawn(game, "Enduring Curiosity", B);
    attack(game, a, [fear], B);
    expect(keywords(game, fear).has("menace")).toBe(false);
    expect(keywords(game, fear).has("deathtouch")).toBe(false);
  });

  it("reads the defending player alone: another opponent's Glimmer doesn't count", () => {
    const { game, a } = table({ players: 3 });
    const fear = spawn(game, "Fear of the Dark");
    spawn(game, "Enduring Curiosity", B);
    attack(game, a, [fear], C);
    expect(keywords(game, fear).has("menace")).toBe(true);
    expect(keywords(game, fear).has("deathtouch")).toBe(true);
  });
});
