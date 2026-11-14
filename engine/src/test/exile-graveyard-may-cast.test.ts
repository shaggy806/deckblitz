import { describe, expect, it } from "vitest";
import type { Action } from "../actions.js";
import { B, cast, lands, nextTurn, ref, table, toGraveyard, toHand, toStep, zone } from "./harness.js";

// "Exile all creature cards from target player's graveyard. You may cast
// spells from among those cards for as long as they remain exiled, and mana
// of any type can be spent to cast them." — `exile-graveyard` with a filter,
// then `grant-play` over the cards exiled this way for `while-exiled`, with
// `spendAs: "any-type"` (Shadow of the Enemy).
describe("exile a graveyard's cards, then cast them while they stay exiled", () => {
  it("Shadow of the Enemy: only creature cards go; each castable with any type of mana, turns later", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const elves = toGraveyard(game, "Llanowar Elves", B);
    const bolt = toGraveyard(game, "Lightning Bolt", B);
    const spell = toHand(game, "Shadow of the Enemy");
    cast(game, spell, { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, elves)).toBe("exile");
    expect(zone(game, bolt)).toBe("graveyard");
    // A green spell paid for with black mana (the "mana of any type" ruling).
    lands(game, "Swamp", 2);
    cast(game, bears, { via: "impulse" });
    expect(zone(game, bears)).toBe("battlefield");
    // Not "this turn": the other card stays castable on a later turn of yours.
    toStep(game, "end");
    nextTurn(game);
    toStep(game, "precombat-main");
    expect(game.state.objects[elves].zone).toBe("exile");
    lands(game, "Swamp", 1);
    cast(game, elves, { via: "impulse" });
    expect(zone(game, elves)).toBe("battlefield");
  });

  it("Shadow of the Enemy: the permission is the caster's alone, not the cards' owner's", () => {
    const { game } = table();
    lands(game, "Swamp", 6);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    const spell = toHand(game, "Shadow of the Enemy");
    cast(game, spell, { targets: [ref(B)] });
    expect(zone(game, bears)).toBe("exile");
    // Bob, the card's owner, wasn't given it.
    lands(game, "Forest", 2, B);
    toStep(game, "precombat-main", B);
    expect(
      game.canDispatch({ type: "cast-spell", player: B, card: bears, targets: [], via: "impulse" } as Action),
    ).not.toBeNull();
  });
});
