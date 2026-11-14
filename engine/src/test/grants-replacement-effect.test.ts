/**
 * A replacement effect granted by a static (`StaticAbility.grantsStatic` with
 * a `replacement`, rule 613.1f): "Commander creatures you own have 'The first
 * time you would draw a card each turn, instead …'" (Scion of Halaster). The
 * granted replacement works from the commander (rule 113.10): its "you" is the
 * commander's controller, and it applies to the first draw each turn only
 * (rule 614.11 — the draw it makes is the turn's second). `table()` starts
 * after alice's draw, so each test plays on to her next turn.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, cast, graveyard, hand, lands, nextTurn, ref, spawn, table, toHand, toLibrary, toStep } from "./harness.js";

const names = (game: Game, ids: readonly ObjectId[]) => ids.map((id) => game.state.objects[id].cardName);

describe("Scion of Halaster", () => {
  it("a commander you own replaces your first draw of the turn: two looked at, one milled, then a draw", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    spawn(game, "Scion of Halaster");
    const commander = spawn(game, "Grizzly Bears");
    game.state.objects[commander].isCommander = true;
    nextTurn(game); // bob's
    for (const name of ["Forest", "Swamp", "Mountain", "Plains"]) toLibrary(game, name);
    const looks: string[][] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      looks.push(names(game, eligible));
      return [eligible.find((id) => game.state.objects[id].cardName === "Plains")!];
    };
    const handBefore = hand(game).length;
    toStep(game, "precombat-main"); // alice's draw step
    // One look, at the top two; Plains to the graveyard, Mountain stays on
    // top and is drawn.
    expect(looks).toEqual([["Plains", "Mountain"]]);
    expect(names(game, graveyard(game))).toContain("Plains");
    expect(hand(game).length).toBe(handBefore + 1);
    expect(names(game, hand(game))).toContain("Mountain");
    // The turn's later draws are ordinary ones.
    cast(game, toHand(game, "Divination"));
    expect(looks.length).toBe(1);
    expect(names(game, hand(game))).toEqual(expect.arrayContaining(["Swamp", "Forest"]));
  });

  it("does nothing without a commander, or for an opponent's commander", () => {
    const { game, a, b } = table();
    spawn(game, "Scion of Halaster");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.state.objects[theirs].isCommander = true;
    spawn(game, "Grizzly Bears");
    let asked = 0;
    a.chooseFromZoneFn = b.chooseFromZoneFn = (_view, eligible) => {
      asked++;
      return [eligible[0]];
    };
    nextTurn(game); // bob's: his draw
    toStep(game, "precombat-main"); // alice's draw
    expect(asked).toBe(0);
  });

  it("follows the commander to its new controller: their first draw, not its owner's", () => {
    const { game, a, b } = table();
    spawn(game, "Scion of Halaster");
    const commander = spawn(game, "Grizzly Bears");
    game.state.objects[commander].isCommander = true;
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(commander)]);
    const asked: string[] = [];
    a.chooseFromZoneFn = (_view, eligible) => {
      asked.push("alice");
      return [eligible[0]];
    };
    b.chooseFromZoneFn = (_view, eligible) => {
      asked.push("bob");
      return [eligible[0]];
    };
    nextTurn(game); // bob's draw: replaced
    toStep(game, "precombat-main"); // alice's draw: not
    expect(asked).toEqual(["bob"]);
  });

  it("two commanders with it still replace only the turn's first draw", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    spawn(game, "Scion of Halaster");
    for (const name of ["Grizzly Bears", "Llanowar Elves"]) {
      const id = spawn(game, name);
      game.state.objects[id].isCommander = true;
    }
    nextTurn(game);
    let asked = 0;
    a.chooseFromZoneFn = (_view, eligible) => {
      asked++;
      return [eligible[0]];
    };
    toStep(game, "precombat-main");
    cast(game, toHand(game, "Divination"));
    expect(asked).toBe(1);
    expect(game.state.zones.perPlayer[A].library.length).toBeGreaterThan(0);
  });
});
