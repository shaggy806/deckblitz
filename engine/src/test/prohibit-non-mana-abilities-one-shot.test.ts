/**
 * Abeyance: "Until end of turn, target player can't cast instant or sorcery
 * spells, and that player can't activate abilities that aren't mana
 * abilities. Draw a card." — one `prohibit` effect on the target player, a
 * cast act narrowed to instants and sorceries and an `activate` act sparing
 * mana abilities (`except: ["mana"]`, rule 605.1a) in every zone
 * (`anyZone`: cycling from the hand, the card's third ruling).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { activePlayerOf } from "../state.js";
import { A, activate, B, cast, hand, lands, life, nextTurn, ref, settle, spawn, table, toHand, toStep, zone } from "./harness.js";

/** Any activated ability of `source` `player` is offered (the hand's cycling among them). */
const canActivate = (game: Game, source: ObjectId, player: PlayerId): boolean =>
  game
    .legalActions(player)
    .some((a) => (a.kind === "activate-ability" && a.source === source) || (a.kind === "cycle" && a.card === source));
const castRefusal = (game: Game, card: ObjectId, targets: Parameters<typeof ref>[0][] = []): string | null =>
  game.canDispatch({ type: "cast-spell", player: B, card, targets: targets.map(ref) });

/** Alice's priority in bob's upkeep, with Abeyance cast on `target` and resolved. */
function abeyanceOnBobsTurn(game: Game, target: PlayerId = B): ObjectId {
  const abeyance = toHand(game, "Abeyance");
  lands(game, "Plains", 2);
  game.advanceUntil((s) => s.turn.step === "upkeep" && activePlayerOf(s) === B && s.priority.holder === A);
  cast(game, abeyance, { targets: [ref(target)] });
  return abeyance;
}

describe("Abeyance: target player can't cast instants or sorceries or activate non-mana abilities this turn", () => {
  it("bob can't cast an instant or a sorcery, or activate a non-mana ability on the battlefield or in his hand", () => {
    const { game } = table();
    const dragon = spawn(game, "Shivan Dragon", B);
    lands(game, "Mountain", 3, B);
    lands(game, "Island", 3, B);
    lands(game, "Plains", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    const divination = toHand(game, "Divination", B);
    const faith = toHand(game, "Renewed Faith", B);
    const handBefore = hand(game, A).length;
    const abeyance = abeyanceOnBobsTurn(game);
    expect(zone(game, abeyance)).toBe("graveyard");
    // Abeyance came to alice's hand and left it, and she drew one.
    expect(hand(game, A).length).toBe(handBefore + 1);

    toStep(game, "precombat-main", B);
    expect(castRefusal(game, bolt, [A])).not.toBeNull();
    expect(castRefusal(game, divination)).not.toBeNull();
    expect(canActivate(game, dragon, B)).toBe(false);
    expect(canActivate(game, faith, B)).toBe(false); // cycling, from the hand
  });

  it("mana abilities and other spells still work: a creature spell paid for by a mana creature", () => {
    const { game } = table();
    spawn(game, "Llanowar Elves", B);
    lands(game, "Forest", 1, B);
    const bears = toHand(game, "Grizzly Bears", B);
    abeyanceOnBobsTurn(game);
    toStep(game, "precombat-main", B);
    cast(game, bears, { player: B });
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("only the target player, and only this turn", () => {
    const { game } = table();
    const sorcerer = spawn(game, "Prodigal Sorcerer");
    const dragon = spawn(game, "Shivan Dragon", B);
    lands(game, "Mountain", 1, B);
    lands(game, "Plains", 2, B);
    const faith = toHand(game, "Renewed Faith", B);
    abeyanceOnBobsTurn(game);
    game.advanceUntil((s) => s.priority.holder === A); // bob passes in his upkeep
    // Alice's own abilities are untouched in bob's turn.
    activate(game, sorcerer, 0, { targets: [ref(B)] });
    settle(game);
    expect(life(game, B)).toBe(19);

    nextTurn(game);
    toStep(game, "precombat-main", B);
    expect(canActivate(game, dragon, B)).toBe(true);
    expect(canActivate(game, faith, B)).toBe(true);
  });
});
