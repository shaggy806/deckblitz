/**
 * "A Curse attached to **enchanted player**" (Curse of Misfortunes): the
 * filter clause `attachedToPlayer: "enchanted-player"` — the player the
 * filter's source is attached to — and the `"enchanted-player"` player ref
 * for "attached to that player" (rule 303.4), read at the beginning of the
 * Curse's controller's own upkeep, not the enchanted player's.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, cast, lands, pickFromZone, pickModes, ref, table, toHand, toLibrary, toStep, zone } from "./harness.js";

describe("Curse of Misfortunes — a Curse not named like one on the enchanted player", () => {
  it("finds a Curse of another name and attaches it to that player", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Swamp", 5);
    lands(game, "Island", 3);
    // Bob wears a Curse of the Bloody Tome; carol, Curse of Opulence's twin.
    const tome = toHand(game, "Curse of the Bloody Tome");
    cast(game, tome, { targets: [ref(B)] });
    const misfortunes = toHand(game, "Curse of Misfortunes");
    cast(game, misfortunes, { targets: [ref(B)] });
    expect(game.state.objects[misfortunes].attachedToPlayer).toBe(B);
    const libTome = toLibrary(game, "Curse of the Bloody Tome");
    const libMisfortunes = toLibrary(game, "Curse of Misfortunes");
    const opulence = toLibrary(game, "Curse of Opulence");
    toLibrary(game, "Grizzly Bears");
    pickModes(a, 0);
    const seen = pickFromZone(a, opulence);
    toStep(game, "draw", A);
    // Not the Tome (on bob already), not another Misfortunes (itself on bob).
    expect(seen.offered).toContain(opulence);
    expect(seen.offered).not.toContain(libTome);
    expect(seen.offered).not.toContain(libMisfortunes);
    expect(zone(game, opulence)).toBe("battlefield");
    expect(game.state.objects[opulence].attachedToPlayer).toBe(B);
  });

  it("Curses on other players don't count", () => {
    const { game, a } = table({ players: 3 });
    lands(game, "Swamp", 5);
    lands(game, "Island", 3);
    const tome = toHand(game, "Curse of the Bloody Tome");
    cast(game, tome, { targets: [ref(C)] });
    const misfortunes = toHand(game, "Curse of Misfortunes");
    cast(game, misfortunes, { targets: [ref(B)] });
    const libTome = toLibrary(game, "Curse of the Bloody Tome");
    pickModes(a, 0);
    const seen = pickFromZone(a, libTome);
    toStep(game, "draw", A);
    expect(seen.offered).toContain(libTome);
    expect(game.state.objects[libTome].attachedToPlayer).toBe(B);
  });
});
