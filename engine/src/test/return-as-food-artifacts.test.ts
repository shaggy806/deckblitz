/**
 * "Put onto the battlefield under your control all creature cards in your
 * opponents' graveyards that were put there from the battlefield this turn.
 * They are Food artifacts with '{2}, {T}, Sacrifice this artifact: You gain
 * 3 life.'" (Supper for Spiders): a `return-from-graveyard`'s `enterAs` (rule
 * 614.12) of `setTypes: ["artifact"]` and `setSubtypes: ["Food"]` — every
 * other card type and subtype gone (205.1a), supertypes, name and abilities
 * kept, for good (the rulings) — and the Food ability beside its own.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  cast,
  controller,
  destroy,
  lands,
  life,
  nextTurn,
  settle,
  spawn,
  subtypes,
  supertypes,
  table,
  toGraveyard,
  toHand,
  types,
  zone,
} from "./harness.js";

/** Cast Supper for Spiders from alice's hand, mana given. */
function supper(game: Game): void {
  const card = toHand(game, "Supper for Spiders");
  lands(game, "Swamp", 2);
  cast(game, card);
  settle(game);
}

/** The index of the Food ability alice is offered on `id` (-1 if none) — a
 * noncreature artifact, so no summoning sickness (rule 302.6). */
const foodAbility = (game: Game, id: ObjectId): number =>
  game
    .legalActions(A)
    .find(
      (o): o is Extract<LegalAction, { kind: "activate-ability" }> =>
        o.kind === "activate-ability" && o.source === id && o.text === "{2}, {T}, Sacrifice this artifact: You gain 3 life.",
    )?.abilityIndex ?? -1;

describe("Supper for Spiders", () => {
  it("returns an opponent's creature that died this turn as a Food artifact, for good", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    destroy(game, giant, A);
    supper(game);
    expect(zone(game, giant)).toBe("battlefield");
    expect(controller(game, giant)).toBe(A);
    expect(types(game, giant)).toEqual(["artifact"]);
    expect(subtypes(game, giant)).toEqual(["Food"]);
    nextTurn(game);
    expect(types(game, giant)).toEqual(["artifact"]);
  });

  it("keeps a legend legendary, and a land creature loses its land types", () => {
    const { game } = table();
    const arbor = spawn(game, "Dryad Arbor", B);
    const legend = spawn(game, "Isamaru, Hound of Konda", B);
    destroy(game, arbor, A);
    destroy(game, legend, A);
    supper(game);
    expect(types(game, arbor)).toEqual(["artifact"]);
    expect(subtypes(game, arbor)).toEqual(["Food"]);
    expect(supertypes(game, legend)).toContain("legendary");
  });

  it("leaves your own cards, and one milled rather than died", () => {
    const { game } = table();
    const mine = spawn(game, "Hill Giant", A);
    destroy(game, mine, B);
    const milled = toGraveyard(game, "Grizzly Bears", B);
    supper(game);
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, milled)).toBe("graveyard");
  });

  it("the Food sacrifices itself for 3 life", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant", B);
    destroy(game, giant, A);
    supper(game);
    lands(game, "Wastes", 2);
    expect(foodAbility(game, giant)).toBeGreaterThanOrEqual(0);
    game.dispatch({ type: "activate-ability", player: A, source: giant, abilityIndex: foodAbility(game, giant), targets: [] });
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, A)).toBe(23);
  });
});
