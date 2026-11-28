/**
 * "As this creature enters or is turned face up, it becomes your choice of
 * 5/1 or 1/5" (Aquamorph Entity): `BecomesOnEnter.orTurnedFaceUp` asks the
 * form again as it's turned face up, before it turns (rule 708.8; the ruling:
 * it never is the 0/0 between), the form a copiable value (707.2); a Vesuvan
 * Shapeshifter turned up as a copy of one chooses as well (708.11, the
 * ruling).
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { nameOf } from "../state.js";
import { A, cast, lands, pt, settle, table, toHand, zone } from "./harness.js";

const turnUp = (game: Game, id: ObjectId): void => {
  game.dispatch({ type: "turn-face-up", player: A, permanent: id, morph: true } as Action);
  settle(game);
};

describe("Aquamorph Entity", () => {
  it("cast face up, it enters as the form chosen", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const entity = toHand(game, "Aquamorph Entity");
    a.chooseCreatureTypeFn = (_view, _source, options) => options[1];
    cast(game, entity);
    expect(pt(game, entity)).toEqual({ power: 1, toughness: 5 });
  });

  it("cast face down, it's asked nothing as it enters, and turned face up it's the form chosen then", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    const entity = toHand(game, "Aquamorph Entity");
    const asked: (readonly string[])[] = [];
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      asked.push(options);
      return options[0];
    };
    cast(game, entity, { via: "face-down", settle: true });
    expect(asked).toEqual([]);
    expect(pt(game, entity)).toEqual({ power: 2, toughness: 2 });
    turnUp(game, entity);
    expect(asked).toEqual([["5/1", "1/5"]]);
    expect(game.state.objects[entity].faceDown).toBeUndefined();
    expect(zone(game, entity)).toBe("battlefield");
    expect(pt(game, entity)).toEqual({ power: 5, toughness: 1 });
  });

  it("a Clone entering as a copy of the turned-up Entity gets its own choice over the form", () => {
    const { game, a } = table();
    lands(game, "Island", 10);
    const entity = toHand(game, "Aquamorph Entity");
    a.chooseCreatureTypeFn = (_view, _source, options) => options[1];
    cast(game, entity, { via: "face-down", settle: true });
    turnUp(game, entity);
    expect(pt(game, entity)).toEqual({ power: 1, toughness: 5 });
    a.chooseCopyFn = () => entity;
    a.chooseCreatureTypeFn = (_view, _source, options) => options[0];
    const clone = toHand(game, "Clone");
    cast(game, clone);
    expect(nameOf(game.state.objects[clone])).toBe("Aquamorph Entity");
    expect(pt(game, clone)).toEqual({ power: 5, toughness: 1 });
    expect(pt(game, entity)).toEqual({ power: 1, toughness: 5 });
  });

  it("a Vesuvan Shapeshifter turned face up as a copy of one makes the choice too", () => {
    const { game, a } = table();
    lands(game, "Island", 9);
    a.chooseCreatureTypeFn = (_view, _source, options) => options[0];
    const entity = toHand(game, "Aquamorph Entity");
    cast(game, entity);
    expect(pt(game, entity)).toEqual({ power: 5, toughness: 1 });
    const shifter = toHand(game, "Vesuvan Shapeshifter");
    cast(game, shifter, { via: "face-down", settle: true });
    a.chooseCopyFn = () => entity;
    a.chooseCreatureTypeFn = (_view, _source, options) => options[1];
    turnUp(game, shifter);
    expect(nameOf(game.state.objects[shifter])).toBe("Aquamorph Entity");
    expect(zone(game, shifter)).toBe("battlefield");
    expect(pt(game, shifter)).toEqual({ power: 1, toughness: 5 });
  });
});
