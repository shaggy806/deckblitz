/**
 * A delayed triggered mana ability (rules 603.7, 605.1b): "until end of turn,
 * whenever a player taps an Island for mana, that player adds an additional {U}"
 * (High Tide). It's a `delayed-trigger` whose `whenever` is `tapped-for-mana`,
 * read by `Game.tappedForManaExtras`: never on the stack, and counted by the
 * auto-payer.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, cast, enter, lands, nextTurn, spawn, table, toHand, zone } from "./harness.js";

const pool = (game: Game, player: PlayerId = A): string[] =>
  game.state.players[player].manaPool.map((u) => u.type).sort();

const tide = (game: Game, name = "High Tide", land = "Island"): ObjectId => {
  const payer = spawn(game, land, A);
  cast(game, toHand(game, name));
  return payer;
};

describe("High Tide", () => {
  it("an Island makes one more {U}, with no use of the stack", () => {
    const { game } = table();
    tide(game);
    const island = spawn(game, "Island", A);
    activate(game, island, 0, { settle: false });
    expect(pool(game)).toEqual(["U", "U"]);
    expect(game.state.zones.shared.stack).toHaveLength(0);
    expect(game.state.pendingTriggers).toHaveLength(0);
  });

  it("the auto-payer counts it", () => {
    const { game } = table();
    tide(game);
    lands(game, "Island", 3); // six mana, for five
    const elemental = toHand(game, "Air Elemental");
    cast(game, elemental);
    expect(zone(game, elemental)).toBe("battlefield");
  });

  it("works for every player, and the mana is theirs who tapped", () => {
    const { game } = table();
    tide(game);
    const theirs = spawn(game, "Island", B);
    game.dispatch({ type: "pass-priority", player: A });
    activate(game, theirs, 0, { player: B, settle: false });
    expect(pool(game, B)).toEqual(["U", "U"]);
    expect(pool(game, A)).toEqual([]);
  });

  it("any Island makes the {U}, whatever it tapped for, and nothing else does", () => {
    const { game } = table();
    tide(game);
    const tundra = spawn(game, "Tundra", A); // Plains Island
    activate(game, tundra, 0, { settle: false }); // {W}
    expect(pool(game)).toEqual(["U", "W"]);
    const plains = spawn(game, "Plains", A);
    activate(game, plains, 0, { settle: false });
    expect(pool(game)).toEqual(["U", "W", "W"]);
  });

  it("each one is an ability of its own", () => {
    const { game } = table();
    tide(game);
    tide(game);
    const island = spawn(game, "Island", A);
    activate(game, island, 0, { settle: false });
    // Three from this Island, and the {U} left floating from the second
    // High Tide's Island, which the first had doubled.
    expect(pool(game)).toEqual(["U", "U", "U", "U"]);
  });

  it("is over with the turn", () => {
    const { game } = table();
    tide(game);
    nextTurn(game); // Bob's
    nextTurn(game); // Alice's
    const island = spawn(game, "Island", A);
    activate(game, island, 0, { settle: false });
    expect(pool(game)).toEqual(["U"]);
  });

  it("an Island tapped before it resolved got no more", () => {
    const { game } = table();
    const payer = tide(game);
    expect(game.state.objects[payer].tapped).toBe(true);
    expect(pool(game)).toEqual([]);
  });
});

describe("Bubbling Muck", () => {
  it("is High Tide for Swamps", () => {
    const { game } = table();
    tide(game, "Bubbling Muck", "Swamp");
    const swamp = spawn(game, "Swamp", A);
    activate(game, swamp, 0, { settle: false });
    expect(pool(game)).toEqual(["B", "B"]);
    const island = spawn(game, "Island", A);
    activate(game, island, 0, { settle: false });
    expect(pool(game)).toEqual(["B", "B", "U"]);
  });
});

describe("Pyre Rhymer and Molten Tide", () => {
  const preparedCopy = (game: Game): ObjectId | undefined =>
    game.state.zones.shared.exile.find((id) => game.state.objects[id].preparedFor !== undefined);

  it("enters prepared; Molten Tide adds {R} to your Mountains and not to anyone else's", () => {
    const { game } = table();
    const rhymer = enter(game, "Pyre Rhymer");
    expect(game.state.objects[rhymer].prepared).toBeDefined();
    spawn(game, "Mountain", A);
    const copy = preparedCopy(game);
    expect(copy).toBeDefined();
    cast(game, copy!, { via: "prepared" });
    expect(game.state.objects[rhymer].prepared).toBeUndefined();

    const mountain = spawn(game, "Mountain", A);
    activate(game, mountain, 0, { settle: false });
    expect(pool(game)).toEqual(["R", "R"]);

    const theirs = spawn(game, "Mountain", B);
    game.dispatch({ type: "pass-priority", player: A });
    activate(game, theirs, 0, { player: B, settle: false });
    expect(pool(game, B)).toEqual(["R"]);
  });
});
