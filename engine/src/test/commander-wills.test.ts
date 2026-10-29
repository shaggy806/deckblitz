/**
 * Jeska's Will and Akroma's Will: "choose one — if you control a commander as you cast this spell,
 * you may choose both instead" (`castModal.maxModesIf`), Jeska's mana counted from the target
 * opponent's hand (`cardsInHand: { target }`), Akroma's keywords and protection for your creatures.
 */
import { describe, expect, it } from "vitest";

import { poolCounts } from "../mana.js";
import type { ObjectId } from "../primitives.js";
import { cardSource, invalidTargetReason } from "../targeting.js";

import { A, B, cast, hand, keywords, lands, ref, spawn, table, toHand, toLibrary, zone } from "./harness.js";

describe("Jeska's Will", () => {
  it("one mode without a commander; with one, both — {R} for each card in the target opponent's hand", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const will = toHand(game, "Jeska's Will");
    expect(game.canDispatch({ type: "cast-spell", player: A, card: will, modes: [0, 1], targets: [ref(B)] })).toMatch(/mode/i);
    const commander = spawn(game, "Grizzly Bears", A);
    game.state.objects[commander].isCommander = true;
    const top = [toLibrary(game, "Hill Giant"), toLibrary(game, "Grizzly Bears"), toLibrary(game, "Lightning Bolt")];
    const bobsHand = hand(game, B).length;
    cast(game, will, { modes: [0, 1], targets: [ref(B)] });
    expect(poolCounts(game.state.players[A].manaPool).R ?? 0).toBe(bobsHand);
    expect(top.map((id) => zone(game, id))).toEqual(["exile", "exile", "exile"]);
    // The exiled Bolt is playable this turn.
    const bolt = top[2];
    const offer = game.legalActions(A).find((o) => o.kind === "cast-spell" && o.card === bolt);
    expect(offer).toBeDefined();
  });
});

describe("Akroma's Will", () => {
  it("with a commander, both modes: double strike and protection from each color", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const commander = spawn(game, "Grizzly Bears", A);
    game.state.objects[commander].isCommander = true;
    const giant = spawn(game, "Hill Giant", A);
    cast(game, toHand(game, "Akroma's Will"), { modes: [0, 1] });
    const kw = [...keywords(game, giant)];
    expect(kw).toEqual(expect.arrayContaining(["flying", "vigilance", "double-strike", "lifelink", "indestructible"]));
    // Protection from red: Bob's Lightning Bolt can't target it — but can target his own creature.
    const bolt = toHand(game, "Lightning Bolt", B);
    const bobs = spawn(game, "Grizzly Bears", B);
    const from = cardSource(game.registry.get("Lightning Bolt"), bolt);
    const why = (id: ObjectId) =>
      invalidTargetReason(game.state, game.registry, ["any-target"], [ref(id)], B, "Lightning Bolt", from);
    expect(why(giant)).not.toBeNull();
    expect(why(bobs)).toBeNull();
  });
});
