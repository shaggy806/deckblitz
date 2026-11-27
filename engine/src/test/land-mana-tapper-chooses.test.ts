/**
 * Several rules changing one land's mana at once (rules 616.1, 616.1d): every
 * one applies, in the tapper's order, so the mana is the type of whichever
 * goes last — the tapper's pick among them. Naked Singularity's Plains Island
 * makes {R} or {G} (its ruling); Infernal Darkness beside Reality Twist, {B}
 * or {R} off a Plains.
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ManaType } from "../mana.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, hand, nextTurn, spawn, table, toHand } from "./harness.js";

type Activate = Extract<LegalAction, { kind: "activate-ability" }>;

const pool = (game: Game, player: PlayerId = A): string =>
  game.state.players[player].manaPool
    .map((u) => u.type)
    .sort()
    .join("");

const offers = (game: Game, source: ObjectId, player: PlayerId = A): Activate[] =>
  game.legalActions(player).filter((a): a is Activate => a.kind === "activate-ability" && a.source === source);

const picksOffered = (game: Game, source: ObjectId, player: PlayerId = A): string[] =>
  [...new Set(offers(game, source, player).map((o) => o.manaColors?.join("") ?? ""))].sort();

const tapFor = (game: Game, source: ObjectId, picks: readonly ManaType[], player: PlayerId = A): void => {
  const offer = offers(game, source, player).find((o) => o.manaColors?.join("") === picks.join(""));
  if (offer === undefined) throw new Error("no such offer");
  game.dispatch({
    type: "activate-ability",
    player,
    source,
    abilityIndex: offer.abilityIndex,
    targets: [],
    manaColors: [...picks],
  });
};

describe("Naked Singularity", () => {
  it("each basic type makes its new colour", () => {
    const { game } = table();
    spawn(game, "Naked Singularity");
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) {
      const id = spawn(game, land);
      const offer = offers(game, id)[0];
      game.dispatch({ type: "activate-ability", player: A, source: id, abilityIndex: offer.abilityIndex, targets: [] });
    }
    expect(pool(game)).toBe("BGRUW");
  });

  it("a Plains Island's tapper picks {R} or {G}, and gets what they picked", () => {
    const { game } = table();
    spawn(game, "Naked Singularity");
    const tundra = spawn(game, "Tundra");
    expect(picksOffered(game, tundra)).toEqual(["G", "R"]);
    tapFor(game, tundra, ["G"]);
    expect(pool(game)).toBe("G");
  });

  it("an opponent tapping their own Plains Island picks too", () => {
    const { game } = table();
    spawn(game, "Naked Singularity");
    const tundra = spawn(game, "Tundra", B);
    nextTurn(game); // bob's
    expect(picksOffered(game, tundra, B)).toEqual(["G", "R"]);
  });

  it("the auto-payer pays {G} with a Plains Island", () => {
    const { game } = table();
    spawn(game, "Naked Singularity");
    const tundra = spawn(game, "Tundra");
    const elves = toHand(game, "Llanowar Elves");
    cast(game, elves);
    expect(hand(game)).not.toContain(elves);
    expect(game.state.objects[tundra].tapped).toBe(true);
  });
});

describe("two cards' rules on one land", () => {
  it("Infernal Darkness and Reality Twist: a Plains makes {B} or {R}, the tapper's pick", () => {
    const { game } = table();
    spawn(game, "Infernal Darkness");
    spawn(game, "Reality Twist");
    const plains = spawn(game, "Plains");
    expect(picksOffered(game, plains)).toEqual(["B", "R"]);
    tapFor(game, plains, ["R"]);
    expect(pool(game)).toBe("R");
  });

  it("an Island, which only Infernal Darkness changes, makes {B}", () => {
    const { game } = table();
    spawn(game, "Infernal Darkness");
    spawn(game, "Reality Twist");
    const island = spawn(game, "Island");
    const offer = offers(game, island)[0];
    game.dispatch({ type: "activate-ability", player: A, source: island, abilityIndex: offer.abilityIndex, targets: [] });
    expect(pool(game)).toBe("B");
  });
});
