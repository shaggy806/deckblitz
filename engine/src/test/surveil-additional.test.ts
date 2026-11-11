/**
 * "You may look at an additional two cards each time you surveil" —
 * `StaticAbility.surveilAdditional` (Enhanced Surveillance). The extra cards
 * are part of the surveil: any may go to the graveyard, the rest stay on top
 * (rule 701.25b). Only its controller's surveils, only a surveil of one or
 * more (701.25c), never a scry; several add up.
 */

import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, B, activate, graveyard, settle, spawn, table, toGraveyard, toLibrary, zone } from "./harness.js";

/** Three known cards on top of `player`'s library, the last one topmost. */
const stack = (game: ReturnType<typeof table>["game"], player = A): ObjectId[] =>
  ["Grizzly Bears", "Hill Giant", "Siege Mastodon"].map((name) => toLibrary(game, name, player));

describe("a static that enlarges its controller's surveils (Enhanced Surveillance)", () => {
  it("surveil 1 looks at three cards, any of which may go to the graveyard", () => {
    const { game, a } = table();
    spawn(game, "Enhanced Surveillance");
    const cards = stack(game);
    const top = game.state.zones.perPlayer[A].library.slice(0, 3);
    expect([...top].sort()).toEqual([...cards].sort());
    let seen: readonly ObjectId[] = [];
    let seenMode = "";
    // The deepest of the three is one of the extra cards.
    a.chooseScryFn = (_view, offered, mode) => {
      seen = offered;
      seenMode = mode;
      return [top[1], top[2]];
    };
    game.debugApplyEffect(A, { kind: "surveil", amount: 1 }, []);
    settle(game);
    expect(seen).toEqual(top);
    expect(seenMode).toBe("surveil");
    expect(zone(game, top[1])).toBe("graveyard");
    expect(zone(game, top[2])).toBe("graveyard");
    expect(game.state.zones.perPlayer[A].library[0]).toBe(top[0]);
    const scried = game.eventsOfType("scried").at(-1);
    expect(scried).toMatchObject({ player: A, mode: "surveil", looked: 3, movedAway: 2 });
  });

  it("two of them add up: surveil 2 looks at six", () => {
    const { game, a } = table();
    spawn(game, "Enhanced Surveillance");
    spawn(game, "Enhanced Surveillance");
    let looked = 0;
    a.chooseScryFn = (_view, offered) => {
      looked = offered.length;
      return [];
    };
    game.debugApplyEffect(A, { kind: "surveil", amount: 2 }, []);
    settle(game);
    expect(looked).toBe(6);
  });

  it("leaves an opponent's surveil, a scry and a surveil of 0 alone", () => {
    const { game, a, b } = table();
    spawn(game, "Enhanced Surveillance");
    const asked: [string, number][] = [];
    a.chooseScryFn = b.chooseScryFn = (_view, offered, mode) => {
      asked.push([mode, offered.length]);
      return [];
    };
    game.debugApplyEffect(B, { kind: "surveil", amount: 1 }, []);
    settle(game);
    game.debugApplyEffect(A, { kind: "scry", amount: 1 }, []);
    settle(game);
    game.debugApplyEffect(A, { kind: "surveil", amount: 0 }, []);
    settle(game);
    expect(asked).toEqual([
      ["surveil", 1],
      ["scry", 1],
    ]);
  });

  it("exiled as a cost, it shuffles its controller's graveyard into their library", () => {
    const { game } = table();
    const surveillance = spawn(game, "Enhanced Surveillance");
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    const theirs = toGraveyard(game, "Grizzly Bears", B);
    activate(game, surveillance);
    expect(zone(game, surveillance)).toBe("exile");
    expect(zone(game, bears)).toBe("library");
    expect(zone(game, giant)).toBe("library");
    expect(graveyard(game, A)).toEqual([]);
    expect(zone(game, theirs)).toBe("graveyard");
  });
});
