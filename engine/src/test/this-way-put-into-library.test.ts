import { describe, expect, it } from "vitest";
import { activate, B, cast, hand, lands, nextTurn, pickFromZone, ref, table, toHand, toLibrary, zone } from "./harness.js";

// The `"put-into-library"` this-way kind: the cards a resolution put into a
// library from another zone — Head Games' "target opponent puts the cards
// from their hand on top of their library. Search that player's library for
// **that many** cards. The player puts those cards into their hand, then
// shuffles."

const shufflesOf = (game: ReturnType<typeof table>["game"], player = B): number =>
  game.eventsOfType("library-shuffled").filter((e) => e.player === player).length;

describe("cards put into a library this way — Head Games", () => {
  it("the opponent's hand goes on their library, and the caster finds that many cards for it", () => {
    const { game, a } = table({ openingHandSize: 0 });
    const ritual = toLibrary(game, "Dark Ritual", B);
    const duress = toLibrary(game, "Duress", B);
    const bears = toHand(game, "Grizzly Bears", B);
    const bolt = toHand(game, "Lightning Bolt", B);
    lands(game, "Swamp", 5);
    const seen = pickFromZone(a, ritual, duress);
    cast(game, toHand(game, "Head Games"), { targets: [ref(B)] });
    // The search was of the whole library, the hand put back among it.
    expect(seen.offered).toEqual(expect.arrayContaining([bears, bolt, ritual, duress]));
    expect([...hand(game, B)].sort()).toEqual([ritual, duress].sort());
    expect(game.state.objects[bears].zone).toBe("library");
    expect(game.state.objects[bolt].zone).toBe("library");
    expect(shufflesOf(game)).toBe(1);
  });

  it("counts only the cards actually put there: an empty hand finds nothing, though the library is searched", () => {
    const { game, a } = table({ openingHandSize: 0 });
    const ritual = toLibrary(game, "Dark Ritual", B);
    lands(game, "Swamp", 5);
    const seen = pickFromZone(a);
    cast(game, toHand(game, "Head Games"), { targets: [ref(B)] });
    expect(seen.offered).toContain(ritual);
    expect(hand(game, B)).toHaveLength(0);
    expect(game.state.objects[ritual].zone).toBe("library");
    expect(shufflesOf(game)).toBe(1);
  });

  it("a hand of three: three found, whichever the searcher picks", () => {
    const { game, a } = table({ openingHandSize: 0 });
    for (let i = 0; i < 3; i += 1) toHand(game, "Grizzly Bears", B);
    const finds = [toLibrary(game, "Dark Ritual", B), toLibrary(game, "Duress", B), toLibrary(game, "Island", B)];
    lands(game, "Swamp", 5);
    pickFromZone(a, ...finds);
    cast(game, toHand(game, "Head Games"), { targets: [ref(B)] });
    expect([...hand(game, B)].sort()).toEqual([...finds].sort());
  });

  it("Jester's Mask enters tapped, and its ability does the same", () => {
    const { game, a } = table({ openingHandSize: 0 });
    lands(game, "Wastes", 5);
    const mask = toHand(game, "Jester's Mask");
    cast(game, mask);
    expect(game.state.objects[mask].tapped).toBe(true);
    nextTurn(game);
    nextTurn(game);
    const bears = toHand(game, "Grizzly Bears", B);
    // Bob's hand: the card he drew on his turn, and the Bears.
    expect(hand(game, B)).toHaveLength(2);
    const finds = [toLibrary(game, "Dark Ritual", B), toLibrary(game, "Duress", B)];
    pickFromZone(a, ...finds);
    activate(game, mask, 0, { targets: [ref(B)] });
    expect(zone(game, mask)).toBe("graveyard");
    expect([...hand(game, B)].sort()).toEqual([...finds].sort());
    expect(zone(game, bears)).toBe("library");
  });
});
