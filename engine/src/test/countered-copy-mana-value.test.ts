/**
 * A copy of a spell that leaves the stack ceases to exist (rule 707.10a), but
 * what still names it reads its last-known information (608.2h): a cast
 * trigger's "that spell's mana value" for a copy countered or exiled in
 * response (the need key `bug:mana-value-of-countered-copy`) — Deekah,
 * Fractal Theorist. It read 0 before: the copy was deleted with nothing kept.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, cast, counters, keywords, lands, life, named, pickModes, pickTargets, ref, settle, spawn, table, toHand } from "./harness.js";

const fractals = (game: Game): ObjectId[] => named(game, "Fractal Token", A);

/** Alice casts Fireball for X=3 (mana value 4) at bob and copies it; the
 * copy is then dealt with by `rid`, before anything resolves. */
const copyThenRid = (rid: (game: Game, copy: ObjectId) => void): { game: Game } => {
  const { game, a } = table();
  pickTargets(a, B);
  pickModes(a);
  spawn(game, "Deekah, Fractal Theorist");
  lands(game, "Mountain", 4);
  const fireball = toHand(game, "Fireball");
  cast(game, fireball, { targets: [ref(B)], x: 3, settle: false });
  game.debugApplyEffect(A, { kind: "copy-spell", target: 0 }, [ref(fireball)]);
  const copy = game.state.zones.shared.stack.find((id) => game.state.objects[id]?.isCopy === true);
  expect(copy).toBeDefined();
  rid(game, copy!);
  expect(game.state.objects[copy!]).toBeUndefined();
  settle(game);
  return { game };
};

describe("Deekah, Fractal Theorist", () => {
  it("a cast spell's Fractal gets counters equal to its mana value, X included", () => {
    const { game } = table();
    spawn(game, "Deekah, Fractal Theorist");
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Fireball"), { targets: [ref(B)], x: 3 });
    const [fractal] = fractals(game);
    expect(fractal).toBeDefined();
    expect(counters(game, fractal)).toBe(4);
    expect(life(game, B)).toBe(17);
  });

  it("a copy countered in response is read as it last was on the stack (608.2h, 707.10a)", () => {
    const { game } = copyThenRid((g, copy) => g.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(copy)]));
    const made = fractals(game);
    expect(made).toHaveLength(2);
    for (const fractal of made) expect(counters(game, fractal)).toBe(4);
    // Only the original dealt damage.
    expect(life(game, B)).toBe(17);
  });

  it("a copy exiled in response is read the same way", () => {
    const { game } = copyThenRid((g, copy) => g.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(copy)]));
    const made = fractals(game);
    expect(made).toHaveLength(2);
    for (const fractal of made) expect(counters(game, fractal)).toBe(4);
  });

  it("{3}{U}: target creature token can't be blocked this turn — tokens only", () => {
    const { game } = table();
    const deekah = spawn(game, "Deekah, Fractal Theorist");
    lands(game, "Island", 8);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    const [fractal] = fractals(game);
    expect(counters(game, fractal)).toBe(1);
    expect(() => activate(game, deekah, 0, { targets: [ref(deekah)] })).toThrow(/target/i);
    activate(game, deekah, 0, { targets: [ref(fractal)] });
    expect(keywords(game, fractal).has("unblockable")).toBe(true);
  });
});
