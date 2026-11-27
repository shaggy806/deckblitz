import { describe, expect, it } from "vitest";
import { B, cast, destroy, lands, pickModes, ref, settle, spawn, table, toGraveyard, toHand, zone } from "./harness.js";

// "Deals damage equal to that card's power" after the card has moved, read as
// it was before the move (Dead Reckoning's ruling: the power it had in the
// graveyard, so Lord of Extinction counts itself): `with-x` around the move.
describe("power before the move: Dead Reckoning", () => {
  it("deals damage equal to the card's power as it was in the graveyard", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    // Lord of Extinction and two more cards: 3 cards in all graveyards, so
    // it's a 3/3 there and would be a 2/2 counted from the library.
    const lord = toGraveyard(game, "Lord of Extinction");
    toGraveyard(game, "Grizzly Bears", B);
    toGraveyard(game, "Forest", B);
    const giant = spawn(game, "Hill Giant", B);
    pickModes(a, 0);
    cast(game, toHand(game, "Dead Reckoning"), { targets: [ref(lord), ref(giant)] });
    expect(zone(game, lord)).toBe("library");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("declined, the card stays and no damage is dealt", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    pickModes(a);
    cast(game, toHand(game, "Dead Reckoning"), { targets: [ref(bears), ref(giant)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[giant].damageMarked ?? 0).toBe(0);
  });

  it("with the creature gone, the card may still go on top", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    pickModes(a, 0);
    cast(game, toHand(game, "Dead Reckoning"), { targets: [ref(bears), ref(giant)], settle: false });
    destroy(game, giant);
    settle(game);
    expect(zone(game, bears)).toBe("library");
  });

  it("with the card gone from the graveyard, no damage is dealt", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    pickModes(a, 0);
    cast(game, toHand(game, "Dead Reckoning"), { targets: [ref(bears), ref(giant)], settle: false });
    game.debugMove(bears, "exile");
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[giant].damageMarked ?? 0).toBe(0);
  });
});
