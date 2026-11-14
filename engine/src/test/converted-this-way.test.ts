/**
 * "You may convert Ratchet. When you do, …" (rule 603.12): the reflexive
 * ability needs the convert to have happened — the `this-way` `"transformed"`
 * record, empty when rule 701.28e stops a second convert by an ability that
 * went on the stack before the first (Ratchet, Field Medic's ruling). And the
 * back face's batched, once-a-turn "put into a graveyard from the battlefield".
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, pickModes, settle, spawn, table, toGraveyard, zone } from "./harness.js";

const FRONT = "Ratchet, Field Medic";
const BACK = "Ratchet, Rescue Racer";

const faceName = (game: Game, id: ObjectId): string => {
  const object = game.state.objects[id];
  return object.faces?.[object.face ?? 0] ?? object.cardName;
};

const gain = (game: Game, amount: number): void => game.debugApplyEffect(A, { kind: "gain-life", amount });

describe("Ratchet, Field Medic — converted this way", () => {
  it("converts and returns an artifact card no bigger than the life gained this turn, tapped", () => {
    const { game, a } = table();
    const ratchet = spawn(game, FRONT);
    const signet = toGraveyard(game, "Mind Stone");
    const ring = toGraveyard(game, "Sol Ring");
    pickModes(a, 0);
    gain(game, 1);
    settle(game);
    expect(faceName(game, ratchet)).toBe(BACK);
    // Mind Stone's mana value is 2: more than the 1 life gained, so the lone
    // legal target is Sol Ring.
    expect(zone(game, signet)).toBe("graveyard");
    expect(zone(game, ring)).toBe("battlefield");
    expect(game.state.objects[ring].tapped).toBe(true);
  });

  it("converts with nothing to return when no artifact card is small enough", () => {
    const { game, a } = table();
    const ratchet = spawn(game, FRONT);
    const stone = toGraveyard(game, "Mind Stone");
    pickModes(a, 0);
    gain(game, 1);
    settle(game);
    expect(faceName(game, ratchet)).toBe(BACK);
    expect(zone(game, stone)).toBe("graveyard");
  });

  it("declined, neither converts nor returns anything", () => {
    const { game, a } = table();
    const ratchet = spawn(game, FRONT);
    const ring = toGraveyard(game, "Sol Ring");
    pickModes(a);
    gain(game, 3);
    settle(game);
    expect(faceName(game, ratchet)).toBe(FRONT);
    expect(zone(game, ring)).toBe("graveyard");
  });

  it("converts once for two gains at once; the second trigger returns nothing (rule 701.28e)", () => {
    const { game, a } = table();
    const ratchet = spawn(game, FRONT);
    const ring = toGraveyard(game, "Sol Ring");
    const stone = toGraveyard(game, "Mind Stone");
    pickModes(a, 0);
    let reflexive = 0;
    a.chooseTargetsFn = () => {
      reflexive += 1;
      return [{ kind: "object", object: ring }];
    };
    gain(game, 2);
    gain(game, 2);
    settle(game);
    expect(reflexive).toBe(1);
    expect(faceName(game, ratchet)).toBe(BACK);
    expect(zone(game, ring)).toBe("battlefield");
    expect(zone(game, stone)).toBe("graveyard");
  });
});

describe("Ratchet, Rescue Racer — nontoken artifacts to a graveyard, once each turn", () => {
  // Living metal: on alice's turn the back face is a creature, so a
  // noncreature-artifact wrath spares it.
  it("converts back when a nontoken artifact goes, but not a token, and only once a turn", () => {
    const { game } = table();
    const ratchet = spawn(game, FRONT);
    const toBack = (): void => {
      game.debugApplyEffect(A, { kind: "transform", target: "source" }, [], { source: ratchet });
      settle(game);
    };
    toBack();
    expect(faceName(game, ratchet)).toBe(BACK);
    // A token artifact doesn't count.
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 });
    const treasure = Object.values(game.state.objects).find((o) => o.zone === "battlefield" && o.isToken === true);
    expect(treasure).toBeDefined();
    game.debugMove(treasure!.id, "graveyard");
    settle(game);
    expect(faceName(game, ratchet)).toBe(BACK);
    // Two nontoken artifacts at once: one trigger, one convert.
    const ring = spawn(game, "Sol Ring");
    const stone = spawn(game, "Mind Stone");
    game.debugApplyEffect(A, { kind: "destroy-all", filter: { type: "artifact", notTypes: ["creature"] } });
    settle(game);
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, stone)).toBe("graveyard");
    expect(faceName(game, ratchet)).toBe(FRONT);
    // Back again, the same turn: it has already triggered this turn.
    toBack();
    const other = spawn(game, "Sol Ring");
    game.debugMove(other, "graveyard");
    settle(game);
    expect(faceName(game, ratchet)).toBe(BACK);
  });
});
