/**
 * Life gain and damage to you made into other events (rules 614.1a, 614.6 —
 * `instead: { effect }`, "that many" `"x"`): Nefarious Lich's "if you would
 * gain life, draw that many cards instead" and "if damage would be dealt to
 * you, exile that many cards from your graveyard instead. If you can't, you
 * lose the game" — with too few cards, none is exiled and you lose (Egon,
 * God of Death's ruling on the same words). Not prevention: damage that
 * can't be prevented is replaced too.
 */
import { describe, expect, it } from "vitest";

import { A, activate, cast, destroy, graveyard, hand, lands, life, pickFromZone, ref, spawn, table, toGraveyard, toHand } from "./harness.js";

describe("Nefarious Lich", () => {
  it("draws that many cards instead of gaining life", () => {
    const { game } = table();
    spawn(game, "Nefarious Lich");
    const before = hand(game).length;
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 });
    expect(life(game)).toBe(20);
    expect(hand(game).length).toBe(before + 3);
  });

  it("exiles that many cards from your graveyard, of your choice, instead of the damage", () => {
    const { game, a } = table();
    spawn(game, "Nefarious Lich");
    const cards = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Hill Giant"), toGraveyard(game, "Forest"), toGraveyard(game, "Island")];
    pickFromZone(a, cards[0], cards[1], cards[3]);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(A)] });
    expect(life(game)).toBe(20);
    expect(game.state.players[A].hasLost).toBe(false);
    expect([cards[0], cards[1], cards[3]].map((id) => game.state.objects[id].zone)).toEqual(["exile", "exile", "exile"]);
    expect(graveyard(game)).toContain(cards[2]);
  });

  it("replaces damage that can't be prevented too", () => {
    const { game } = table();
    spawn(game, "Nefarious Lich");
    for (const name of ["Grizzly Bears", "Hill Giant", "Forest", "Island"]) toGraveyard(game, name);
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Flames of the Blood Hand"), { targets: [ref(A)] });
    expect(life(game)).toBe(20);
    expect(game.state.players[A].hasLost).toBe(false);
    expect(graveyard(game).filter((id) => game.state.objects[id].cardName !== "Flames of the Blood Hand")).toHaveLength(0);
  });

  it("loses the game when there aren't that many cards, exiling none", () => {
    const { game } = table();
    spawn(game, "Nefarious Lich");
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(A)] });
    expect(game.state.players[A].hasLost).toBe(true);
    expect(life(game)).toBe(20);
    expect(game.state.objects[bears].zone).toBe("graveyard");
  });

  it("doesn't turn a gain its own draw became back into draws (the ruling, rule 614.5)", () => {
    const { game } = table();
    spawn(game, "Nefarious Lich");
    const words = spawn(game, "Words of Worship");
    lands(game, "Plains", 1);
    activate(game, words, 0);
    const before = hand(game).length;
    // Gain 3: three draws instead; the first becomes Words of Worship's 5
    // life, which the Lich has already acted on, so it's gained.
    game.debugApplyEffect(A, { kind: "gain-life", amount: 3 });
    expect(life(game)).toBe(25);
    expect(hand(game).length).toBe(before + 2);
  });

  it("loses the game when it leaves the battlefield", () => {
    const { game } = table();
    const lich = spawn(game, "Nefarious Lich");
    destroy(game, lich);
    expect(game.state.players[A].hasLost).toBe(true);
  });
});
