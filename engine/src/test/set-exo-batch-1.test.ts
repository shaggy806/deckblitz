/**
 * Exodus (batch 187, the oldest-first set walk) — the lead's cards and the
 * three features they needed: a "discard a card at random" cost (an
 * activated ability's `cost.discard.random`, a spell's
 * `additionalCost.discardAtRandom`), buyback's non-mana costs
 * (`kicker.also`, rule 702.27a), and "target opponent who has more … than
 * you do as you activate this ability" (the `opponent-compared` target).
 */

import { describe, expect, it } from "vitest";

import { A, B, activate, cast, graveyard, hand, life, ref, spawn, table, toHand, tokensNamed, zone, lands } from "./harness.js";

describe("discard a card at random as a cost", () => {
  it("Mage il-Vec discards one of its controller's cards at random and deals 1 damage", () => {
    const { game } = table();
    const mage = spawn(game, "Mage il-Vec");
    toHand(game, "Wastes");
    toHand(game, "Wastes");
    const before = hand(game).length;
    activate(game, mage, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    expect(hand(game).length).toBe(before - 1);
    expect(game.state.awaiting).toBeNull();
  });

  it("Mage il-Vec can't be activated with an empty hand", () => {
    const { game } = table();
    const mage = spawn(game, "Mage il-Vec");
    for (const id of [...hand(game)]) game.debugMove(id, "graveyard");
    expect(() => activate(game, mage, 0, { targets: [ref(B)] })).toThrow(/too few cards/);
  });

  it("Ogre Shaman pays {2} and a random card for 2 damage", () => {
    const { game } = table();
    const ogre = spawn(game, "Ogre Shaman");
    lands(game, "Mountain", 2);
    const before = hand(game).length;
    activate(game, ogre, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    expect(hand(game).length).toBe(before - 1);
  });

  it("Sonic Burst discards at random as it's cast, not itself", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const burst = toHand(game, "Sonic Burst");
    const before = hand(game).length;
    cast(game, burst, { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
    expect(hand(game).length).toBe(before - 2);
    expect(graveyard(game)).toContain(burst);
  });

  it("Sonic Burst can't be cast as the only card in hand", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    for (const id of [...hand(game)]) game.debugMove(id, "graveyard");
    const burst = toHand(game, "Sonic Burst");
    expect(() => cast(game, burst, { targets: [ref(B)] })).toThrow(/too few cards/);
  });
});

describe("buyback with a non-mana cost", () => {
  it("Slaughter with buyback costs 4 life and returns to hand", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const bear = spawn(game, "Grizzly Bears", B);
    const slaughter = toHand(game, "Slaughter");
    cast(game, slaughter, { targets: [ref(bear)], kicked: true });
    expect(zone(game, bear)).toBe("graveyard");
    expect(life(game, A)).toBe(16);
    expect(zone(game, slaughter)).toBe("hand");
  });

  it("Slaughter without buyback costs no life and goes to the graveyard", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const bear = spawn(game, "Grizzly Bears", B);
    const slaughter = toHand(game, "Slaughter");
    cast(game, slaughter, { targets: [ref(bear)] });
    expect(life(game, A)).toBe(20);
    expect(zone(game, slaughter)).toBe("graveyard");
  });

  it("Pegasus Stampede's buyback sacrifices a land", () => {
    const { game } = table();
    const plains = lands(game, "Plains", 3);
    const stampede = toHand(game, "Pegasus Stampede");
    cast(game, stampede, { kicked: true });
    expect(tokensNamed(game, "Pegasus Token", A)).toBe(1);
    expect(zone(game, stampede)).toBe("hand");
    expect(plains.filter((id) => zone(game, id) === "graveyard")).toHaveLength(1);
  });

  it("Reaping the Rewards' buyback can sacrifice the land that paid for it", () => {
    const { game } = table();
    const reaping = toHand(game, "Reaping the Rewards");
    // One Plains: tapped for the {W}, then sacrificed — a tapped land is
    // still a land to sacrifice.
    const [plains] = lands(game, "Plains", 1);
    cast(game, reaping, { kicked: true });
    expect(life(game, A)).toBe(22);
    expect(zone(game, plains)).toBe("graveyard");
    expect(zone(game, reaping)).toBe("hand");
  });

  it("Flowstone Flood's buyback pays 3 life and a random card", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const land = spawn(game, "Forest", B);
    const flood = toHand(game, "Flowstone Flood");
    const before = hand(game).length;
    cast(game, flood, { targets: [ref(land)], kicked: true });
    expect(zone(game, land)).toBe("graveyard");
    expect(life(game, A)).toBe(17);
    // The Flood came back; one other card was discarded.
    expect(zone(game, flood)).toBe("hand");
    expect(hand(game).length).toBe(before - 1);
  });
});

describe("target opponent who has more … than you do", () => {
  it("Keeper of the Flame targets only an opponent with more life", () => {
    const { game } = table({ players: 3 });
    const keeper = spawn(game, "Keeper of the Flame");
    lands(game, "Mountain", 1);
    game.state.players[A].life = 15;
    game.state.players[B].life = 15;
    expect(() => activate(game, keeper, 0, { targets: [ref(B)] })).toThrow();
    activate(game, keeper, 0, { targets: [ref("carol" as never)] });
    expect(life(game, "carol" as never)).toBe(18);
  });

  it("the comparison isn't judged again as the ability resolves", () => {
    const { game } = table();
    const keeper = spawn(game, "Keeper of the Light");
    lands(game, "Plains", 1);
    game.state.players[A].life = 10;
    activate(game, keeper, 0, { targets: [ref(B)], settle: false });
    // Bob drops below alice before it resolves: it still resolves.
    game.state.players[B].life = 5;
    game.advanceUntil((s) => s.zones.shared.stack.length === 0);
    expect(life(game, A)).toBe(13);
  });

  it("Keeper of the Mind needs at least two more cards in hand", () => {
    const { game } = table();
    const keeper = spawn(game, "Keeper of the Mind");
    lands(game, "Island", 1);
    for (const id of [...hand(game)]) game.debugMove(id, "graveyard");
    for (const id of [...hand(game, B)]) game.debugMove(id, "graveyard");
    toHand(game, "Wastes", B);
    expect(() => activate(game, keeper, 0, { targets: [ref(B)] })).toThrow();
    toHand(game, "Wastes", B);
    activate(game, keeper, 0, { targets: [ref(B)] });
    expect(hand(game).length).toBe(1);
  });

  it("Keeper of the Beasts counts creatures, a token stack as every token", () => {
    const { game } = table();
    const keeper = spawn(game, "Keeper of the Beasts");
    lands(game, "Forest", 1);
    spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, keeper, 0, { targets: [ref(B)] })).toThrow();
    spawn(game, "Grizzly Bears", B);
    activate(game, keeper, 0, { targets: [ref(B)] });
    expect(tokensNamed(game, "2/2 Beast Token", A)).toBe(1);
  });
});
