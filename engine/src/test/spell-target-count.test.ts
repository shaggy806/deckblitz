/**
 * "Whenever you cast a spell that targets one or more creatures or Vehicles
 * you control, put **that many** +1/+1 counters on Arcee" — a cast trigger's
 * `countMatchingTargets`: `{ triggerValue: true }` is how many different
 * permanents among the spell's targets meet the trigger's `filter.targets`,
 * read as it's cast. Arcee, Sharpshooter // Arcee, Acrobatic Coupe: the back
 * face counts, the front spends the counters ("remove one or more", X ≥ 1)
 * and each converts.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, activate, B, cast, counters, destroy, lands, ref, spawn, table, toHand, zone } from "./harness.js";

const FRONT = "Arcee, Sharpshooter";
const BACK = "Arcee, Acrobatic Coupe";

const faceName = (game: Game, id: ObjectId): string => {
  const object = game.state.objects[id];
  return object.faces?.[object.face ?? 0] ?? object.cardName;
};

/** Arcee cast converted for {R}{W}: its back face on the battlefield. */
function coupe(game: Game): ObjectId {
  lands(game, "Mountain", 1);
  lands(game, "Plains", 1);
  const arcee = toHand(game, FRONT);
  cast(game, arcee, { via: "more-than-meets-the-eye", face: 1 });
  expect(faceName(game, arcee)).toBe(BACK);
  return arcee;
}

/** Seeds of Strength ready to cast: three creature targets. */
function seeds(game: Game): ObjectId {
  lands(game, "Forest", 1);
  lands(game, "Plains", 1);
  return toHand(game, "Seeds of Strength");
}

describe("Arcee, Acrobatic Coupe: that many +1/+1 counters, the spell's targets you control", () => {
  it("counts each different creature or Vehicle you control once, an opponent's not at all, then converts", () => {
    const { game } = table();
    const arcee = coupe(game);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    // Bears twice, Arcee (a creature and a Vehicle on your turn) once, bob's bears once: 2.
    cast(game, seeds(game), { targets: [ref(bears), ref(arcee), ref(theirs)] });
    expect(counters(game, arcee)).toBe(2);
    expect(faceName(game, arcee)).toBe(FRONT);
  });

  it("a spell targeting only an opponent's creature doesn't trigger", () => {
    const { game } = table();
    const arcee = coupe(game);
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(theirs)] });
    expect(counters(game, arcee)).toBe(0);
    expect(faceName(game, arcee)).toBe(BACK);
  });

  it("the count is fixed as the spell is cast: a target gone before the trigger resolves still counts", () => {
    const { game } = table();
    const arcee = coupe(game);
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    cast(game, seeds(game), { targets: [ref(bears), ref(elves), ref(elves)], settle: false });
    destroy(game, bears);
    expect(zone(game, bears)).toBe("graveyard");
    expect(counters(game, arcee)).toBe(2);
  });
});

describe("Arcee, Sharpshooter: remove one or more +1/+1 counters, that much damage, convert", () => {
  it("removes X counters for X damage to a target creature and converts back to the Vehicle", () => {
    const { game } = table();
    const arcee = coupe(game);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, seeds(game), { targets: [ref(bears), ref(arcee), ref(arcee)] });
    expect(counters(game, arcee)).toBe(2);
    expect(faceName(game, arcee)).toBe(FRONT);

    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Mountain", 1);
    activate(game, arcee, 0, { x: 2, targets: [ref(giant)] });
    expect(counters(game, arcee)).toBe(0);
    expect(game.state.objects[giant].damageMarked).toBe(2);
    expect(faceName(game, arcee)).toBe(BACK);
  });

  it("can't remove zero counters", () => {
    const { game } = table();
    const arcee = spawn(game, FRONT);
    lands(game, "Mountain", 1);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(arcee)]);
    const giant = spawn(game, "Hill Giant", B);
    const shoot = (x: number): string | null =>
      game.canDispatch({ type: "activate-ability", player: A, source: arcee, abilityIndex: 0, targets: [ref(giant)], xValue: x });
    expect(shoot(0)).not.toBeNull();
    expect(shoot(1)).toBeNull();
  });
});
