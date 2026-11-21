/**
 * Tazri, Stalwart Survivor: each creature you control has "{T}: Add one mana
 * of any of this creature's colors. Spend this mana only to activate an
 * ability of a creature. Activate only if this creature has another activated
 * ability." The gate is `hasActivatedAbility: { atLeast: 2 }` on the source
 * ("activate only if", rule 602.5), the ability itself one of the two —
 * cycling counts though it can't be activated on the battlefield (the
 * ruling), and a second Tazri's copy of the ability is another. The mana is
 * spent only on abilities of creatures on the battlefield (rule 106.6, the
 * ruling). And the mill: creature cards with an activated ability that isn't
 * a mana ability go to the hand.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, hand, lands, spawn, table, toHand, toLibrary, zone } from "./harness.js";

type ActivateOffer = Extract<LegalAction, { kind: "activate-ability" }>;
const manaOffers = (game: Game, source: ObjectId): ActivateOffer[] =>
  game
    .legalActions(A)
    .filter((x): x is ActivateOffer => x.kind === "activate-ability" && x.source === source && x.text.startsWith("{T}: Add one mana of any of this creature's colors"));

describe("Tazri, Stalwart Survivor's granted mana ability", () => {
  it("only on a creature with another activated ability", () => {
    const { game } = table();
    const tazri = spawn(game, "Tazri, Stalwart Survivor");
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    // Tazri has her mill; the Elves their own mana ability; the Bears nothing else.
    expect(manaOffers(game, tazri)).toHaveLength(1);
    expect(manaOffers(game, elves)).toHaveLength(1);
    expect(manaOffers(game, bears)).toHaveLength(0);
  });

  it("cycling counts, though it can't be activated on the battlefield", () => {
    const { game } = table();
    spawn(game, "Tazri, Stalwart Survivor");
    const wraith = spawn(game, "Street Wraith");
    expect(manaOffers(game, wraith)).toHaveLength(1);
  });

  it("a second Tazri's copy of the ability is another activated ability", () => {
    const { game } = table();
    spawn(game, "Tazri, Stalwart Survivor");
    const bears = spawn(game, "Grizzly Bears");
    expect(manaOffers(game, bears)).toHaveLength(0);
    // A second Tazri, before the legend rule is checked (`spawn` doesn't).
    spawn(game, "Tazri, Stalwart Survivor");
    expect(manaOffers(game, bears)).toHaveLength(2);
  });

  it("makes a mana of the creature's colour, spendable on a creature's ability and not on a spell", () => {
    const { game } = table();
    const tazri = spawn(game, "Tazri, Stalwart Survivor");
    const [offer] = manaOffers(game, tazri);
    expect(offer).toBeDefined();
    activate(game, tazri, offer!.abilityIndex);
    const pool = game.state.players[A].manaPool;
    expect(pool.map((u) => u.type)).toEqual(["W"]);
    expect(pool[0]?.restriction?.abilityOf).toEqual({ type: "creature" });
    // A one-mana white spell can't be paid for with it.
    const spell = toHand(game, "Savannah Lions");
    expect(game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === spell)).toBe(false);
  });

  it("the mill: creature cards with a non-mana activated ability (cycling among them) go to the hand", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    const tazri = spawn(game, "Tazri, Stalwart Survivor");
    // Top of the library last.
    const elvesCard = toLibrary(game, "Llanowar Elves");
    const bearsCard = toLibrary(game, "Grizzly Bears");
    const wraithCard = toLibrary(game, "Street Wraith");
    const prodigal = toLibrary(game, "Prodigal Pyromancer");
    const bolt = toLibrary(game, "Lightning Bolt");
    activate(game, tazri, 0);
    expect(zone(game, prodigal)).toBe("hand");
    expect(zone(game, wraithCard)).toBe("hand");
    expect(zone(game, bearsCard)).toBe("graveyard");
    expect(zone(game, elvesCard)).toBe("graveyard");
    expect(zone(game, bolt)).toBe("graveyard");
    expect(hand(game, A)).toContain(prodigal);
  });
});
