/**
 * "If life was paid to activate it, you may pay that much life again"
 * (Verrak, Warped Sengir): the `activates-ability` trigger's
 * `lifePaidToActivate`, and its trigger value, the life the ability's own
 * cost paid — a life cost, or Phyrexian mana paid with life (rules 119.4,
 * 107.4f) — never a mana ability's that helped pay it (605.3a).
 */
import { describe, expect, it } from "vitest";

import { A, activate, hand, lands, life, pickModes, pt, spawn, table } from "./harness.js";

describe("Verrak, Warped Sengir", () => {
  it("copies an ability whose cost paid life, for that much life again", () => {
    const { game, a } = table();
    spawn(game, "Verrak, Warped Sengir");
    const fast = spawn(game, "Arguel's Blood Fast");
    lands(game, "Swamp", 2);
    const before = hand(game).length;
    pickModes(a, 0);
    activate(game, fast);
    // 2 for the ability, 2 more for the copy: two cards drawn.
    expect(life(game)).toBe(20 - 4);
    expect(hand(game)).toHaveLength(before + 2);
  });

  it("declined, nothing is paid or copied", () => {
    const { game, a } = table();
    spawn(game, "Verrak, Warped Sengir");
    const fast = spawn(game, "Arguel's Blood Fast");
    lands(game, "Swamp", 2);
    const before = hand(game).length;
    pickModes(a);
    activate(game, fast);
    expect(life(game)).toBe(18);
    expect(hand(game)).toHaveLength(before + 1);
  });

  it("counts Phyrexian mana paid with life", () => {
    const { game, a } = table();
    spawn(game, "Verrak, Warped Sengir");
    const dragon = spawn(game, "Moltensteel Dragon");
    pickModes(a, 0);
    activate(game, dragon);
    // {R/P} paid with 2 life, and 2 more for the copy: +2/+0.
    expect(life(game)).toBe(16);
    expect(pt(game, dragon).power).toBe(6);
  });

  it("doesn't count the life a mana ability paid to help pay it", () => {
    const { game, a } = table();
    spawn(game, "Verrak, Warped Sengir");
    const fast = spawn(game, "Arguel's Blood Fast");
    lands(game, "Swamp", 1);
    spawn(game, "Mana Confluence");
    pickModes(a, 0);
    activate(game, fast);
    // 1 (Mana Confluence) + 2 (the ability) + 2 again, not 3 again.
    expect(life(game)).toBe(20 - 1 - 2 - 2);
  });

  it("doesn't trigger for an ability that paid no life", () => {
    const { game, a } = table();
    spawn(game, "Verrak, Warped Sengir");
    const pyromancer = spawn(game, "Prodigal Pyromancer");
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    activate(game, pyromancer, 0, { targets: [{ kind: "player", player: A }] });
    expect(asked).toBe(0);
    expect(life(game)).toBe(19);
  });
});
