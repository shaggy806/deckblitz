/**
 * Winter's Chill: X capped by the snow lands its caster controls (rule
 * 601.2b, `maxX` over a count), cast only during combat before blockers, and
 * for each target its controller may pay {1} or {2} — nothing paid, it's
 * destroyed at end of combat; {1}, its combat damage is prevented this
 * combat; {2}, neither.
 */
import { describe, expect, it } from "vitest";

import { A, B, cast, lands, life, ref, spawn, table, toHand, zone } from "./harness.js";

/** Bob attacking Alice with two Grizzly Bears on his turn, Alice holding
 * priority in his declare attackers step with Winter's Chill in hand. */
const setUp = (snow: number) => {
  const env = table();
  const { game, b } = env;
  lands(game, "Snow-Covered Island", snow);
  lands(game, "Island", 3, B);
  const bears = [spawn(game, "Grizzly Bears", B), spawn(game, "Grizzly Bears", B)];
  const chill = toHand(game, "Winter's Chill");
  b.declareAttackersFn = () => bears.map((attacker) => ({ attacker, defender: A }));
  game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.turn.number === 2 && s.priority.holder === A);
  return { ...env, bears, chill };
};

const toSecondMain = (game: ReturnType<typeof table>["game"]) =>
  game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.priority.holder === B);

describe("Winter's Chill", () => {
  it("can't be cast outside combat", () => {
    const { game } = table();
    lands(game, "Snow-Covered Island", 2);
    const chill = toHand(game, "Winter's Chill");
    expect(() => cast(game, chill, { x: 0 })).toThrow();
  });

  it("X can't be more than the snow lands you control", () => {
    const { game, bears, chill } = setUp(1);
    // Mana enough for X = 2, but one snow land.
    lands(game, "Island", 3);
    expect(() => cast(game, chill, { x: 2, targets: bears.map((id) => ref(id)) })).toThrow(/X/);
    expect(zone(game, chill)).toBe("hand");
    cast(game, chill, { x: 1, targets: [ref(bears[0]!)] });
    expect(zone(game, chill)).toBe("graveyard");
  });

  it("nothing paid: destroyed at end of combat; {1}: its combat damage prevented; neither leaves combat", () => {
    const { game, b, bears, chill } = setUp(3);
    // The first Bears: decline. The second: {1}, then not the second {1}.
    const answers: number[][] = [[], [0], []];
    b.chooseModesFn = () => answers.shift() ?? [];
    cast(game, chill, { x: 2, targets: bears.map((id) => ref(id)) });
    toSecondMain(game);
    expect(zone(game, bears[0]!)).toBe("graveyard");
    expect(zone(game, bears[1]!)).toBe("battlefield");
    // Only the first Bears' damage got through, before it was destroyed.
    expect(life(game, A)).toBe(18);
    expect(answers).toEqual([]);
  });

  it("{2} paid: it deals its damage and survives", () => {
    const { game, b, bears, chill } = setUp(3);
    b.chooseModesFn = () => [0];
    cast(game, chill, { x: 1, targets: [ref(bears[0]!)] });
    toSecondMain(game);
    expect(zone(game, bears[0]!)).toBe("battlefield");
    expect(life(game, A)).toBe(16);
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].controller === B && game.state.objects[id].tapped)).toHaveLength(
      2 + 2,
    );
  });
});
