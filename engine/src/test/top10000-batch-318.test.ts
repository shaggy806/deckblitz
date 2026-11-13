// Batch 318: the top 5000's next cards by EDHREC rank (4075–), each on the
// feature it needed.

import { describe, expect, it } from "vitest";

import { A, B, activate, cast, loyalty, nextTurn, pt, ref, destroy, hand, lands, life, settle, spawn, table, toHand, zone } from "./harness.js";

describe("Hushbringer: creatures entering or dying don't cause abilities to trigger", () => {
  it("a creature dying causes no dies trigger, its own or another's", () => {
    const { game } = table();
    spawn(game, "Hushbringer");
    const cutthroat = spawn(game, "Zulaport Cutthroat");
    const bear = spawn(game, "Grizzly Bears");
    destroy(game, bear);
    destroy(game, cutthroat);
    expect(life(game, B)).toBe(20);
    expect(life(game, A)).toBe(20);
  });

  it("without it the same deaths drain (the control)", () => {
    const { game } = table();
    spawn(game, "Zulaport Cutthroat");
    const bear = spawn(game, "Grizzly Bears");
    destroy(game, bear);
    expect(life(game, B)).toBe(19);
  });

  it("a Hushbringer dying at the same time still bars them", () => {
    const { game } = table();
    spawn(game, "Hushbringer");
    spawn(game, "Zulaport Cutthroat");
    spawn(game, "Grizzly Bears");
    game.debugApplyEffect(B, { kind: "destroy-all", filter: { type: "creature" } }, []);
    settle(game);
    expect(life(game, B)).toBe(20);
  });

  it("the event that caused the death still triggers: a sacrifice", () => {
    const { game } = table();
    spawn(game, "Hushbringer");
    spawn(game, "Smothering Abomination");
    const seer = spawn(game, "Viscera Seer");
    const bear = spawn(game, "Grizzly Bears");
    const before = hand(game, A).length;
    activate(game, seer, 0, { sacrifice: bear });
    expect(zone(game, bear)).toBe("graveyard");
    // Smothering Abomination's draw; Viscera Seer's scry still resolves.
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("a 'from anywhere' graveyard trigger sees a Hushbringer that died with the creature gone", () => {
    const { game } = table();
    spawn(game, "Profane Memento");
    spawn(game, "Hushbringer", B);
    spawn(game, "Grizzly Bears", B);
    game.debugApplyEffect(A, { kind: "destroy-all", filter: { type: "creature" } }, []);
    settle(game);
    // Two creature cards of B's: the Bears and Hushbringer itself.
    expect(life(game, A)).toBe(22);
  });

  it("a 'from anywhere' trigger is barred while Hushbringer stays", () => {
    const { game } = table();
    spawn(game, "Profane Memento");
    spawn(game, "Hushbringer");
    const bear = spawn(game, "Grizzly Bears", B);
    destroy(game, bear);
    expect(life(game, A)).toBe(20);
  });
});

describe("Tezzeret, Betrayer of Flesh: the first activated ability of an artifact each turn costs {2} less", () => {
  it("the first one costs {2} less", () => {
    const { game } = table();
    spawn(game, "Tezzeret, Betrayer of Flesh");
    const archive = spawn(game, "Hedron Archive");
    const before = hand(game, A).length;
    activate(game, archive, 1);
    expect(hand(game, A).length).toBe(before + 2);
  });

  it("a mana ability of an artifact activated first takes the discount's turn", () => {
    const { game } = table();
    spawn(game, "Tezzeret, Betrayer of Flesh");
    const stone = spawn(game, "Mind Stone");
    const archive = spawn(game, "Hedron Archive");
    activate(game, stone, 0);
    // {C} floating; the draw costs its full {2}.
    expect(() => activate(game, archive, 1)).toThrow();
  });

  it("so does one tapped while paying for a spell", () => {
    const { game } = table();
    spawn(game, "Tezzeret, Betrayer of Flesh");
    spawn(game, "Mind Stone");
    const archive = spawn(game, "Hedron Archive");
    cast(game, toHand(game, "Bonesplitter"));
    expect(() => activate(game, archive, 1)).toThrow();
  });

  it("a land's mana ability doesn't use it up", () => {
    const { game } = table();
    spawn(game, "Tezzeret, Betrayer of Flesh");
    const forest = lands(game, "Forest", 1)[0];
    activate(game, forest, 0);
    const archive = spawn(game, "Hedron Archive");
    const before = hand(game, A).length;
    activate(game, archive, 1);
    expect(hand(game, A).length).toBe(before + 2);
  });

  it("−2 makes an artifact a 4/4, a Vehicle its printed size", () => {
    const { game } = table();
    const tez = spawn(game, "Tezzeret, Betrayer of Flesh");
    const stone = spawn(game, "Mind Stone");
    loyalty(game, tez, -2, { targets: [ref(stone)] });
    expect(game.characteristics(stone).types).toContain("creature");
    expect(pt(game, stone)).toEqual({ power: 4, toughness: 4 });
    nextTurn(game);
    nextTurn(game);
    const cart = spawn(game, "Smuggler's Copter");
    loyalty(game, tez, -2, { targets: [ref(cart)] });
    expect(pt(game, cart)).toEqual({ power: 3, toughness: 3 });
  });

  it("the second is full price", () => {
    const { game } = table();
    spawn(game, "Tezzeret, Betrayer of Flesh");
    const one = spawn(game, "Hedron Archive");
    const two = spawn(game, "Hedron Archive");
    activate(game, one, 1);
    expect(() => activate(game, two, 1)).toThrow();
  });
});
