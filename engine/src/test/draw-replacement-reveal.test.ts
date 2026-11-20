/**
 * A draw replaced by an effect that reveals and draws within it (rule
 * 614.1a; the draw it makes is a new draw this replacement can't replace
 * again, 614.5): Zur's Weirding (reveal the top card, any other player may
 * pay 2 life to mill it, else draw — an `unless` over `{ otherThan }` whose
 * `payLife` option has an `ifPaid`).
 */

import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import { A, B, C, cast, destroy, graveyard, hand, lands, life, settle, spawn, table, toHand, toLibrary, turnTotal, zone } from "./harness.js";

function watchModes(seat: ScriptedController, ...modes: readonly number[]): { asked: number } {
  const seen = { asked: 0 };
  seat.chooseModesFn = () => {
    seen.asked += 1;
    return [...modes];
  };
  return seen;
}

describe("Zur's Weirding", () => {
  it("another player pays 2 life: the revealed card goes to the graveyard, never drawn", () => {
    const { game, a, b } = table();
    spawn(game, "Zur's Weirding");
    const bears = toLibrary(game, "Grizzly Bears");
    const alice = watchModes(a, 0);
    const bob = watchModes(b, 0);
    const handBefore = hand(game).length;
    const drawnBefore = turnTotal(game.state, A, "card-drawn");
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(alice.asked).toBe(0);
    expect(bob.asked).toBe(1);
    expect(zone(game, bears)).toBe("graveyard");
    expect(graveyard(game)).toContain(bears);
    expect(life(game, B)).toBe(18);
    expect(hand(game).length).toBe(handBefore);
    expect(turnTotal(game.state, A, "card-drawn")).toBe(drawnBefore);
  });

  it("nobody pays: that player draws the card, once (rule 614.5)", () => {
    const { game, b } = table();
    spawn(game, "Zur's Weirding");
    const bears = toLibrary(game, "Grizzly Bears");
    const bob = watchModes(b);
    const drawnBefore = turnTotal(game.state, A, "card-drawn");
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(bob.asked).toBe(1);
    expect(zone(game, bears)).toBe("hand");
    expect(life(game, B)).toBe(20);
    expect(turnTotal(game.state, A, "card-drawn")).toBe(drawnBefore + 1);
  });

  it("each card of a draw of two is replaced in turn (rule 614.11a)", () => {
    const { game, b } = table();
    spawn(game, "Zur's Weirding");
    lands(game, "Island", 3);
    const second = toLibrary(game, "Hill Giant");
    const first = toLibrary(game, "Grizzly Bears");
    // Bob pays for the first and lets the second be drawn.
    let asked = 0;
    b.chooseModesFn = () => (asked++ === 0 ? [0] : []);
    cast(game, toHand(game, "Divination"));
    settle(game);
    expect(asked).toBe(2);
    expect(zone(game, first)).toBe("graveyard");
    expect(zone(game, second)).toBe("hand");
    expect(life(game, B)).toBe(18);
  });

  it("the other players are asked in turn order from the active player, the drawing player never", () => {
    const { game, a, b, c } = table({ players: 3 });
    spawn(game, "Zur's Weirding", C);
    const bears = toLibrary(game, "Grizzly Bears", B);
    const alice = watchModes(a);
    const bob = watchModes(b, 0);
    const carol = watchModes(c, 0);
    game.debugApplyEffect(B, { kind: "draw", amount: 1 });
    settle(game);
    expect(alice.asked).toBe(1);
    expect(bob.asked).toBe(0);
    expect(carol.asked).toBe(1);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, C)).toBe(18);
    expect(life(game, A)).toBe(20);
  });
});

describe("Enduring Renewal", () => {
  it("a creature card on top goes to the graveyard undrawn; anything else is drawn", () => {
    const { game } = table();
    spawn(game, "Enduring Renewal");
    lands(game, "Island", 3);
    const forest = toLibrary(game, "Forest");
    const bears = toLibrary(game, "Grizzly Bears");
    const drawnBefore = turnTotal(game.state, A, "card-drawn");
    cast(game, toHand(game, "Divination"));
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, forest)).toBe("hand");
    expect(turnTotal(game.state, A, "card-drawn")).toBe(drawnBefore + 1);
  });

  it("returns a creature of yours that dies to your hand", () => {
    const { game } = table();
    spawn(game, "Enduring Renewal");
    const bears = spawn(game, "Grizzly Bears");
    destroy(game, bears);
    expect(hand(game).map((id) => game.state.objects[id].cardName)).toContain("Grizzly Bears");
  });
});

describe("Forbidden Crypt", () => {
  it("each draw returns a card from the graveyard instead; with none left, its controller loses", () => {
    const { game, a } = table();
    // Into the graveyard before the Crypt, which would exile it on the way.
    const bears = game.debugSpawn("Grizzly Bears", A, "graveyard");
    spawn(game, "Forbidden Crypt");
    a.chooseFromZoneFn = (_view, eligible) => [eligible[0]];
    const drawnBefore = turnTotal(game.state, A, "card-drawn");
    const libraryBefore = game.state.zones.perPlayer[A].library.length;
    game.debugApplyEffect(A, { kind: "draw", amount: 2 });
    settle(game);
    expect(zone(game, bears)).toBe("hand");
    expect(game.state.zones.perPlayer[A].library.length).toBe(libraryBefore);
    expect(turnTotal(game.state, A, "card-drawn")).toBe(drawnBefore);
    // The second draw found the graveyard empty.
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("a card of yours that would go to your graveyard is exiled instead", () => {
    const { game } = table();
    spawn(game, "Forbidden Crypt");
    const bears = spawn(game, "Grizzly Bears");
    destroy(game, bears);
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("Breathstealer's Crypt", () => {
  it("a creature card drawn is discarded unless its drawer pays 3 life", () => {
    const { game, a, b } = table();
    spawn(game, "Breathstealer's Crypt", B);
    const bears = toLibrary(game, "Grizzly Bears");
    const alice = watchModes(a);
    const bob = watchModes(b);
    const drawnBefore = turnTotal(game.state, A, "card-drawn");
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(alice.asked).toBe(1);
    expect(bob.asked).toBe(0);
    expect(zone(game, bears)).toBe("graveyard");
    // It was drawn, once (rule 614.5), then discarded.
    expect(turnTotal(game.state, A, "card-drawn")).toBe(drawnBefore + 1);
    expect(life(game, A)).toBe(20);
  });

  it("paying 3 life keeps it", () => {
    const { game, a } = table();
    spawn(game, "Breathstealer's Crypt", B);
    const bears = toLibrary(game, "Grizzly Bears");
    watchModes(a, 0);
    game.debugApplyEffect(A, { kind: "draw", amount: 1 });
    settle(game);
    expect(zone(game, bears)).toBe("hand");
    expect(life(game, A)).toBe(17);
  });

  it("a noncreature card is simply drawn, and each card of two is its own question (rule 614.11a)", () => {
    const { game, a } = table();
    spawn(game, "Breathstealer's Crypt", B);
    lands(game, "Island", 3);
    const giant = toLibrary(game, "Hill Giant");
    const forest = toLibrary(game, "Forest");
    const alice = watchModes(a);
    cast(game, toHand(game, "Divination"));
    settle(game);
    expect(alice.asked).toBe(1);
    expect(zone(game, forest)).toBe("hand");
    expect(zone(game, giant)).toBe("graveyard");
  });
});
