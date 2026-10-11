/**
 * Card batch 48, part a (2026-10-11): ranks 6746–6772. Written on the shared
 * table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  supertypes,
  table,
  toGraveyard,
  toHand,
  toStep,
  types,
  watchTargets,
  zone,
} from "./harness.js";

describe("Crumbling Ashes", () => {
  it("destroys only a creature that has a -1/-1 counter as your upkeep begins", () => {
    const { game, a } = table();
    spawn(game, "Crumbling Ashes");
    const withCounter = spawn(game, "Hill Giant", B);
    game.state.objects[withCounter].counters["-1/-1"] = 1;
    // Mandatory: your own creature is a candidate too (the ruling).
    const mine = spawn(game, "Hill Giant");
    game.state.objects[mine].counters["-1/-1"] = 1;
    const without = spawn(game, "Grizzly Bears", B);
    const seen = watchTargets(a, () => [withCounter]);
    toStep(game, "upkeep");
    settle(game);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([withCounter, mine]));
    expect(seen.offered[0]).not.toContain(without);
    expect(zone(game, withCounter)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, without)).toBe("battlefield");
  });
});

describe("Citadel of Pain", () => {
  it("deals the player whose end step it is damage equal to their untapped lands, counted as it resolves", () => {
    const { game } = table();
    spawn(game, "Citadel of Pain");
    const mine = lands(game, "Plains", 3);
    lands(game, "Forest", 4, B);
    game.state.objects[mine[0]].tapped = true;
    toStep(game, "end");
    settle(game);
    expect(life(game, A)).toBe(18);
    expect(life(game, B)).toBe(20);
  });
});

describe("Summon: G.F. Ifrit", () => {
  it("adds {R} on chapter III as a triggered ability", () => {
    const { game } = table();
    const ifrit = spawn(game, "Summon: G.F. Ifrit");
    game.state.objects[ifrit].counters.lore = 2;
    toStep(game, "precombat-main");
    settle(game);
    const pool = game.state.players[A].manaPool;
    expect(pool).toHaveLength(1);
    expect(pool[0].type).toBe("R");
    expect(zone(game, ifrit)).toBe("battlefield");
  });
});

describe("Blustersquall", () => {
  it("overloaded, taps each creature you don't control and none of yours", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const squall = toHand(game, "Blustersquall");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = [spawn(game, "Grizzly Bears", B), spawn(game, "Hill Giant", B)];
    cast(game, squall, { overload: true });
    expect(theirs.every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(game.state.objects[mine].tapped).toBe(false);
  });
});

describe("Tough Cookie", () => {
  it("turns a noncreature artifact you control into a 4/4 artifact creature that keeps its subtypes", () => {
    const { game } = table();
    const cookie = spawn(game, "Tough Cookie");
    const food = spawn(game, "Food Token");
    lands(game, "Forest", 6);
    activate(game, cookie, 0, { targets: [ref(food)] });
    expect(types(game, food)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, food)).toContain("Food");
    expect(pt(game, food)).toEqual({ power: 4, toughness: 4 });
    // A creature isn't a legal target (there's mana for a second activation).
    expect(() => activate(game, cookie, 0, { targets: [ref(cookie)] })).toThrow();
  });
});

describe("Shaun, Father of Synths", () => {
  it("copies an attacking legendary creature as a non-legendary Synth artifact attacker, and exiles Synths as it leaves", () => {
    const { game, a } = table();
    const shaun = spawn(game, "Shaun, Father of Synths");
    const isamaru = spawn(game, "Isamaru, Hound of Konda"); // legendary 2/2
    pickTargets(a, isamaru);
    pickModes(a, 0);
    attack(game, a, [isamaru]);
    const copies = game.battlefield.filter((id: ObjectId) => game.state.objects[id].isToken);
    expect(copies).toHaveLength(1);
    const copy = copies[0];
    expect(supertypes(game, copy)).not.toContain("legendary");
    expect(types(game, copy)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, copy)).toEqual(expect.arrayContaining(["Dog", "Synth"]));
    // Both the original and the copy connected.
    expect(life(game, B)).toBe(16);

    destroy(game, shaun);
    expect(game.state.objects[copy]?.zone ?? "gone").not.toBe("battlefield");
    expect(zone(game, isamaru)).toBe("battlefield");
  });
});

describe("Adéwalé, Breaker of Chains", () => {
  /** Grizzly Bears made an artifact Vehicle as well (Edward Kenway's test). */
  const vehicle = (game: ReturnType<typeof table>["game"]): ObjectId => {
    const id = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(
      A,
      { kind: "add-types", target: 0, addTypes: ["artifact"], addSubtypes: ["Vehicle"], duration: "permanent" },
      [ref(id)],
    );
    return id;
  };

  it("returns from the graveyard when a Vehicle you control deals combat damage to a player", () => {
    const { game, a } = table();
    const adewale = toGraveyard(game, "Adéwalé, Breaker of Chains");
    const ship = vehicle(game);
    pickModes(a, 0);
    attack(game, a, [ship]);
    expect(zone(game, adewale)).toBe("hand");
  });

  it("doesn't return for a creature that isn't a Vehicle", () => {
    const { game, a } = table();
    const adewale = toGraveyard(game, "Adéwalé, Breaker of Chains");
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    attack(game, a, [bears]);
    expect(zone(game, adewale)).toBe("graveyard");
  });
});
