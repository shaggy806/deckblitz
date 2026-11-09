/**
 * "Becomes crewed for the first time each turn": the timing wrapper counts
 * the generic `becomes-crewed` trigger from the journal (rule 702.122c,
 * Mighty Servant of Leuk-o and Mindlink Mech).
 */

import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, attack, hand, pickTargets, pt, ref, settle, spawn, subtypes, table, types } from "./harness.js";

const crew = (game: Game, vehicle: ObjectId, ...creatures: ObjectId[]): void => {
  const action: Action = { type: "activate-ability", player: A, source: vehicle, abilityIndex: 0, targets: [], tap: creatures };
  game.dispatch(action);
  settle(game);
};

const ready = (game: Game, name: string): ObjectId => {
  const id = spawn(game, name, A);
  game.state.objects[id].summoningSick = false;
  return id;
};

describe("Mighty Servant of Leuk-o", () => {
  it("crewed by exactly two creatures the first time: it draws two on combat damage", () => {
    const { game, a } = table();
    const servant = ready(game, "Mighty Servant of Leuk-o");
    crew(game, servant, ready(game, "Hill Giant"), ready(game, "Hill Giant"));
    const before = hand(game, A).length;
    attack(game, a, [servant]);
    expect(hand(game, A).length).toBe(before + 2);
  });

  it("crewed by three first: no trigger, and a later crew by two isn't the first time", () => {
    const { game, a } = table();
    const servant = ready(game, "Mighty Servant of Leuk-o");
    crew(game, servant, ready(game, "Hill Giant"), ready(game, "Hill Giant"), ready(game, "Hill Giant"));
    crew(game, servant, ready(game, "Hill Giant"), ready(game, "Hill Giant"));
    const before = hand(game, A).length;
    attack(game, a, [servant]);
    expect(hand(game, A).length).toBe(before);
  });
});

describe("Mindlink Mech", () => {
  it("becomes a copy of the nonlegendary creature that crewed it, 4/3 Vehicle artifact with flying", () => {
    const { game, a } = table();
    const mech = ready(game, "Mindlink Mech");
    const bears = ready(game, "Grizzly Bears");
    pickTargets(a, bears);
    crew(game, mech, bears);
    expect(game.state.objects[mech].copyOf).toBe("Grizzly Bears");
    expect(pt(game, mech)).toEqual({ power: 4, toughness: 3 });
    expect(types(game, mech)).toContain("artifact");
    expect(subtypes(game, mech)).toContain("Vehicle");
  });

  it("copying a creature that's normally not one: no 4/3, the crew effect's 0/0 dies (its ruling)", () => {
    const { game, a } = table();
    const mech = ready(game, "Mindlink Mech");
    const sword = spawn(game, "Bonesplitter", A);
    game.debugApplyEffect(A, { kind: "become", target: 0, addTypes: ["creature"], power: 2, toughness: 2, duration: "end-of-turn" }, [ref(sword)]);
    settle(game);
    game.state.objects[sword].summoningSick = false;
    pickTargets(a, sword);
    crew(game, mech, sword);
    expect(game.state.objects[mech].zone).toBe("graveyard");
  });
});
