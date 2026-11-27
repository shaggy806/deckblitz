/**
 * "Count the number of permanents. If the number is odd, …; if the number is
 * even, …" (Chaos Moon): the `amount-parity` condition over `{ countOf: {} }`,
 * read as the upkeep trigger resolves.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { whyCannotAttack } from "../combat/eligibility.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, lands, nextTurn, pt, ref, registryOf, spawn, table, toHand } from "./harness.js";

const can = (game: Game, attacker: ObjectId, defender: PlayerId): boolean =>
  whyCannotAttack(game.state, registryOf(game), A, attacker, defender) === null;

const permanents = (game: Game): number =>
  Object.values(game.state.objects).filter((o) => o.zone === "battlefield").length;

const pool = (game: Game, player: PlayerId): string =>
  game.state.players[player].manaPool
    .map((u) => u.type)
    .sort()
    .join("");

type Activate = Extract<LegalAction, { kind: "activate-ability" }>;
const tapFor = (game: Game, source: ObjectId, player: PlayerId): void => {
  const offer = game
    .legalActions(player)
    .find((a): a is Activate => a.kind === "activate-ability" && a.source === source);
  if (offer === undefined) throw new Error("no mana offer");
  game.dispatch({ type: "activate-ability", player, source, abilityIndex: offer.abilityIndex, targets: [] });
};

/** Chaos Moon, a red creature and a Mountain of Bob's, with the permanents
 * made `parity` by one Plains more where needed; then on to Bob's turn, past
 * his upkeep. */
function board(parity: "odd" | "even"): { game: Game; goblin: ObjectId; mountain: ObjectId; bears: ObjectId } {
  const { game } = table();
  spawn(game, "Chaos Moon");
  const goblin = spawn(game, "Raging Goblin", B);
  const bears = spawn(game, "Grizzly Bears", B);
  const [mountain] = lands(game, "Mountain", 1, B);
  if ((permanents(game) % 2 === 1) !== (parity === "odd")) lands(game, "Plains", 1);
  expect(permanents(game) % 2).toBe(parity === "odd" ? 1 : 0);
  nextTurn(game);
  return { game, goblin, mountain, bears };
}

describe("Chaos Moon", () => {
  it("odd: red creatures get +1/+1 and a Mountain tapped for mana adds an extra {R}", () => {
    const { game, goblin, mountain, bears } = board("odd");
    expect(pt(game, goblin)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    tapFor(game, mountain, B);
    expect(pool(game, B)).toBe("RR");
  });

  it("even: red creatures get -1/-1 and a Mountain makes {C} instead", () => {
    const { game, goblin, mountain, bears } = board("even");
    expect(game.state.objects[goblin].zone).toBe("graveyard");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    tapFor(game, mountain, B);
    expect(pool(game, B)).toBe("C");
  });
});

describe("Chaos Lord", () => {
  const evened = (game: Game, parity: "odd" | "even"): void => {
    if ((permanents(game) % 2 === 1) !== (parity === "odd")) lands(game, "Plains", 1, B);
  };

  it("at its controller's upkeep, an opponent gains control of it if the number of permanents is even", () => {
    const { game } = table();
    const lord = spawn(game, "Chaos Lord");
    evened(game, "even");
    nextTurn(game);
    expect(game.state.objects[lord].controller).toBe(A);
    nextTurn(game);
    expect(game.state.objects[lord].controller).toBe(B);
  });

  it("keeps it when the number is odd", () => {
    const { game } = table();
    const lord = spawn(game, "Chaos Lord");
    evened(game, "odd");
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[lord].controller).toBe(A);
  });

  it("attacks as though it had haste, unless it entered this turn", () => {
    const { game } = table();
    const fresh = spawn(game, "Chaos Lord", A, { sick: true });
    expect(can(game, fresh, B)).toBe(false);
    const lord = spawn(game, "Chaos Lord", B);
    lands(game, "Island", 4);
    evened(game, "odd");
    nextTurn(game);
    nextTurn(game);
    expect(game.state.objects[lord].controller).toBe(B);
    cast(game, toHand(game, "Control Magic"), { targets: [ref(lord)] });
    expect(game.state.objects[lord].controller).toBe(A);
    expect(game.state.objects[lord].summoningSick).toBe(true);
    expect(can(game, lord, B)).toBe(true);
  });
});
