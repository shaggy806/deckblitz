/**
 * How often a `counters-put` trigger fires: once per permanent per event by
 * default (Hapatra's ruling), `perCounter` once per counter (Fathom Mage,
 * Flourishing Defenses), and `batched` once for a simultaneous placement over
 * several permanents (Invisible Woman, Sue Storm; Bioessence Hydra).
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, cast, counters, hand, lands, pickModes, pickTargets, ref, settle, spawn, table, toGraveyard, toHand, tokensNamed } from "./harness.js";

const put = (game: Game, player: PlayerId, to: ObjectId, counter: string, amount: number): void => {
  game.debugApplyEffect(player, { kind: "add-counter", target: 0, counter, amount }, [ref(to)]);
  settle(game);
};

describe("perCounter", () => {
  it("Fathom Mage: a draw for each +1/+1 counter put at once", () => {
    const { game, a } = table({ deck: "Mountain" });
    pickModes(a, 0);
    const mage = spawn(game, "Fathom Mage");
    const before = hand(game, A).length;
    put(game, A, mage, "+1/+1", 3);
    expect(hand(game, A).length).toBe(before + 3);
    // Not another kind of counter.
    put(game, A, mage, "charge", 2);
    expect(hand(game, A).length).toBe(before + 3);
  });

  it("Fathom Mage: each is its own may", () => {
    const { game, a } = table({ deck: "Mountain" });
    const answers = [[0], []];
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return answers.shift() ?? [];
    };
    const mage = spawn(game, "Fathom Mage");
    const before = hand(game, A).length;
    put(game, A, mage, "+1/+1", 2);
    expect(asked).toBe(2);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("Fathom Mage: evolve's counter triggers it", () => {
    const { game, a } = table({ deck: "Mountain" });
    pickModes(a, 0);
    const mage = spawn(game, "Fathom Mage");
    const before = hand(game, A).length;
    lands(game, "Forest", 2, A);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(counters(game, mage)).toBe(1);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("Flourishing Defenses: once per -1/-1 counter on any creature", () => {
    const { game, a } = table();
    pickModes(a, 0);
    spawn(game, "Flourishing Defenses");
    const giant = spawn(game, "Hill Giant", B);
    put(game, B, giant, "-1/-1", 2);
    expect(tokensNamed(game, "Elf Warrior Token", A)).toBe(2);
    put(game, A, spawn(game, "Fall of Cair Andros"), "-1/-1", 1);
    expect(tokensNamed(game, "Elf Warrior Token", A)).toBe(2);
  });

  it("Bloodcrazed Hoplite: one +1/+1 counter off an opponent's creature per counter put", () => {
    const { game, a } = table();
    const hoplite = spawn(game, "Bloodcrazed Hoplite");
    const giant = spawn(game, "Hill Giant", B);
    put(game, B, giant, "+1/+1", 3);
    pickTargets(a, giant);
    put(game, A, hoplite, "+1/+1", 2);
    expect(counters(game, giant)).toBe(1);
  });

  it("Bloodcrazed Hoplite: heroic puts the counter that triggers it", () => {
    const { game, a } = table();
    const hoplite = spawn(game, "Bloodcrazed Hoplite");
    const giant = spawn(game, "Hill Giant", B);
    put(game, B, giant, "+1/+1", 1);
    lands(game, "Forest", 1, A);
    pickTargets(a, giant);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(hoplite)] });
    expect(counters(game, hoplite)).toBe(1);
    expect(counters(game, giant)).toBe(0);
  });
});

describe("batched", () => {
  it("Invisible Woman: a counter on each of her Heroes makes one Wall; on her alone, none", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const sue = spawn(game, "Invisible Woman, Sue Storm");
    put(game, A, sue, "+1/+1", 1);
    expect(tokensNamed(game, "Wall Token (The Fantastic Four)", A)).toBe(0);
    spawn(game, "Brave Brawler");
    spawn(game, "Brave Brawler");
    game.debugApplyEffect(A, { kind: "add-counter-all", filter: { subtype: "Hero", controlledBy: "you" }, counter: "+1/+1", amount: 1 });
    settle(game);
    expect(tokensNamed(game, "Wall Token (The Fantastic Four)", A)).toBe(1);
  });

  const heroesAndMana = (game: Game): readonly [ObjectId, ObjectId] => {
    spawn(game, "Invisible Woman, Sue Storm");
    lands(game, "Forest", 2, A);
    lands(game, "Plains", 2, A);
    return [spawn(game, "Brave Brawler"), spawn(game, "Brave Brawler")];
  };

  it("one instruction: Gird for Battle's 'each of up to two' is one placement", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const [one, two] = heroesAndMana(game);
    cast(game, toHand(game, "Gird for Battle"), { targets: [ref(one), ref(two)] });
    expect(counters(game, one)).toBe(1);
    expect(counters(game, two)).toBe(1);
    expect(tokensNamed(game, "Wall Token (The Fantastic Four)", A)).toBe(1);
  });

  it("two sentences: Common Bond's two counters are two placements, and fire twice", () => {
    const { game, a } = table();
    pickModes(a, 0);
    const [one, two] = heroesAndMana(game);
    cast(game, toHand(game, "Common Bond"), { targets: [ref(one), ref(two)] });
    expect(counters(game, one)).toBe(1);
    expect(counters(game, two)).toBe(1);
    expect(tokensNamed(game, "Wall Token (The Fantastic Four)", A)).toBe(2);
  });

  it("an unmarked sequence stays separate; a marked one's other steps stay in order", () => {
    const { game, a } = table({ deck: "Mountain" });
    pickModes(a, 0);
    spawn(game, "Invisible Woman, Sue Storm");
    const one = spawn(game, "Brave Brawler");
    const two = spawn(game, "Brave Brawler");
    const steps = [
      { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
      { kind: "add-counter", target: 1, counter: "+1/+1", amount: 1 },
    ] as const;
    game.debugApplyEffect(A, { kind: "sequence", effects: [...steps] }, [ref(one), ref(two)]);
    settle(game);
    expect(tokensNamed(game, "Wall Token (The Fantastic Four)", A)).toBe(2);
    const before = hand(game, A).length;
    game.debugApplyEffect(
      A,
      { kind: "sequence", together: true, effects: [...steps, { kind: "draw", amount: 1 }] },
      [ref(one), ref(two)],
    );
    settle(game);
    expect(tokensNamed(game, "Wall Token (The Fantastic Four)", A)).toBe(3);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("Invisible Woman: only the counters you put, and only +1/+1", () => {
    const { game, a } = table();
    pickModes(a, 0);
    spawn(game, "Invisible Woman, Sue Storm");
    const hero = spawn(game, "Brave Brawler");
    put(game, B, hero, "+1/+1", 1);
    put(game, A, hero, "charge", 1);
    expect(tokensNamed(game, "Wall Token (The Fantastic Four)", A)).toBe(0);
  });

  it("Bioessence Hydra: enters with the loyalty counters there, and grows by a total", () => {
    const { game } = table();
    const walker = spawn(game, "Liliana of the Veil");
    const other = spawn(game, "Jace Beleren");
    const loyalty = game.state.objects[walker].counters.loyalty! + game.state.objects[other].counters.loyalty!;
    lands(game, "Forest", 4, A);
    lands(game, "Island", 1, A);
    cast(game, toHand(game, "Bioessence Hydra"));
    const [hydra] = Object.keys(game.state.objects).filter(
      (id) => game.state.objects[id as ObjectId].zone === "battlefield" && game.state.objects[id as ObjectId].cardName === "Bioessence Hydra",
    ) as ObjectId[];
    expect(counters(game, hydra!)).toBe(loyalty);
    // Both planeswalkers at once: one trigger, for 2.
    game.debugApplyEffect(A, { kind: "add-counter-all", filter: { type: "planeswalker", controlledBy: "you" }, counter: "loyalty", amount: 1 });
    expect(game.state.pendingTriggers.length + game.state.zones.shared.stack.length).toBeGreaterThan(0);
    settle(game);
    expect(counters(game, hydra!)).toBe(loyalty + 2);
    // A +1 loyalty ability: a cost's counter is put on all the same.
    put(game, A, walker, "loyalty", 3);
    expect(counters(game, hydra!)).toBe(loyalty + 5);
    // Not an opponent's, nor another kind.
    put(game, B, spawn(game, "Jace Beleren", B), "loyalty", 2);
    put(game, A, walker, "charge", 2);
    expect(counters(game, hydra!)).toBe(loyalty + 5);
  });

  const returnPlaneswalkersAndHydras = {
    kind: "return-from-graveyard",
    filter: { anyOf: [{ type: "planeswalker" }, { name: "Bioessence Hydra" }] },
    destination: "battlefield",
    count: "all",
  } as const;
  const loyaltyOf = (game: Game, id: ObjectId): number => game.state.objects[id].counters.loyalty ?? 0;

  it("permanents entering together: one trigger, for all the counters they entered with", () => {
    const { game } = table();
    const hydra = spawn(game, "Bioessence Hydra");
    const start = counters(game, hydra);
    const walkers = [toGraveyard(game, "Liliana of the Veil"), toGraveyard(game, "Jace Beleren")];
    game.debugApplyEffect(A, returnPlaneswalkersAndHydras);
    expect(game.state.pendingTriggers.length + game.state.zones.shared.stack.length).toBe(1);
    settle(game);
    const total = walkers.reduce((n, id) => n + loyaltyOf(game, id), 0);
    expect(total).toBeGreaterThan(0);
    expect(counters(game, hydra)).toBe(start + total);
  });

  // The ruling: a planeswalker entering with the Hydra isn't counted as it
  // enters, and does trigger it, whichever the engine happens to move first.
  it.each([
    ["the Hydra first", ["Bioessence Hydra", "Jace Beleren"]],
    ["the planeswalker first", ["Jace Beleren", "Bioessence Hydra"]],
  ])("a planeswalker entering with the Hydra, %s", (_order, cards) => {
    const { game } = table();
    const ids = cards.map((name) => toGraveyard(game, name));
    game.debugApplyEffect(A, returnPlaneswalkersAndHydras);
    settle(game);
    const hydra = ids[cards.indexOf("Bioessence Hydra")];
    const walker = ids[cards.indexOf("Jace Beleren")];
    expect(counters(game, hydra)).toBe(loyaltyOf(game, walker));
  });

  it("Bioessence Hydra: a proliferate over two planeswalkers is one trigger", () => {
    const { game, a } = table();
    const walker = spawn(game, "Liliana of the Veil");
    const other = spawn(game, "Jace Beleren");
    const hydra = spawn(game, "Bioessence Hydra");
    const start = counters(game, hydra);
    a.chooseProliferateFn = () => [ref(walker), ref(other)];
    game.debugApplyEffect(A, { kind: "proliferate" });
    settle(game);
    expect(counters(game, hydra)).toBe(start + 2);
  });
});
