/**
 * Loyalty lost is loyalty counters removed: damage dealt to a planeswalker
 * removes that many (rule 306.8) and a minus loyalty cost removes them too
 * (606.4), so a `counters-removed` trigger for `"loyalty"` fires on both —
 * once for damage dealt at once, "that much" being how many went (Chandra,
 * Fire Artisan's rulings).
 */
import { describe, expect, it } from "vitest";

import { A, B, attack, cast, lands, life, loyalty, ref, spawn, table, toHand, zone } from "./harness.js";

describe("Chandra, Fire Artisan", () => {
  it("dealt damage, she deals that much to target opponent", () => {
    const { game, b } = table();
    const chandra = spawn(game, "Chandra, Fire Artisan", B);
    lands(game, "Mountain", 1);
    let asked = 0;
    b.chooseTargetsFn = () => {
      asked += 1;
      return [ref(A)];
    };
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(chandra)] });
    expect(asked).toBe(1);
    expect(game.state.objects[chandra].counters.loyalty).toBe(1);
    expect(life(game, A)).toBe(17);
  });

  it("two attackers dealing damage at once remove the counters at once: one trigger, the total", () => {
    const { game, a, b } = table();
    const chandra = spawn(game, "Chandra, Fire Artisan", B);
    game.state.objects[chandra].counters.loyalty = 5;
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    let asked = 0;
    b.chooseTargetsFn = () => {
      asked += 1;
      return [ref(A)];
    };
    attack(game, a, bears, chandra);
    expect(asked).toBe(1);
    expect(game.state.objects[chandra].counters.loyalty).toBe(1);
    expect(life(game, A)).toBe(16);
  });

  it("damage past her loyalty removes only what she had, and she still deals it from the graveyard", () => {
    const { game, a, b } = table();
    const chandra = spawn(game, "Chandra, Fire Artisan", B);
    game.state.objects[chandra].counters.loyalty = 2;
    b.chooseTargetsFn = () => [ref(A)];
    attack(game, a, [spawn(game, "Hill Giant")], chandra);
    expect(zone(game, chandra)).toBe("graveyard");
    expect(life(game, A)).toBe(18);
  });

  it("her −7 removes seven: she deals 7, though it took the last of them", () => {
    const { game, a } = table();
    const chandra = spawn(game, "Chandra, Fire Artisan");
    a.chooseTargetsFn = () => [ref(B)];
    loyalty(game, chandra, -7, { atLeast: 7 });
    expect(zone(game, chandra)).toBe("graveyard");
    expect(life(game, B)).toBe(13);
  });

  it("her +1 puts counters on, and nothing is dealt", () => {
    const { game } = table();
    const chandra = spawn(game, "Chandra, Fire Artisan");
    loyalty(game, chandra, 1);
    expect(game.state.objects[chandra].counters.loyalty).toBe(5);
    expect(life(game, B)).toBe(20);
  });
});
