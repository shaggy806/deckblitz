/**
 * "As this creature enters, an opponent chooses a creature type." (Callous
 * Oppressor — need key replacement:opponent-chooses-creature-type-as-enters):
 * `CardDefinition.chooseOnEnterBy: "an-opponent"` over
 * `chooseCreatureTypeOnEnter`. The choice is the opponent's, asked as it is
 * about to enter (rule 614.12) and kept as its chosen type; which opponent is
 * its controller's pick among two or more (`enterChooser`, asked first). Then
 * "{T}: Gain control of target creature that isn't of the chosen type for as
 * long as this creature remains tapped."
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, C, D, activate, cast, controller, lands, ref, spawn, table, toHand } from "./harness.js";

/** Records each creature-type question the seat gets and answers it. */
function answers(seat: ScriptedController, answer: string, asked: string[][]): void {
  seat.chooseCreatureTypeFn = (_view, _source, options) => {
    asked.push(options.length > 6 ? ["(catalog)"] : [...options]);
    return answer;
  };
}

/** Alice casts Callous Oppressor, which can then tap. */
function castOppressor(game: Game): ObjectId {
  lands(game, "Island", 3);
  const oppressor = toHand(game, "Callous Oppressor");
  cast(game, oppressor);
  game.state.objects[oppressor].summoningSick = false;
  return oppressor;
}

describe("Callous Oppressor", () => {
  it("the opponent chooses the creature type as it enters, not its controller", () => {
    const { game, a, b } = table();
    const mine: string[][] = [];
    const theirs: string[][] = [];
    answers(a, "Elf", mine);
    answers(b, "Bear", theirs);
    const oppressor = castOppressor(game);
    expect(mine).toEqual([]);
    expect(theirs).toEqual([["(catalog)"]]);
    expect(game.state.objects[oppressor].chosenCreatureType).toBe("Bear");
  });

  it("taps to gain control of a creature not of the chosen type, for as long as it stays tapped", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const outcast = spawn(game, "Changeling Outcast", B);
    answers(b, "Bear", []);
    const oppressor = castOppressor(game);
    const aimed = (id: ObjectId): string | null =>
      game.canDispatch({ type: "activate-ability", player: A, source: oppressor, abilityIndex: 0, targets: [ref(id)] });
    // Not the Bears, nor a changeling (every creature type).
    expect(aimed(bears)).not.toBeNull();
    expect(aimed(outcast)).not.toBeNull();
    expect(aimed(giant)).toBeNull();
    activate(game, oppressor, 0, { targets: [ref(giant)] });
    expect(controller(game, giant)).toBe(A);
    // Untapped, the control ends.
    game.debugApplyEffect(A, { kind: "untap", target: 0 }, [ref(oppressor)]);
    expect(controller(game, giant)).toBe(B);
  });

  it("in a 4-player game, its controller picks which opponent chooses", () => {
    const { game, a, b, c, d } = table({ players: 4 });
    const asked: Record<string, string[][]> = { a: [], b: [], c: [], d: [] };
    answers(a, C, asked.a);
    answers(b, "Bear", asked.b);
    answers(c, "Giant", asked.c);
    answers(d, "Elf", asked.d);
    const oppressor = castOppressor(game);
    expect(asked.a).toEqual([[B, C, D]]);
    expect(asked.c).toEqual([["(catalog)"]]);
    expect(asked.b).toEqual([]);
    expect(asked.d).toEqual([]);
    expect(game.state.objects[oppressor].chosenCreatureType).toBe("Giant");
  });
});
