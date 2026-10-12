/**
 * "When the Nth [kind] counter is put on this" (`counters-put`'s `nth`): the
 * placement that takes that kind from fewer than N to N or more — several put
 * at once past N included — and none after it (Midnight Clock's shape; the
 * Marvel Plans; Shang-Chi and the Ten Rings).
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, counters, enter, graveyard, hand, lands, life, ref, settle, spawn, table, zone } from "./harness.js";

const put = (game: Game, id: ObjectId, counter: string, amount: number): void => {
  game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter, amount }, [ref(id)]);
  settle(game);
};

describe("the Nth counter", () => {
  it("Political Triumph: the fourth creature entering sacrifices it, draws, and grows each creature", () => {
    const { game } = table();
    const triumph = spawn(game, "Political Triumph");
    const handBefore = hand(game).length;
    const bears = [1, 2, 3].map(() => enter(game, "Grizzly Bears"));
    expect(counters(game, triumph, "plan")).toBe(3);
    expect(zone(game, triumph)).toBe("battlefield");
    const fourth = enter(game, "Grizzly Bears");
    expect(zone(game, triumph)).toBe("graveyard");
    expect(hand(game).length).toBe(handBefore + 1);
    for (const id of [...bears, fourth]) expect(counters(game, id)).toBe(1);
  });

  it("several at once past N fire it once; more after don't fire it again", () => {
    const { game } = table();
    const shang = spawn(game, "Shang-Chi and the Ten Rings");
    const lifeBefore = life(game);
    const handBefore = hand(game).length;
    put(game, shang, "+1/+1", 9);
    expect(life(game)).toBe(lifeBefore);
    put(game, shang, "+1/+1", 3);
    expect(life(game)).toBe(lifeBefore + 5);
    expect(hand(game).length).toBe(handBefore + 5);
    put(game, shang, "+1/+1", 1);
    expect(life(game)).toBe(lifeBefore + 5);
  });

  it("other kinds of counter don't count toward it", () => {
    const { game } = table();
    const shang = spawn(game, "Shang-Chi and the Ten Rings");
    const lifeBefore = life(game);
    put(game, shang, "lore", 12);
    expect(life(game)).toBe(lifeBefore);
  });

  it("Claim the Kingdom: the fourth landfall sacrifices it, and when it does, an indestructible counter", () => {
    const { game } = table();
    const claim = spawn(game, "Claim the Kingdom");
    const bears = spawn(game, "Grizzly Bears");
    for (let i = 0; i < 4; i += 1) enter(game, "Forest");
    expect(zone(game, claim)).toBe("graveyard");
    expect(graveyard(game)).toContain(claim);
    expect(counters(game, bears, "indestructible")).toBe(1);
    expect(counters(game, bears)).toBe(4);
  });

  it("Robot Domination: the third plan counter makes three Robot Villains", () => {
    const { game } = table();
    const plan = spawn(game, "Robot Domination");
    lands(game, "Swamp", 1);
    put(game, plan, "plan", 3);
    expect(zone(game, plan)).toBe("graveyard");
    expect(game.battlefield.filter((id) => game.state.objects[id].cardName === "Robot Villain Token").length).toBe(3);
  });
});
