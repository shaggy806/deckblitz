/** Batch 148's lead-authored card (Shadows over Innistrad) beside the
 * werewolves (`werewolf-transform.test.ts`): Startled Awake, a sorcery whose
 * graveyard ability puts it onto the battlefield transformed — as Persistent
 * Nightmare, its creature back face (rule 712.14a; the card's ruling). */
import { describe, expect, it } from "vitest";

import { printedCardName } from "../state.js";

import { activate, lands, table, toGraveyard, zone } from "./harness.js";

describe("Startled Awake", () => {
  it("returns from the graveyard transformed, as Persistent Nightmare", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const card = toGraveyard(game, "Startled Awake");
    activate(game, card, 0);
    expect(zone(game, card)).toBe("battlefield");
    expect(printedCardName(game.state.objects[card])).toBe("Persistent Nightmare");
  });
});
