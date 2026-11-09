/**
 * Splice onto Arcane / instant or sorcery (rule 702.47): as a spell of the
 * quality is cast, cards in hand with splice may be revealed and their splice
 * costs paid; the spell gains their text — their targets after its own, their
 * effects after its own — and the cards stay in hand. Offered as cast
 * variants, one per set of splice cards (the `splice` offer field).
 */
import { describe, expect, it } from "vitest";

import { createDefaultRegistry, defineCard } from "../cards.js";
import { A, B, cast, destroy, enter, hand, keywords, lands, life, ref, table, toGraveyard, toHand, tokensNamed, zone } from "./harness.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

const castOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((o) => o.kind === "cast-spell" && o.card === card);

const SPLICE_ZAP = defineCard({
  name: "Test Splice Zap",
  manaCost: "{3}{R}",
  colors: ["R"],
  types: ["instant"],
  text: "Test Splice Zap deals 2 damage to any target.\nSplice onto instant or sorcery {R}",
  targets: ["any-target"],
  splice: { onto: "instant-or-sorcery", cost: "{R}" },
  effect: { kind: "damage", amount: 2, target: 0 },
});

describe("splice onto more kinds of spell (rule 702.47)", () => {
  const spliceRegistry = createDefaultRegistry().register(SPLICE_ZAP);

  it("Everdream onto a modal spell: the chosen mode, then the spliced card's text", () => {
    const { game } = table();
    lands(game, "Island", 3);
    lands(game, "Swamp", 1);
    lands(game, "Plains", 1);
    lands(game, "Forest", 1);
    const dream = toHand(game, "Everdream");
    const charm = toHand(game, "Abzan Charm");
    const before = hand(game, A).length;
    cast(game, charm, { modes: [1], targets: [], splice: [dream] });
    // Charm left the hand, two cards and one more drawn; the spliced card is still there.
    expect(hand(game, A).length).toBe(before - 1 + 2 + 1);
    expect(zone(game, dream)).toBe("hand");
  });

  it("a spliced card with targets isn't offered on a modal spell", () => {
    const { game } = table({ registry: spliceRegistry });
    lands(game, "Mountain", 3);
    lands(game, "Swamp", 2);
    lands(game, "Plains", 1);
    lands(game, "Forest", 1);
    toHand(game, "Test Splice Zap");
    const charm = toHand(game, "Abzan Charm");
    expect(castOffers(game, charm).some((o) => o.kind === "cast-spell" && o.splice !== undefined)).toBe(false);
  });

  it("onto a fused spell: both halves, then the spliced card, each with its own targets", () => {
    const { game } = table({ registry: spliceRegistry });
    lands(game, "Mountain", 3);
    lands(game, "Plains", 2);
    const signet = enter(game, "Mind Stone", B);
    const prison = enter(game, "Propaganda", B);
    const wear = toHand(game, "Wear // Tear");
    const zap = toHand(game, "Test Splice Zap");
    cast(game, wear, { face: 0, targets: [ref(signet), ref(prison), ref(B)], splice: [zap] });
    expect(zone(game, signet)).toBe("graveyard");
    expect(zone(game, prison)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
    expect(zone(game, zap)).toBe("hand");
  });

  it("an overloaded spell takes a splice too: no targets of its own, the spliced card's kept", () => {
    const { game } = table({ registry: spliceRegistry });
    lands(game, "Island", 7);
    lands(game, "Mountain", 1);
    const stone = enter(game, "Mind Stone", B);
    const rift = toHand(game, "Cyclonic Rift");
    const zap = toHand(game, "Test Splice Zap");
    cast(game, rift, { overload: true, targets: [ref(B)], splice: [zap] });
    expect(zone(game, stone)).toBe("hand");
    expect(life(game, B)).toBe(18);
  });
});

describe("Splice", () => {
  it("Spiritual Visit onto Desperate Ritual: both costs paid, both effects, the spliced card stays in hand", () => {
    const { game } = table();
    const lands3 = [...lands(game, "Mountain", 2), ...lands(game, "Plains", 1)];
    const ritual = toHand(game, "Desperate Ritual");
    const visit = toHand(game, "Spiritual Visit");
    const offers = castOffers(game, ritual);
    // Unspliced, and spliced with Visit.
    expect(offers.map((o) => (o.kind === "cast-spell" ? (o.splice?.map((s) => s.cardName) ?? []) : null))).toEqual([
      [],
      ["Spiritual Visit"],
    ]);
    cast(game, ritual, { splice: [visit] });
    expect(zone(game, visit)).toBe("hand");
    expect(tokensNamed(game, "Spirit Token (Colorless)", A)).toBe(1);
    expect(game.state.players[A].manaPool.filter((m) => m.type === "R")).toHaveLength(3);
    // All three lands paid for it: {1}{R} and {W}.
    expect(lands3.every((id) => game.state.objects[id].tapped)).toBe(true);
  });

  it("can't be paid for: no splice variant; not the spell itself, not twice", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const ritual = toHand(game, "Desperate Ritual");
    const visit = toHand(game, "Spiritual Visit");
    // No {W} for Visit's splice cost.
    expect(castOffers(game, ritual).every((o) => o.kind === "cast-spell" && o.splice === undefined)).toBe(true);
    lands(game, "Plains", 2);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: ritual, targets: [], splice: [ritual] })).toMatch(
      /spliced/,
    );
    expect(game.canDispatch({ type: "cast-spell", player: A, card: ritual, targets: [], splice: [visit, visit] })).toMatch(
      /only once/,
    );
  });

  it("onto Arcane only: Into the Fray isn't offered onto Lightning Bolt; Everdream (instant or sorcery) is", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    lands(game, "Island", 3);
    const bolt = toHand(game, "Lightning Bolt");
    toHand(game, "Into the Fray");
    const dream = toHand(game, "Everdream");
    const spliced = castOffers(game, bolt).flatMap((o) => (o.kind === "cast-spell" ? [o.splice?.map((s) => s.object) ?? []] : []));
    expect(spliced).toEqual([[], [dream]]);
    const before = hand(game).length;
    cast(game, bolt, { targets: [ref(B)], splice: [dream] });
    expect(game.state.players[B].life).toBe(17);
    // Bolt left, Everdream's draw came in.
    expect(hand(game).length).toBe(before);
    expect(zone(game, dream)).toBe("hand");
  });

  it("the spliced card's targets follow the spell's own; Evermind, uncastable, still splices", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    lands(game, "Island", 2);
    const bears = enter(game, "Grizzly Bears", B);
    const ritual = toHand(game, "Desperate Ritual");
    const fray = toHand(game, "Into the Fray");
    const evermind = toHand(game, "Evermind");
    expect(game.legalActions(A).some((o) => o.kind === "cast-spell" && o.card === evermind)).toBe(false);
    const offer = castOffers(game, ritual).find((o) => o.kind === "cast-spell" && o.splice?.length === 2);
    expect(offer?.kind === "cast-spell" ? offer.targetSpecs : null).toEqual(["creature"]);
    const before = hand(game).length;
    cast(game, ritual, { splice: [fray, evermind], targets: [ref(bears)] });
    // The Ritual left the hand and Evermind's draw came in.
    expect(hand(game).length).toBe(before);
    expect(game.state.players[A].manaPool.filter((m) => m.type === "R")).toHaveLength(3);
  });

  it("a spell whose every target has gone does nothing, its spliced text included (the rulings)", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const bears = enter(game, "Grizzly Bears", B);
    const ritual = toHand(game, "Desperate Ritual");
    const fray = toHand(game, "Into the Fray");
    cast(game, ritual, { splice: [fray], targets: [ref(bears)], settle: false });
    destroy(game, bears);
    expect(zone(game, ritual)).toBe("graveyard");
    expect(game.state.players[A].manaPool).toHaveLength(0);
  });

  it("Goryo's Vengeance spliced onto Desperate Ritual returns the legend with haste", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Swamp", 3);
    const isamaru = toGraveyard(game, "Isamaru, Hound of Konda");
    const ritual = toHand(game, "Desperate Ritual");
    const goryo = toHand(game, "Goryo's Vengeance");
    cast(game, ritual, { splice: [goryo], targets: [ref(isamaru)] });
    expect(zone(game, isamaru)).toBe("battlefield");
    expect(keywords(game, isamaru).has("haste")).toBe(true);
    expect(zone(game, goryo)).toBe("hand");
  });
});
