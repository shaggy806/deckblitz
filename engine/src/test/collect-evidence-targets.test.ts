/**
 * Collect evidence X as a spell's additional cost, X the total mana value of
 * the permanents it targets (`additionalCost.collectEvidenceTargetsManaValue`
 * — Urgent Necropsy, rule 701.59a): X fixed with the targets (601.2c), each
 * permanent counted once, the cards exiled once the spell is on the stack
 * (601.2h). A target past what the graveyard holds isn't offered, and a set
 * too dear together is refused (701.59b).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { targetsWithinTaxes } from "../target-count.js";
import { A, B, cast, lands, pickFromZone, ref, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

type CastOffer = Extract<LegalAction, { kind: "cast-spell" }>;
const offerFor = (game: Game, card: ObjectId): CastOffer | undefined =>
  game.legalActions(A).find((x): x is CastOffer => x.kind === "cast-spell" && x.card === card);

const ready = (game: Game): ObjectId => {
  lands(game, "Swamp", 2);
  lands(game, "Forest", 2);
  return toHand(game, "Urgent Necropsy");
};

describe("Urgent Necropsy", () => {
  it("destroys its targets, exiling cards from the graveyard worth their total mana value", () => {
    const { game, a } = table();
    const necropsy = ready(game);
    // Grizzly Bears (2) and Savannah Lions (1): evidence 3.
    const bears = spawn(game, "Grizzly Bears", B);
    const lions = spawn(game, "Savannah Lions", B);
    const shock = toGraveyard(game, "Shock");
    const giant = toGraveyard(game, "Hill Giant");
    // The one creature slot takes one of them; the artifact slot none.
    const offer = offerFor(game, necropsy);
    expect(offer?.targetEvidence).toBeDefined();
    pickFromZone(a, giant);
    cast(game, necropsy, { targets: [null, ref(bears), null, null] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, lions)).toBe("battlefield");
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, shock)).toBe("graveyard");
  });

  it("isn't offered a target worth more than the graveyard holds, and refuses a set too dear together", () => {
    const { game } = table();
    const necropsy = ready(game);
    const giant = spawn(game, "Hill Giant", B); // 4
    const bears = spawn(game, "Grizzly Bears", B); // 2
    const relic = spawn(game, "Sol Ring", B); // 1
    toGraveyard(game, "Grizzly Bears"); // 2
    const offer = offerFor(game, necropsy)!;
    const creatures = offer.targetOptions[1].flatMap((t) => (t.kind === "object" ? [t.object] : []));
    expect(creatures).toContain(bears);
    expect(creatures).not.toContain(giant);
    // Bears and Sol Ring together are 3, past the graveyard's 2.
    expect(targetsWithinTaxes(offer, [ref(relic), ref(bears), null, null])).toBe(false);
    expect(targetsWithinTaxes(offer, [ref(relic), null, null, null])).toBe(true);
    expect(() => cast(game, necropsy, { targets: [ref(relic), ref(bears), null, null] })).toThrow(/evidence/);
  });

  it("with no targets, collects evidence 0 and asks nothing", () => {
    const { game } = table();
    const necropsy = ready(game);
    cast(game, necropsy, { targets: [null, null, null, null] });
    expect(zone(game, necropsy)).toBe("graveyard");
  });

  it("an artifact creature chosen for two targets counts once", () => {
    const { game, a } = table();
    const necropsy = ready(game);
    const myr = spawn(game, "Steel Overseer", B); // 2, artifact creature
    const bears = toGraveyard(game, "Grizzly Bears"); // 2
    pickFromZone(a, bears);
    cast(game, necropsy, { targets: [ref(myr), ref(myr), null, null] });
    expect(zone(game, myr)).toBe("graveyard");
    expect(zone(game, bears)).toBe("exile");
  });
});
