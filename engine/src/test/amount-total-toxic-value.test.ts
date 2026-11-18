/**
 * The `{ toxicOf }` amount: a creature's total toxic value (rule 702.164b),
 * every toxic ability it has summed, printed and granted — Goliath Hatchery's
 * "choose a creature you control, then draw cards equal to its total toxic
 * value", the creature chosen as the corrupted ability resolves.
 */
import { describe, expect, it } from "vitest";

import { A, B, enter, hand, named, pickPermanents, ref, settle, spawn, table, toStep, tokensNamed } from "./harness.js";
import { computeCharacteristics } from "../characteristics.js";

const BEAST = "Phyrexian Beast Token";

describe("Goliath Hatchery", () => {
  it("makes two 3/3 Phyrexian Beasts with toxic 1", () => {
    const { game } = table();
    enter(game, "Goliath Hatchery");
    expect(tokensNamed(game, BEAST, A)).toBe(2);
    const [beast] = named(game, BEAST, A);
    expect(computeCharacteristics(game.state, game.registry, beast).toxic).toBe(1);
  });

  it("with an opponent at three poison, draws the chosen creature's total toxic value — granted toxic added", () => {
    const { game, a } = table();
    enter(game, "Goliath Hatchery");
    const [beast] = named(game, BEAST, A);
    // Toxic 1 printed on the token, toxic 2 more granted: 3 (the ruling's example).
    game.debugApplyEffect(A, { kind: "grant-toxic", target: 0, amount: 2, duration: "permanent" }, [ref(beast)]);
    const [granted] = named(game, BEAST, A).filter(
      (id) => computeCharacteristics(game.state, game.registry, id).toxic === 3,
    );
    expect(granted).toBeDefined();
    game.state.players[B].counters.poison = 3;
    const seen = pickPermanents(a, granted);
    const cards = hand(game).length;
    toStep(game, "precombat-main");
    // The draw step's card, and three.
    expect(hand(game).length).toBe(cards + 1 + 3);
    expect(seen.offered.length).toBeGreaterThanOrEqual(2);
  });

  it("a creature without toxic is a choice too, and draws nothing", () => {
    const { game, a } = table();
    enter(game, "Goliath Hatchery");
    const bears = spawn(game, "Grizzly Bears");
    game.state.players[B].counters.poison = 3;
    pickPermanents(a, bears);
    const cards = hand(game).length;
    toStep(game, "precombat-main");
    expect(hand(game).length).toBe(cards + 1);
  });

  it("does nothing while no opponent has three poison counters", () => {
    const { game, a } = table();
    enter(game, "Goliath Hatchery");
    const [beast] = named(game, BEAST, A);
    game.state.players[B].counters.poison = 2;
    pickPermanents(a, beast);
    const cards = hand(game).length;
    toStep(game, "precombat-main");
    expect(hand(game).length).toBe(cards + 1);
  });

  it("reads the total toxic value of one that has left as it last existed", () => {
    const { game, a } = table();
    const [beast] = (enter(game, "Goliath Hatchery"), named(game, BEAST, A));
    game.debugApplyEffect(A, { kind: "grant-toxic", target: 0, amount: 1, duration: "permanent" }, [ref(beast)]);
    const [two] = named(game, BEAST, A).filter((id) => computeCharacteristics(game.state, game.registry, id).toxic === 2);
    const cards = hand(game).length;
    // Exile the chosen one, then draw cards equal to its toxic value: the
    // granted toxic ended as it left, but it last existed with 2.
    pickPermanents(a, two);
    game.debugApplyEffect(A, {
      kind: "choose-permanents",
      filter: { type: "creature", controlledBy: "you" },
      min: 1,
      upTo: 1,
      then: { kind: "sequence", effects: [{ kind: "exile", target: 0 }, { kind: "draw", amount: { toxicOf: 0 } }] },
      prompt: "Choose a creature",
    });
    settle(game);
    expect(hand(game).length).toBe(cards + 2);
  });
});
