/**
 * An `unless`'s `otherwise` reads the resolving ability's trigger value
 * (`Game.beginUnless` carries it, as it does the last-known references):
 * Archfiend of Spite's "that source's controller loses **that much** life
 * unless they sacrifice **that many** permanents of their choice". It read 0
 * before (docs/engine-gaps.md, B298).
 */

import { describe, expect, it } from "vitest";

import { A, B, lands, life, pickModes, ref, settle, spawn, table, zone } from "./harness.js";

const ARCHFIEND = "Archfiend of Spite";

describe("Archfiend of Spite", () => {
  function board(bobsLands: number) {
    const t = table();
    const archfiend = spawn(t.game, ARCHFIEND);
    const bears = spawn(t.game, "Grizzly Bears", B);
    const theirs = lands(t.game, "Wastes", bobsLands, B);
    const hit = (amount: number, source = bears, by = B) => {
      t.game.debugApplyEffect(by, { kind: "damage", amount, target: 0 }, [ref(archfiend)], { source });
      settle(t.game);
    };
    return { ...t, archfiend, bears, theirs, hit };
  }

  it("the source's controller loses that much life when they don't sacrifice", () => {
    const { game, b, hit } = board(3);
    pickModes(b);
    hit(3);
    expect(life(game, B)).toBe(17);
    expect(game.battlefield.filter((id) => game.state.objects[id].controller === B)).toHaveLength(4);
  });

  it("or sacrifices that many permanents, losing no life", () => {
    const { game, b, bears, theirs, hit } = board(3);
    pickModes(b, 0);
    b.choosePermanentsFn = () => [bears, theirs[0], theirs[1]];
    hit(3);
    expect(life(game, B)).toBe(20);
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.battlefield.filter((id) => game.state.objects[id].controller === B)).toEqual([theirs[2]]);
  });

  it("must lose the life without that many permanents to sacrifice", () => {
    const { game, b, hit } = board(1);
    pickModes(b, 0);
    hit(3);
    expect(life(game, B)).toBe(17);
  });

  it("doesn't trigger on damage from a source its controller controls", () => {
    const { game, hit } = board(0);
    const own = spawn(game, "Grizzly Bears", A);
    hit(2, own, A);
    expect(life(game, A)).toBe(20);
    expect(life(game, B)).toBe(20);
  });
});
