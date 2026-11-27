/**
 * `discard-chosen`'s `destination: "stay"`: a card chosen from a revealed
 * hand that doesn't move, named by `thisWay: "chosen"` for what follows —
 * Lobotomy's and Shimian Specter's search for all cards with its name, which
 * finds every one in the graveyard and may leave those in the hidden hand and
 * library (rule 701.23b; Shimian Specter's ruling).
 */
import { describe, expect, it } from "vitest";

import { B, attack, cast, lands, pickFromZone, ref, settle, spawn, table, toGraveyard, toHand, toLibrary, zone } from "./harness.js";

describe("a card chosen from a revealed hand, left there", () => {
  it("Lobotomy: every copy in the graveyard goes; the chosen one in hand only if the searcher takes it", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    const chosen = toHand(game, "Lightning Bolt", B);
    const other = toHand(game, "Grizzly Bears", B);
    const inGraveyard = toGraveyard(game, "Lightning Bolt", B);
    const inLibrary = toLibrary(game, "Lightning Bolt", B);
    const asked: (readonly string[])[] = [];
    // First the hand choice (the Bolt), then the search: leave the hand's.
    let n = 0;
    a.chooseFromZoneFn = (_view, eligible) => {
      asked.push([...eligible]);
      n += 1;
      return n === 1 ? [chosen] : eligible.filter((id) => id === inLibrary);
    };
    cast(game, toHand(game, "Lobotomy"), { targets: [ref(B)] });
    settle(game);
    expect(asked[0]).toContain(chosen);
    expect(asked[0]).toContain(other);
    expect(zone(game, inGraveyard)).toBe("exile");
    expect(zone(game, inLibrary)).toBe("exile");
    expect(zone(game, chosen)).toBe("hand");
    expect(zone(game, other)).toBe("hand");
  });

  it("Lobotomy: a basic land can't be chosen, a nonbasic one can", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    lands(game, "Swamp", 2);
    const forest = toHand(game, "Forest", B);
    const nonbasic = toHand(game, "Command Tower", B);
    const seen = pickFromZone(a, nonbasic);
    cast(game, toHand(game, "Lobotomy"), { targets: [ref(B)] });
    settle(game);
    expect(seen.offered).not.toContain(forest);
    expect(zone(game, forest)).toBe("hand");
  });

  it("Shimian Specter: on combat damage, the chosen card's name is searched out", () => {
    const { game, a } = table();
    const specter = spawn(game, "Shimian Specter");
    const chosen = toHand(game, "Grizzly Bears", B);
    const inGraveyard = toGraveyard(game, "Grizzly Bears", B);
    let n = 0;
    a.chooseFromZoneFn = (_view, eligible) => {
      n += 1;
      return n === 1 ? [chosen] : eligible;
    };
    attack(game, a, [specter]);
    expect(zone(game, inGraveyard)).toBe("exile");
    expect(zone(game, chosen)).toBe("exile");
    expect(n).toBe(2);
  });
});
