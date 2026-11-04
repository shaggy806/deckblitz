/**
 * "If you control N or more … with different names": a `controls` condition's
 * `distinctNames` (rule 201.2) as an intervening if (rule 603.4) — Field of the
 * Dead, Liliana's Contract.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import { A, B, cast, enter, hand, life, nextTurn, pickPermanents, settle, spawn, table, toHand, toLibrary, tokensNamed, zone } from "./harness.js";

const SIX = ["Forest", "Island", "Swamp", "Mountain", "Plains", "Wastes"];
const lands = (game: Game, names: readonly string[]) => names.map((name) => spawn(game, name));

describe("Field of the Dead", () => {
  it("enters tapped and taps for {C}", () => {
    const { game } = table();
    const field = enter(game, "Field of the Dead");
    expect(game.state.objects[field].tapped).toBe(true);
    game.state.objects[field].tapped = false;
    game.dispatch({ type: "activate-ability", player: A, source: field, abilityIndex: 0, targets: [] });
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["C"]);
  });

  it("makes a Zombie as it enters, counting itself as the seventh name", () => {
    const { game } = table();
    lands(game, SIX);
    enter(game, "Field of the Dead");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
  });

  it("makes one per land you control entering, counting that land", () => {
    const { game } = table();
    lands(game, SIX.slice(0, 5));
    spawn(game, "Field of the Dead");
    enter(game, "Wastes");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(1);
    // A second Forest: its name is already counted, but seven names are there.
    enter(game, "Forest");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(2);
  });

  it("counts a name once, however many of it (the ruling)", () => {
    const { game } = table();
    lands(game, ["Plains", "Plains", "Plains", "Plains", "Island", "Island"]);
    spawn(game, "Field of the Dead");
    enter(game, "Plains");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(0);
  });

  it("ignores an opponent's land entering, and an opponent's lands in the count", () => {
    const { game } = table();
    lands(game, SIX);
    spawn(game, "Field of the Dead");
    enter(game, "Command Tower", B);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(0);

    const other = table();
    lands(other.game, SIX.slice(0, 5));
    spawn(other.game, "Field of the Dead");
    spawn(other.game, "Wastes", B);
    enter(other.game, "Forest");
    expect(tokensNamed(other.game, "Zombie Token", A)).toBe(0);
  });

  it("asks again as it resolves (rule 603.4): a name gone in response makes nothing", () => {
    const { game } = table();
    const six = lands(game, SIX);
    spawn(game, "Field of the Dead");
    enter(game, "Forest", A, { settle: false });
    game.debugApplyEffect(A, { kind: "destroy", target: 0 }, [{ kind: "object", object: six[1] }]);
    settle(game);
    expect(zone(game, six[1])).toBe("graveyard");
    expect(tokensNamed(game, "Zombie Token", A)).toBe(0);
  });

  it("two Fields each see every land of a Scapeshift, themselves too (the ruling)", () => {
    const t = table();
    const { game, a } = t;
    const eight = lands(game, ["Wastes", "Wastes", "Wastes", "Wastes", "Wastes", "Wastes", "Wastes", "Wastes"]);
    const forests = lands(game, ["Forest", "Forest", "Forest", "Forest"]);
    // Five basics, two Fields and one other land from the library: seven names.
    for (const name of ["Forest", "Island", "Swamp", "Mountain", "Plains", "Field of the Dead", "Field of the Dead", "Command Tower"]) {
      toLibrary(game, name);
    }
    pickPermanents(a, ...eight);
    a.chooseFromZoneFn = (_view, eligible) => eligible.filter((id) => game.state.objects[id].cardName !== "Wastes").slice(0, 8);
    cast(game, toHand(game, "Scapeshift"));
    expect(forests.every((id) => zone(game, id) === "battlefield")).toBe(true);
    expect(tokensNamed(game, "Zombie Token", A)).toBe(16);
  });
});

describe("Liliana's Contract", () => {
  it("draws four and loses 4 as it enters", () => {
    const { game } = table();
    const before = hand(game).length;
    enter(game, "Liliana's Contract");
    expect(hand(game).length).toBe(before + 4);
    expect(life(game)).toBe(16);
  });

  const toYourNextUpkeep = (game: Game): void => {
    nextTurn(game);
    nextTurn(game);
  };

  it("wins at your upkeep with four Demons of different names", () => {
    const { game } = table();
    spawn(game, "Liliana's Contract");
    for (const name of ["Reiver Demon", "Griselbrand", "Rakdos the Defiler", "Harvester of Souls"]) spawn(game, name);
    toYourNextUpkeep(game);
    expect(game.winner).toBe(A);
  });

  it("doesn't win with two of one name among the four", () => {
    const { game } = table();
    spawn(game, "Liliana's Contract");
    for (const name of ["Reiver Demon", "Reiver Demon", "Rakdos the Defiler", "Harvester of Souls"]) spawn(game, name);
    toYourNextUpkeep(game);
    expect(game.winner).toBeNull();
  });
});
