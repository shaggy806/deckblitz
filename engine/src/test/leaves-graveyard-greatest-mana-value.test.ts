/**
 * The batched `leaves-graveyard` trigger's `batchValue: "greatest-mana-value"`
 * — Amzu, Swarm's Hunger's "whenever one or more cards leave your graveyard,
 * you may create a 1/1 black and green Insect creature token, then put a
 * number of +1/+1 counters on it equal to the greatest mana value among those
 * cards. Do this only once each turn."
 *
 * The value is read from each card as it was in the graveyard (rule 603.10a)
 * and fixed as the ability triggers, so cards now in a hand or shuffled into
 * a library still count.
 */

import { describe, expect, it } from "vitest";

import {
  A,
  B,
  counters,
  keywords,
  named,
  nextTurn,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
} from "./harness.js";

const AMZU = "Amzu, Swarm's Hunger";
const INSECT = "Insect Token (Black-Green)";

describe("Amzu, Swarm's Hunger — the greatest mana value among the cards that left", () => {
  it("cards leaving together trigger once, the token getting the greatest mana value", () => {
    const { game, a } = table();
    spawn(game, AMZU);
    pickModes(a, 0);
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "Serra Angel");
    toGraveyard(game, "Forest");
    game.debugApplyEffect(A, { kind: "exile-graveyard", target: "you" });
    settle(game);
    const tokens = named(game, INSECT, A);
    expect(tokens).toHaveLength(1);
    expect(counters(game, tokens[0])).toBe(5);
    expect(pt(game, tokens[0])).toEqual({ power: 6, toughness: 6 });
  });

  it("a card returned to its owner's hand still counts as it was in the graveyard", () => {
    const { game, a } = table();
    spawn(game, AMZU);
    pickModes(a, 0);
    const giant = toGraveyard(game, "Hill Giant");
    game.debugApplyEffect(A, { kind: "return-to-hand", target: 0, from: "graveyard" }, [ref(giant)]);
    settle(game);
    expect(game.state.objects[giant].zone).toBe("hand");
    const [token] = named(game, INSECT, A);
    expect(counters(game, token)).toBe(4);
  });

  it("only lands left: a 1/1 with no counters", () => {
    const { game, a } = table();
    spawn(game, AMZU);
    pickModes(a, 0);
    toGraveyard(game, "Forest");
    game.debugApplyEffect(A, { kind: "exile-graveyard", target: "you" });
    settle(game);
    const [token] = named(game, INSECT, A);
    expect(counters(game, token)).toBe(0);
    expect(pt(game, token)).toEqual({ power: 1, toughness: 1 });
  });

  it("does it only once each turn, and again the next turn", () => {
    const { game, a } = table();
    spawn(game, AMZU);
    pickModes(a, 0);
    toGraveyard(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "exile-graveyard", target: "you" });
    settle(game);
    toGraveyard(game, "Serra Angel");
    game.debugApplyEffect(A, { kind: "exile-graveyard", target: "you" });
    settle(game);
    expect(named(game, INSECT, A)).toHaveLength(1);
    nextTurn(game);
    nextTurn(game);
    toGraveyard(game, "Serra Angel");
    game.debugApplyEffect(A, { kind: "exile-graveyard", target: "you" });
    settle(game);
    const tokens = named(game, INSECT, A);
    expect(tokens).toHaveLength(2);
    expect(counters(game, tokens[1])).toBe(5);
  });

  it("a declined one doesn't use up the turn", () => {
    const { game, a } = table();
    spawn(game, AMZU);
    pickModes(a);
    toGraveyard(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "exile-graveyard", target: "you" });
    settle(game);
    expect(named(game, INSECT, A)).toHaveLength(0);
    pickModes(a, 0);
    toGraveyard(game, "Serra Angel");
    game.debugApplyEffect(A, { kind: "exile-graveyard", target: "you" });
    settle(game);
    const [token] = named(game, INSECT, A);
    expect(counters(game, token)).toBe(5);
  });

  it("an opponent's graveyard doesn't trigger it", () => {
    const { game, a } = table();
    spawn(game, AMZU);
    pickModes(a, 0);
    toGraveyard(game, "Serra Angel", B);
    game.debugApplyEffect(B, { kind: "exile-graveyard", target: "you" });
    settle(game);
    expect(named(game, INSECT)).toHaveLength(0);
  });

  it("other Insects you control have menace; Amzu has flying and menace", () => {
    const { game } = table();
    const amzu = spawn(game, AMZU);
    const bug = spawn(game, INSECT);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, INSECT, B);
    expect(keywords(game, amzu).has("flying")).toBe(true);
    expect(keywords(game, amzu).has("menace")).toBe(true);
    expect(keywords(game, bug).has("menace")).toBe(true);
    expect(keywords(game, bears).has("menace")).toBe(false);
    expect(keywords(game, theirs).has("menace")).toBe(false);
  });
});
