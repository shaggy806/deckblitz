/**
 * `exile` of a set of several (`{ paid: "sacrificed" }`): every member still
 * where the set found it, all at once — the cards a cost put into a
 * graveyard, which the effect can find (rule 400.7j). Sword of the Ages:
 * "Sacrifice this artifact and any number of creatures you control: … deals X
 * damage …, where X is the total power of the creatures sacrificed this way,
 * then exile this artifact and those creature cards."
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import { A, B, activate, enter, life, ref, settle, spawn, table, toGraveyard, zone } from "./harness.js";

function tokens(game: Game, name: string, n: number): ObjectId[] {
  const before = new Set(game.state.zones.shared.battlefield);
  game.debugApplyEffect(A, { kind: "create-token", token: name, count: n });
  return game.state.zones.shared.battlefield.filter((id) => !before.has(id));
}

describe("Sword of the Ages", () => {
  it("deals the sacrificed creatures' total power, then exiles itself and those cards", () => {
    const { game } = table();
    const sword = spawn(game, "Sword of the Ages");
    game.state.objects[sword].tapped = false;
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const elves = spawn(game, "Llanowar Elves");
    const [horror] = tokens(game, "Eldrazi Horror Token", 1);
    const other = toGraveyard(game, "Craw Wurm");
    const before = life(game, B);

    game.dispatch({ type: "activate-ability", player: A, source: sword, abilityIndex: 0, targets: [ref(B)], xValue: 3 } as Action);
    expect(game.state.awaiting).toMatchObject({ kind: "sacrifice", count: 3 });
    game.dispatch({ type: "sacrifice", player: A, permanents: [bears, giant, horror] });
    settle(game);

    // 2 + 3 + 3: the token's power counts, though it ceased to exist.
    expect(life(game, B)).toBe(before - 8);
    expect([sword, bears, giant].map((id) => zone(game, id))).toEqual(["exile", "exile", "exile"]);
    expect(zone(game, elves)).toBe("battlefield");
    expect(zone(game, other)).toBe("graveyard");
  });

  it("with no creatures, it deals 0 and exiles itself alone", () => {
    const { game } = table();
    const sword = spawn(game, "Sword of the Ages");
    game.state.objects[sword].tapped = false;
    const before = life(game, B);

    activate(game, sword, 0, { x: 0, targets: [ref(B)] });

    expect(life(game, B)).toBe(before);
    expect(zone(game, sword)).toBe("exile");
  });

  it("enters tapped", () => {
    const { game } = table();
    const sword = enter(game, "Sword of the Ages");
    expect(game.state.objects[sword].tapped).toBe(true);
  });
});
