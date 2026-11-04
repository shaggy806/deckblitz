/**
 * Mirror Box — "each nontoken creature you control gets +1/+1 for each other
 * creature you control with the same name as that creature": `grantPtPerCount`
 * with `relativeToAffected`, `excludeSelf` and `sameNameAsSource` together, the
 * count each affected creature's own. All built already.
 */
import { describe, expect, it } from "vitest";

import { A, B, destroy, pt, settle, spawn, table, zone } from "./harness.js";

describe("Mirror Box", () => {
  it("lets you keep two of a legend, each +1/+1 for being legendary and +1/+1 for the other", () => {
    const { game } = table();
    const box = spawn(game, "Mirror Box");
    const first = spawn(game, "Isamaru, Hound of Konda");
    const second = spawn(game, "Isamaru, Hound of Konda");
    settle(game);
    expect(zone(game, first)).toBe("battlefield");
    expect(zone(game, second)).toBe("battlefield");
    expect(pt(game, first)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, second)).toEqual({ power: 4, toughness: 4 });
    // The legend rule applies again once the Box has gone (the ruling).
    destroy(game, box);
    game.advanceUntil((s) => s.turn.step !== "precombat-main");
    const left = [first, second].filter((id) => zone(game, id) === "battlefield");
    expect(left).toHaveLength(1);
    expect(pt(game, left[0])).toEqual({ power: 2, toughness: 2 });
  });

  it("counts each creature's own name, and only others you control", () => {
    const { game } = table();
    spawn(game, "Mirror Box");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const lion = spawn(game, "Savannah Lions");
    const theirs = spawn(game, "Grizzly Bears", B);
    for (const bear of bears) expect(pt(game, bear)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, lion)).toEqual({ power: 2, toughness: 1 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });

  it("gives a token no bonus, but counts it for the nontoken creature with its name, a stack per token", () => {
    const { game } = table();
    spawn(game, "Mirror Box");
    const bear = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "create-token-copy", of: { each: { name: "Grizzly Bears" } }, count: 2 });
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 4 });
    const token = game.battlefield.find((id) => game.state.objects[id].isToken);
    expect(token).toBeDefined();
    expect(pt(game, token!)).toEqual({ power: 2, toughness: 2 });
  });

  it("gives a face-down creature no name to share", () => {
    const { game } = table({ deck: "Grizzly Bears" });
    spawn(game, "Mirror Box");
    const bear = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "manifest", who: "you" });
    game.debugApplyEffect(A, { kind: "manifest", who: "you" });
    settle(game);
    const faceDown = game.battlefield.filter((id) => game.state.objects[id].faceDown !== undefined);
    expect(faceDown).toHaveLength(2);
    expect(pt(game, faceDown[0])).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 2 });
  });

  it("does nothing for an opponent's creatures", () => {
    const { game } = table();
    spawn(game, "Mirror Box", B);
    const first = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    expect(pt(game, first)).toEqual({ power: 2, toughness: 2 });
  });
});
