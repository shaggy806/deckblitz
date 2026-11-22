/**
 * B338 (decisions lane, agent n): Channel Harm — "If damage is prevented this
 * way, **you may** have Channel Harm deal that much damage to target
 * creature" (need key decision:may-in-prevention-followup). A prevention
 * shield's additional effect (rule 615.5) with a `may` in it: the question is
 * asked as the damage is prevented, and the damage is dealt only on a yes.
 */

import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import { A, B, attack, cast, life, lands, pickModes, ref, settle, spawn, table, toHand, zone } from "./harness.js";

const hit = (game: Game, source: ObjectId, to: TargetRef, amount: number): void => {
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount, target: 0 }, [to], { source });
  settle(game);
};
const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

describe("Channel Harm", () => {
  it("prevents an opponent's source's damage to you and, on a yes, deals that much to its target", () => {
    const { game, a } = table();
    lands(game, "Plains", 6);
    const giant = spawn(game, "Hill Giant", B);
    const target = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Channel Harm"), { targets: [ref(target)] });
    pickModes(a, 0);
    hit(game, giant, ref(A), 3);
    expect(life(game, A)).toBe(20);
    expect(damage(game, target)).toBe(3);
    expect(damage(game, giant)).toBe(0);
  });

  it("on a no, prevents the damage and deals none", () => {
    const { game, a } = table();
    lands(game, "Plains", 6);
    const giant = spawn(game, "Hill Giant", B);
    const target = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Channel Harm"), { targets: [ref(target)] });
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [];
    };
    hit(game, giant, ref(A), 3);
    expect(asked).toBe(1);
    expect(life(game, A)).toBe(20);
    expect(damage(game, target)).toBe(0);
  });

  it("asks as the damage is prevented, before the rest of the spell that dealt it (rule 615.5)", () => {
    const { game, a } = table();
    lands(game, "Plains", 6);
    const giant = spawn(game, "Hill Giant", B);
    const target = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Channel Harm"), { targets: [ref(target)] });
    let bobLifeWhenAsked = 0;
    a.chooseModesFn = () => {
      bobLifeWhenAsked = life(game, B);
      return [0];
    };
    game.debugApplyEffect(
      B,
      { kind: "sequence", effects: [{ kind: "damage", amount: 3, target: 0 }, { kind: "gain-life", amount: 5 }] },
      [ref(A)],
      { source: giant },
    );
    settle(game);
    expect(bobLifeWhenAsked).toBe(20);
    expect(life(game, B)).toBe(25);
    expect(damage(game, target)).toBe(3);
  });

  it("covers your permanents too, but not your own sources' damage", () => {
    const { game, a } = table();
    lands(game, "Plains", 6);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears");
    const mine = spawn(game, "Hill Giant");
    const target = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Channel Harm"), { targets: [ref(target)] });
    pickModes(a, 0);
    hit(game, giant, ref(bears), 2);
    expect(zone(game, bears)).toBe("battlefield");
    expect(damage(game, target)).toBe(2);
    hit(game, mine, ref(A), 3);
    expect(life(game, A)).toBe(17);
    expect(damage(game, target)).toBe(2);
  });

  it("asks once for one event's combat damage, all of it dealt together", () => {
    const { game, a, b } = table();
    lands(game, "Plains", 6);
    // Alice's two 1/1s attack into Bob's blockers, whose 3 and 2 damage is
    // prevented: one combat damage event.
    const elf = spawn(game, "Llanowar Elves");
    const goblin = spawn(game, "Raging Goblin");
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const target = spawn(game, "Craw Wurm", B);
    cast(game, toHand(game, "Channel Harm"), { targets: [ref(target)] });
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    b.declareBlockersFn = () => [
      { blocker: giant, attacker: elf },
      { blocker: bears, attacker: goblin },
    ];
    attack(game, a, [elf, goblin]);
    expect(zone(game, elf)).toBe("battlefield");
    expect(zone(game, goblin)).toBe("battlefield");
    expect(asked).toBe(1);
    // 5 damage from the spell at once: the 6/4 Craw Wurm dies.
    expect(zone(game, target)).toBe("graveyard");
  });
});
