/**
 * Author of Shadows: "When this creature enters, exile all opponents'
 * graveyards. Choose a nonland card exiled this way. You may cast that card
 * for as long as it remains exiled, and you may spend mana as though it were
 * mana of any color to cast that spell." No engine code: `exile-graveyard`
 * of `"each-opponent"`, then a `look-and-choose` over the cards exiled this
 * way (`destination: "stay"`) whose `then` is a `grant-play` of the chosen
 * card (`while-exiled`, `spendAs: "any-color"`).
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, cast, destroy, enter, graveyard, lands, life, nextTurn, pickFromZone, ref, table, toGraveyard, zone } from "./harness.js";

const canCast = (game: Game, card: ObjectId, player = A): boolean =>
  game.legalActions(player).some((a) => a.kind === "cast-spell" && a.card === card);

describe("Author of Shadows", () => {
  it("exiles every opponent's graveyard; only the nonland card chosen may be cast, with mana of any color", () => {
    const { game, a } = table({ players: 3 });
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    const shock = toGraveyard(game, "Shock", C);
    const forest = toGraveyard(game, "Forest", B);
    const mine = toGraveyard(game, "Grizzly Bears", A);
    const choice = pickFromZone(a, bolt);
    enter(game, "Author of Shadows");
    expect(zone(game, bolt)).toBe("exile");
    expect(zone(game, shock)).toBe("exile");
    expect(zone(game, forest)).toBe("exile");
    // Opponents' graveyards only.
    expect(zone(game, mine)).toBe("graveyard");
    // A nonland card: the Forest isn't offered.
    expect(choice.offered).toEqual(expect.arrayContaining([bolt, shock]));
    expect(choice.offered).not.toContain(forest);
    lands(game, "Swamp", 1);
    expect(canCast(game, shock)).toBe(false);
    cast(game, bolt, { targets: [ref(B)], via: "impulse" });
    expect(life(game, B)).toBe(17);
    // Still its owner's card (rule 108.3).
    expect(graveyard(game, B)).toContain(bolt);
  });

  it("the permission lasts while the card stays exiled, after the Author has left", () => {
    const { game, a } = table();
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    pickFromZone(a, bolt);
    const author = enter(game, "Author of Shadows");
    destroy(game, author);
    nextTurn(game);
    nextTurn(game);
    lands(game, "Swamp", 1);
    expect(canCast(game, bolt)).toBe(true);
    cast(game, bolt, { targets: [ref(B)], via: "impulse" });
    expect(life(game, B)).toBe(17);
  });

  it("with only lands exiled, nothing is asked", () => {
    const { game, a } = table();
    const forest = toGraveyard(game, "Forest", B);
    let asked = false;
    a.chooseFromZoneFn = () => {
      asked = true;
      return [];
    };
    enter(game, "Author of Shadows");
    expect(zone(game, forest)).toBe("exile");
    expect(asked).toBe(false);
  });
});
