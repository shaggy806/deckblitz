/**
 * Improvise (rule 702.126a): "For each generic mana in this spell's total
 * cost, you may tap an untapped artifact you control rather than pay that
 * mana." Paid through convoke's machinery (`Action.convoke`), with the
 * spell's untapped artifacts as the candidates, each paying one generic mana
 * — never a coloured pip (the rulings), and never a creature that isn't an
 * artifact.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, cast, hand, lands, pt, ref, spawn, table, toHand } from "./harness.js";

const offerFor = (game: Game, card: ObjectId) => {
  const offer = game.legalActions(A).find((a) => a.kind === "cast-spell" && a.card === card);
  return offer?.kind === "cast-spell" ? offer : undefined;
};

describe("improvise", () => {
  it("offers untapped artifacts, not creatures, each paying generic only", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const artifacts = [spawn(game, "Darksteel Relic"), spawn(game, "Memnite"), spawn(game, "Ornithopter")];
    const bears = spawn(game, "Grizzly Bears");
    const card = toHand(game, "Reverse Engineer");
    const offer = offerFor(game, card)?.convoke;
    expect(offer?.improvise).toBe(true);
    expect([...(offer?.candidates ?? [])].sort()).toEqual([...artifacts].sort());
    expect(offer?.candidates).not.toContain(bears);
    expect(offer?.maxCreatures).toBe(3);

    const before = hand(game).length;
    cast(game, card, { convoke: artifacts.map((creature) => ({ creature })) });
    expect(hand(game).length).toBe(before - 1 + 3);
    expect(artifacts.map((id) => game.state.objects[id].tapped)).toEqual([true, true, true]);
  });

  it("can't pay a coloured pip, so {U}{U} still needs mana", () => {
    const { game } = table();
    for (let i = 0; i < 5; i += 1) spawn(game, "Darksteel Relic");
    const card = toHand(game, "Reverse Engineer");
    expect(offerFor(game, card)).toBeUndefined();
    const artifacts = game.battlefield.filter((id) => game.state.objects[id].cardName === "Darksteel Relic");
    expect(() =>
      cast(game, card, { convoke: artifacts.map((creature) => ({ creature, pays: "U" as const })) }),
    ).toThrow();
  });

  it("pays an {X}'s generic mana too (Battle at the Bridge)", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const artifacts = [spawn(game, "Darksteel Relic"), spawn(game, "Darksteel Relic"), spawn(game, "Darksteel Relic")];
    const target = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Battle at the Bridge"), {
      x: 3,
      targets: [ref(target)],
      convoke: artifacts.map((creature) => ({ creature })),
    });
    expect(pt(game, target)).toEqual({ power: 3, toughness: 1 });
    expect(game.state.players[A].life).toBe(23);
  });
});
