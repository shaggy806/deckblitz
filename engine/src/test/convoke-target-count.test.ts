/**
 * Convoke on a spell whose cost turns on how many targets it has (Strive):
 * the offer proves a payment per count, since the one for the dearest count
 * overpays the others and a cast that taps more than the cost is refused
 * (rule 702.51a).
 */
import { describe, expect, it } from "vitest";

import { convokeProofFor } from "../actions.js";
import type { LegalAction } from "../actions.js";
import { defineCard } from "../cards/define.js";
import { createDefaultRegistry } from "../cards/registry.js";
import { A, spawn, table, toHand, zone } from "./harness.js";

const NAME = "Test Strive Convoke";

const registry = createDefaultRegistry().register(
  defineCard({
    name: NAME,
    manaCost: "{2}",
    types: ["sorcery"],
    convoke: true,
    costPerExtraTarget: "{1}",
    text: "Convoke. Strive — {1} more for each target beyond the first. Any number of target creatures you control get +1/+1 counters.",
    targets: [{ kind: "any-number", of: "creature-you-control" }],
    effect: { kind: "for-each-target", from: 0, effect: { kind: "tap", target: 0 } },
  }),
);

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;

describe("convoke with a target-dependent cost", () => {
  it("proves a payment for each count of targets", () => {
    const { game } = table({ registry });
    const angels = Array.from({ length: 6 }, () => spawn(game, "Serra Angel"));
    const card = toHand(game, NAME);
    const offer = game.legalActions(A).find((a): a is CastOffer => a.kind === "cast-spell" && a.card === card);
    expect(offer?.convoke?.proof).toHaveLength(6);
    const proof = convokeProofFor(offer!.convoke!, 0, 1);
    expect(proof).toHaveLength(2);
    game.dispatch({ type: "cast-spell", player: A, card, targets: [{ kind: "object", object: angels[0] }], convoke: proof });
    expect(zone(game, card)).toBe("stack");
    expect(angels.filter((id) => game.state.objects[id].tapped)).toHaveLength(2);
  });
});
