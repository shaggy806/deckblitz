/**
 * An alternative cost for spells that collects evidence
 * (`alternativeCostForSpells.collectEvidence`, rules 118.9 and 701.59a):
 * Conspiracy Unraveler's "You may collect evidence 10 rather than pay the mana
 * cost for spells you cast", written from its rulings.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, life, pickTargets, ref, spawn, table, tokensNamed, toGraveyard, toHand, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;

const evidenceOffers = (game: Game, card: ObjectId): readonly CastOffer[] =>
  game
    .legalActions(A)
    .filter((a): a is CastOffer => a.kind === "cast-spell" && a.card === card && a.altCostText === "collect evidence 10");

describe("Conspiracy Unraveler", () => {
  it("casts a spell by exiling cards with total mana value 10 or greater from the graveyard, no mana paid", () => {
    const { game, a } = table();
    spawn(game, "Conspiracy Unraveler");
    const merchant = toGraveyard(game, "Gray Merchant of Asphodel"); // 5
    const giant = toGraveyard(game, "Hill Giant"); // 4
    const bears = toGraveyard(game, "Grizzly Bears"); // 2
    const card = toHand(game, "Hill Giant");
    const [offer] = evidenceOffers(game, card);
    expect(offer).toBeDefined();
    let eligibleSeen: readonly ObjectId[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      eligibleSeen = eligible;
      return [merchant, giant, bears];
    };
    cast(game, card, { altCost: true, ...(offer.altCostIndex !== undefined ? { altCostIndex: offer.altCostIndex } : {}) });
    expect(eligibleSeen).toEqual(expect.arrayContaining([merchant, giant, bears]));
    expect(zone(game, card)).toBe("battlefield");
    expect([merchant, giant, bears].map((id) => zone(game, id))).toEqual(["exile", "exile", "exile"]);
  });

  it("isn't offered while the graveyard holds less than total mana value 10", () => {
    const { game } = table();
    spawn(game, "Conspiracy Unraveler");
    toGraveyard(game, "Gray Merchant of Asphodel");
    toGraveyard(game, "Hill Giant");
    const card = toHand(game, "Grizzly Bears");
    expect(evidenceOffers(game, card)).toEqual([]);
    toGraveyard(game, "Hill Giant");
    expect(evidenceOffers(game, card)).toHaveLength(1);
  });

  it("an opponent's spells aren't reached", () => {
    const { game } = table();
    spawn(game, "Conspiracy Unraveler");
    for (const name of ["Gray Merchant of Asphodel", "Hill Giant", "Hill Giant"]) toGraveyard(game, name, B);
    const card = toHand(game, "Lightning Bolt", B);
    expect(
      game.legalActions(B).filter((a) => a.kind === "cast-spell" && a.card === card && a.altCostText === "collect evidence 10"),
    ).toEqual([]);
  });

  it("X is 0 when it's cast this way (rule 107.3b): Fireball deals no damage", () => {
    const { game, a } = table();
    spawn(game, "Conspiracy Unraveler");
    const cards = ["Gray Merchant of Asphodel", "Hill Giant", "Hill Giant"].map((name) => toGraveyard(game, name));
    const fireball = toHand(game, "Fireball");
    const [offer] = evidenceOffers(game, fireball);
    expect(offer).toBeDefined();
    a.chooseFromZoneFn = () => cards;
    const before = life(game, B);
    expect(offer.xCost).toBeUndefined();
    cast(game, fireball, {
      altCost: true,
      targets: [ref(B)],
      ...(offer.altCostIndex !== undefined ? { altCostIndex: offer.altCostIndex } : {}),
    });
    expect(zone(game, fireball)).toBe("graveyard");
    expect(life(game, B)).toBe(before);
  });

  it("beside Crimestopper Sprite's own collect evidence 6: both are collected, from cards set apart", () => {
    const { game, a } = table();
    spawn(game, "Conspiracy Unraveler");
    spawn(game, "Evidence Examiner");
    const victim = spawn(game, "Grizzly Bears", B);
    const merchant = toGraveyard(game, "Gray Merchant of Asphodel"); // 5
    const giants = [toGraveyard(game, "Hill Giant"), toGraveyard(game, "Hill Giant")]; // 4 + 4
    const bears = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Grizzly Bears")]; // 2 + 2
    const sprite = toHand(game, "Crimestopper Sprite");
    const offer = evidenceOffers(game, sprite).find((o) => o.kicked === true);
    expect(offer).toBeDefined();
    // The Sprite's 6 first: no more than 17 - 10 = 7, so the 10 is still there.
    const asked: (readonly ObjectId[])[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      asked.push(eligible);
      return asked.length === 1 ? [merchant, bears[0]] : [...giants, bears[1]];
    };
    pickTargets(a, victim);
    cast(game, sprite, {
      altCost: true,
      kicked: true,
      ...(offer!.altCostIndex !== undefined ? { altCostIndex: offer!.altCostIndex } : {}),
    });
    expect(asked).toHaveLength(2);
    expect(zone(game, sprite)).toBe("battlefield");
    expect([merchant, ...giants, ...bears].every((id) => zone(game, id) === "exile")).toBe(true);
    // "Whenever you collect evidence" twice; "if evidence was collected" is the Sprite's own.
    expect(tokensNamed(game, "Clue Token", A)).toBe(2);
    expect(game.state.objects[victim].counters?.stun ?? 0).toBe(1);
  });

  it("a choice for the Sprite's 6 that leaves less than 10 is refused", () => {
    const { game, a } = table();
    spawn(game, "Conspiracy Unraveler");
    const merchant = toGraveyard(game, "Gray Merchant of Asphodel"); // 5
    const giants = [toGraveyard(game, "Hill Giant"), toGraveyard(game, "Hill Giant")]; // 4 + 4
    const bears = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Grizzly Bears")]; // 2 + 2
    const sprite = toHand(game, "Crimestopper Sprite");
    const offer = evidenceOffers(game, sprite).find((o) => o.kicked === true)!;
    a.chooseFromZoneFn = () => [];
    pickTargets(a, null);
    cast(game, sprite, {
      altCost: true,
      kicked: true,
      settle: false,
      ...(offer.altCostIndex !== undefined ? { altCostIndex: offer.altCostIndex } : {}),
    });
    const awaiting = game.state.awaiting;
    expect(awaiting?.kind).toBe("choose-from-zone");
    // 5 + 4 = 9 leaves 8: too much taken.
    expect(
      game.canDispatch({ type: "choose-from-zone", player: A, chosen: [merchant, giants[0]] } as never),
    ).not.toBeNull();
    expect(game.canDispatch({ type: "choose-from-zone", player: A, chosen: [giants[0], bears[0]] } as never)).toBeNull();
    void bears;
  });

  it("the Sprite's 6 and the 10 aren't offered together when no split of the graveyard pays both", () => {
    const { game } = table();
    spawn(game, "Conspiracy Unraveler");
    toGraveyard(game, "Ulamog's Crusher"); // 8
    toGraveyard(game, "Ulamog's Crusher"); // 8: 16 in all, but no 6-to-6 part
    const sprite = toHand(game, "Crimestopper Sprite");
    const offers = evidenceOffers(game, sprite);
    expect(offers.some((o) => o.kicked !== true)).toBe(true);
    expect(offers.some((o) => o.kicked === true)).toBe(false);
  });
});
