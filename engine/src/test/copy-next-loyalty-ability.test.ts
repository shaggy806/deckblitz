/**
 * Copying the next loyalty ability a player activates this turn (rule 606.1,
 * a delayed triggered ability, rule 603.7): Jaya's Phoenix's "copy the next
 * loyalty ability you activate this turn when you activate it" (a `whenever`
 * watch, `once`), and Repeated Reverberation's "when you next cast an instant
 * spell, cast a sorcery spell, or activate a loyalty ability this turn, copy
 * that spell or ability twice" (`nextSpell` with `orNextAbility: { loyalty }`).
 */
import { describe, expect, it } from "vitest";

import { A, B, activate, attack, cast, counters, lands, life, loyalty, pickModes, ref, spawn, table, toGraveyard, toHand, toStep, zone } from "./harness.js";

describe("Repeated Reverberation", () => {
  it("copies the next loyalty ability twice, and only that one", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const ajani = spawn(game, "Ajani Goldmane");
    const before = counters(game, ajani, "loyalty");
    cast(game, toHand(game, "Repeated Reverberation"));
    // "+1: You gain 2 life": the ability and two copies.
    loyalty(game, ajani, 1);
    expect(life(game, A)).toBe(26);
    // A copy pays no cost: the loyalty went up once (the ruling).
    expect(counters(game, ajani, "loyalty")).toBe(before + 1);
    // Used up (rule 603.7b): a second planeswalker's ability isn't copied.
    const other = spawn(game, "Ajani Goldmane");
    loyalty(game, other, 1);
    expect(life(game, A)).toBe(28);
  });

  it("isn't fired by an ability that isn't a loyalty ability, and waits", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const oracle = spawn(game, "Oracle of Nectars");
    const ajani = spawn(game, "Ajani Goldmane");
    cast(game, toHand(game, "Repeated Reverberation"));
    // "{X}, {T}: You gain X life" with X = 0: nothing copied, nothing gained.
    activate(game, oracle, 0, { x: 0 });
    expect(game.state.delayedTriggers).toHaveLength(1);
    loyalty(game, ajani, 1);
    expect(life(game, A)).toBe(26);
    expect(game.state.delayedTriggers).toHaveLength(0);
  });

  it("copies the next instant spell twice instead, and then no loyalty ability", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const ajani = spawn(game, "Ajani Goldmane");
    cast(game, toHand(game, "Repeated Reverberation"));
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(11);
    loyalty(game, ajani, 1);
    expect(life(game, A)).toBe(22);
  });

  it("a [−X] ability's copies use the same X", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const chandra = spawn(game, "Chandra, Flamecaller");
    // 2 damage three times kills a 6/6 only with all three.
    const wurm = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Repeated Reverberation"));
    loyalty(game, chandra, "-x", { x: 2 });
    expect(zone(game, wurm)).toBe("graveyard");
  });

  it("lapses at the end of the turn", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Repeated Reverberation"));
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep");
    expect(game.state.delayedTriggers).toHaveLength(0);
  });
});

describe("Jaya's Phoenix", () => {
  it("after it deals combat damage to a player, the next loyalty ability is copied once", () => {
    const { game, a } = table();
    const phoenix = spawn(game, "Jaya's Phoenix");
    const ajani = spawn(game, "Ajani Goldmane");
    attack(game, a, [phoenix]);
    expect(life(game, B)).toBe(17);
    toStep(game, "postcombat-main");
    loyalty(game, ajani, 1);
    expect(life(game, A)).toBe(24);
    // Only the next one: another planeswalker's ability isn't copied.
    const other = spawn(game, "Ajani Goldmane");
    loyalty(game, other, 1);
    expect(life(game, A)).toBe(26);
  });

  it("copies nothing when it dealt no combat damage, nor a loyalty ability on a later turn", () => {
    const { game, a } = table();
    spawn(game, "Jaya's Phoenix");
    const ajani = spawn(game, "Ajani Goldmane");
    loyalty(game, ajani, 1);
    expect(life(game, A)).toBe(22);

    const second = table();
    const phoenix = spawn(second.game, "Jaya's Phoenix");
    const later = spawn(second.game, "Ajani Goldmane");
    attack(second.game, second.a, [phoenix]);
    second.game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main" && s.priority.holder === A);
    loyalty(second.game, later, 1);
    expect(life(second.game, A)).toBe(22);
    void a;
  });

  it("deals combat damage to a planeswalker too", () => {
    const { game, a } = table();
    const phoenix = spawn(game, "Jaya's Phoenix");
    const ajani = spawn(game, "Ajani Goldmane");
    const theirs = spawn(game, "Ajani Goldmane", B);
    attack(game, a, [phoenix], theirs);
    toStep(game, "postcombat-main");
    loyalty(game, ajani, 1);
    expect(life(game, A)).toBe(24);
  });

  it("may return from the graveyard when its owner casts a planeswalker spell", () => {
    const { game, a } = table();
    lands(game, "Plains", 10);
    const phoenix = toGraveyard(game, "Jaya's Phoenix");
    // Declined, it stays; a creature spell doesn't ask.
    pickModes(a);
    cast(game, toHand(game, "Ajani Goldmane"));
    expect(zone(game, phoenix)).toBe("graveyard");
    pickModes(a, 0);
    cast(game, toHand(game, "Ornithopter"));
    expect(zone(game, phoenix)).toBe("graveyard");
    cast(game, toHand(game, "Ajani, Inspiring Leader"));
    expect(zone(game, phoenix)).toBe("battlefield");
  });
});
