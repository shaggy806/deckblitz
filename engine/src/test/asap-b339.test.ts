/**
 * The cards flagged "Build ASAP": Expert-Level Safe and Malik, Grim
 * Manipulator, each a secret choice by you and target opponent — a secret
 * `vote` with `who: { youAnd: { target: 0 } }`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { A, B, activate, enter, lands, settle, spawn, table, zone } from "./harness.js";

/** Alice's cards exiled face down that nobody may look at (the only face-down
 * exiles in these tests are the safe's). */
const faceDownExiled = (game: Game): ObjectId[] =>
  Object.values(game.state.objects)
    .filter((o) => o.zone === "exile" && o.owner === A && o.exiledFaceDown !== undefined)
    .map((o) => {
      expect(o.exiledFaceDown?.lookers).toEqual([]);
      return o.id;
    });

describe("Expert-Level Safe", () => {
  it("exiles two face down as it enters; a miss exiles one more", () => {
    const { game, a, b } = table({ players: 2 });
    const safe = enter(game, "Expert-Level Safe");
    expect(faceDownExiled(game)).toHaveLength(2);
    a.chooseNumberFn = () => 1;
    b.chooseNumberFn = () => 3;
    lands(game, "Plains", 1);
    activate(game, safe, 0, { targets: [{ kind: "player", player: B }] });
    settle(game);
    expect(zone(game, safe)).toBe("battlefield");
    expect(faceDownExiled(game)).toHaveLength(3);
  });

  it("a match sacrifices it and puts the exiled cards into their owner's hand", () => {
    const { game, a, b } = table({ players: 2 });
    const safe = enter(game, "Expert-Level Safe");
    const held = faceDownExiled(game);
    expect(held).toHaveLength(2);
    a.chooseNumberFn = () => 2;
    b.chooseNumberFn = () => 2;
    lands(game, "Plains", 1);
    activate(game, safe, 0, { targets: [{ kind: "player", player: B }] });
    settle(game);
    expect(zone(game, safe)).toBe("graveyard");
    for (const id of held) expect(zone(game, id)).toBe("hand");
    expect(faceDownExiled(game)).toHaveLength(0);
  });

  it("offers only 1, 2 or 3, and only the two of you choose", () => {
    const { game, a, b, c } = table({ players: 3 });
    const safe = enter(game, "Expert-Level Safe");
    const asked: string[] = [];
    a.chooseNumberFn = (...args: unknown[]) => {
      asked.push(`A ${JSON.stringify(args.slice(1))}`);
      return 3;
    };
    b.chooseNumberFn = () => {
      asked.push("B");
      return 3;
    };
    c.chooseNumberFn = () => {
      asked.push("C");
      return 3;
    };
    lands(game, "Plains", 1);
    activate(game, safe, 0, { targets: [{ kind: "player", player: B }] });
    settle(game);
    expect(asked.filter((s) => s === "C")).toHaveLength(0);
    expect(asked.some((s) => s === "B")).toBe(true);
    expect(zone(game, safe)).toBe("graveyard");
  });
});

describe("Malik, Grim Manipulator", () => {
  it("each picks one of the opponent's creatures; both are sacrificed, and each makes a Treasure", () => {
    const { game, a, b } = table({ players: 2 });
    const bear = spawn(game, "Grizzly Bears", B);
    const ox = spawn(game, "Hill Giant", B);
    const keep = spawn(game, "Llanowar Elves", B);
    const mine = spawn(game, "Savannah Lions", A);
    const offered: ObjectId[][] = [];
    a.choosePermanentsFn = (_view, eligible) => {
      offered.push([...eligible]);
      return [bear];
    };
    b.choosePermanentsFn = (_view, eligible) => {
      offered.push([...eligible]);
      return [ox];
    };
    enter(game, "Malik, Grim Manipulator");
    // Both were offered the opponent's creatures, never Alice's.
    for (const list of offered) {
      expect(list).toContain(keep);
      expect(list).not.toContain(mine);
    }
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, ox)).toBe("graveyard");
    expect(zone(game, keep)).toBe("battlefield");
    const treasures = Object.values(game.state.objects).filter(
      (o) => o.zone === "battlefield" && o.controller === A && o.cardName === "Treasure Token",
    );
    expect(treasures.reduce((n, o) => n + (o.stackCount ?? 1), 0)).toBe(2);
  });

  it("the same creature chosen twice is sacrificed once", () => {
    const { game, a, b } = table({ players: 2 });
    const bear = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Hill Giant", B);
    a.choosePermanentsFn = () => [bear];
    b.choosePermanentsFn = () => [bear];
    enter(game, "Malik, Grim Manipulator");
    expect(zone(game, bear)).toBe("graveyard");
    expect(zone(game, other)).toBe("battlefield");
  });
});
