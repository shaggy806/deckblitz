/**
 * "Ward—Collect evidence N" (rule 702.21a with 701.59a): the targeting
 * player may exile cards with total mana value N or more from their
 * graveyard, chosen as they pay, or the spell is countered; with too little
 * there they can't pay at all (701.59b), and nothing is asked. Paying is
 * collecting evidence. Axebane Ferox.
 */

import { describe, expect, it } from "vitest";

import { wardCostText } from "../effects.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, lands, pickFromZone, ref, spawn, table, toGraveyard, toHand, tokensNamed, zone } from "./harness.js";

/** Alice's Shock at Bob's Axebane Ferox, her answers to the ward set first. */
function shockFerox(game: Game): { ferox: ObjectId; shock: ObjectId } {
  const ferox = spawn(game, "Axebane Ferox", B);
  lands(game, "Mountain", 1);
  const shock = toHand(game, "Shock");
  cast(game, shock, { targets: [ref(ferox)] });
  return { ferox, shock };
}

describe("Ward—Collect evidence 4 (Axebane Ferox)", () => {
  it("reads as printed", () => {
    expect(wardCostText({ collectEvidence: 4 })).toBe("—Collect evidence 4.");
  });

  it("paid: the payer exiles cards with total mana value 4 or more from their graveyard, and the spell resolves", () => {
    const { game, a } = table();
    const giant = toGraveyard(game, "Hill Giant");
    const bears = toGraveyard(game, "Grizzly Bears");
    const asked: string[][] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      asked.push([...texts]);
      return [0];
    };
    const offer = pickFromZone(a, giant);
    const { ferox, shock } = shockFerox(game);
    expect(asked).toEqual([["Pay ward—Collect evidence 4 (or Shock is countered)"]]);
    expect(offer.offered).toEqual(expect.arrayContaining([giant, bears]));
    expect(zone(game, giant)).toBe("exile");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, shock)).toBe("graveyard");
    expect(game.state.objects[ferox].damageMarked).toBe(2);
  });

  it("paying is collecting evidence", () => {
    const { game, a } = table();
    spawn(game, "Evidence Examiner");
    toGraveyard(game, "Hill Giant");
    a.chooseModesFn = () => [0];
    pickFromZone(a, game.state.zones.perPlayer[A].graveyard[0]);
    shockFerox(game);
    expect(tokensNamed(game, "Clue Token", A)).toBe(1);
  });

  it("declined: the spell is countered and the graveyard is left alone", () => {
    const { game, a } = table();
    const giant = toGraveyard(game, "Hill Giant");
    a.chooseModesFn = () => [];
    const { ferox, shock } = shockFerox(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, shock)).toBe("graveyard");
    expect(game.state.objects[ferox].damageMarked).toBe(0);
  });

  it("too little mana value in the graveyard: it can't be paid, nothing is asked, the spell is countered", () => {
    const { game, a } = table();
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Shock");
    let asked = false;
    a.chooseModesFn = () => {
      asked = true;
      return [0];
    };
    const { ferox } = shockFerox(game);
    expect(asked).toBe(false);
    expect(game.state.objects[ferox].damageMarked).toBe(0);
    expect(zone(game, ferox)).toBe("battlefield");
  });
});
