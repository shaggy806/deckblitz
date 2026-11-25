/**
 * `PlayerView.lastingEffects`: what resolved spells and abilities left on a
 * player or the game for a while, listed beside each player's emblems, with
 * what made each (`MadeBy`) and when it ends.
 */
import { describe, expect, it } from "vitest";
import { A, B, activate, cast, lands, nextTurn, ref, spawn, table, toHand } from "./harness.js";

describe("the view's lasting effects", () => {
  it("lists Skullcrack's two rules for this turn, and nothing once the turn is over", () => {
    const { game } = table({ openingHandSize: 0 });
    lands(game, "Mountain", 2);
    expect(game.viewFor(B).lastingEffects).toEqual([]);
    cast(game, toHand(game, "Skullcrack"), { targets: [ref(B)] });
    const effects = game.viewFor(B).lastingEffects ?? [];
    expect(effects).toContainEqual(expect.objectContaining({ player: A, source: "Skullcrack", ends: "end-of-turn" }));
    expect(effects.map((e) => e.text).join(" ")).toMatch(/can't gain life/);
    expect(effects).toContainEqual({ player: A, source: null, text: "Damage can't be prevented this turn.", ends: "end-of-turn" });
    nextTurn(game);
    expect(game.viewFor(B).lastingEffects).toEqual([]);
  });

  it("lists Teferi's Protection once, until its caster's next turn", () => {
    const { game } = table({ openingHandSize: 0 });
    lands(game, "Plains", 3);
    cast(game, toHand(game, "Teferi's Protection"));
    const mine = (game.viewFor(B).lastingEffects ?? []).filter((e) => e.source === "Teferi's Protection");
    expect(mine).toHaveLength(1);
    expect(mine[0]).toMatchObject({ player: A, ends: { untilTurnOf: A } });
    expect(mine[0].text).toMatch(/protection from everything/);
  });

  it("names an activated ability by its own words, not its card's whole text", () => {
    const { game } = table({ openingHandSize: 0 });
    const bulwark = spawn(game, "Reinforced Bulwark", A, { sick: false });
    activate(game, bulwark);
    expect(game.viewFor(B).lastingEffects).toEqual([
      {
        player: A,
        source: "Reinforced Bulwark",
        text: "{T}: Prevent the next 1 damage that would be dealt to you this turn.",
        ends: "end-of-turn",
      },
    ]);
  });

  it("lists a combat rule over the game, by the chapter that made it (Maximum Carnage)", () => {
    const { game } = table({ openingHandSize: 0 });
    lands(game, "Mountain", 5);
    spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Maximum Carnage"));
    expect(game.viewFor(B).lastingEffects).toEqual([
      {
        player: A,
        source: "Maximum Carnage",
        text: "I — Until your next turn, each creature attacks each combat if able and attacks a player other than you if able.",
        ends: { untilTurnOf: A },
      },
    ]);
  });

  it("lists an extra combat and an extra turn", () => {
    const { game } = table({ openingHandSize: 0 });
    lands(game, "Mountain", 4);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Relentless Assault"));
    cast(game, toHand(game, "Time Walk"));
    const effects = game.viewFor(B).lastingEffects ?? [];
    expect(effects).toContainEqual({ player: A, source: null, text: "An additional combat phase this turn.", ends: "end-of-turn" });
    expect(effects).toContainEqual({ player: A, source: null, text: "Takes an extra turn after this one.", ends: "later" });
  });
});
