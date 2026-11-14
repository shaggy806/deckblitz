/**
 * "For each kind of counter on [this], each other Dinosaur you control enters
 * with a counter of that kind on it" — `others-enter-battlefield`'s
 * `counterKindsOfSource` (Blue, Loyal Raptor): one counter of each kind on
 * the source as the other permanent enters.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, counters, enter, keywords, lands, pickModes, pickTargets, spawn, table, toHand } from "./harness.js";

const put = (game: Game, id: ObjectId, counter: string, amount: number): void =>
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter, amount }, [{ kind: "object", object: id }]);

describe("Blue, Loyal Raptor", () => {
  it("each other Dinosaur you control enters with one counter of each kind on Blue", () => {
    const { game } = table();
    const blue = spawn(game, "Blue, Loyal Raptor");
    put(game, blue, "+1/+1", 2);
    put(game, blue, "flying", 1);
    lands(game, "Forest", 5);
    const giganto = toHand(game, "Gigantosaurus");
    cast(game, giganto);
    expect(counters(game, giganto)).toBe(1);
    expect(counters(game, giganto, "flying")).toBe(1);
    expect(keywords(game, giganto).has("flying")).toBe(true);
    // Blue itself is untouched.
    expect(counters(game, blue)).toBe(2);
  });

  it("not a non-Dinosaur, not an opponent's Dinosaur, and nothing while Blue has no counters", () => {
    const { game } = table();
    const blue = spawn(game, "Blue, Loyal Raptor");
    const bare = enter(game, "Colossal Dreadmaw");
    expect(Object.values(game.state.objects[bare].counters).filter((n) => n > 0)).toHaveLength(0);
    put(game, blue, "+1/+1", 1);
    const bears = enter(game, "Grizzly Bears");
    expect(counters(game, bears)).toBe(0);
    const theirs = enter(game, "Colossal Dreadmaw", B);
    expect(counters(game, theirs)).toBe(0);
    const mine = enter(game, "Colossal Dreadmaw");
    expect(counters(game, mine)).toBe(1);
  });

  it("with Owen Grady: a haste counter on Blue, and the next Dinosaur enters with haste", () => {
    const { game, a } = table();
    const blue = spawn(game, "Blue, Loyal Raptor");
    const owen = spawn(game, "Owen Grady, Raptor Trainer");
    pickModes(a, 3);
    pickTargets(a, blue);
    activate(game, owen, 0, { targets: [{ kind: "object", object: blue }] });
    expect(counters(game, blue, "haste")).toBe(1);
    const dreadmaw = enter(game, "Colossal Dreadmaw");
    expect(counters(game, dreadmaw, "haste")).toBe(1);
    expect(keywords(game, dreadmaw).has("haste")).toBe(true);
  });
});
