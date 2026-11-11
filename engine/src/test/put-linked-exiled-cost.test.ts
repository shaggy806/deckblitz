/**
 * "Put a creature card exiled with ~ into its owner's graveyard" as an
 * activation cost (`AbilityCost.putFromExile`'s `linked` form, rule 607.2a):
 * Shelob, Dread Weaver.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  controller,
  counters,
  destroy,
  graveyard,
  hand,
  lands,
  pickFromZone,
  ref,
  spawn,
  table,
  toExile,
  zone,
} from "./harness.js";

describe("Shelob, Dread Weaver", () => {
  it("exiles a nontoken creature an opponent controls as it dies, not your own", () => {
    const { game } = table();
    spawn(game, "Shelob, Dread Weaver");
    const theirs = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears", A);
    destroy(game, theirs, A);
    destroy(game, mine, B);
    expect(zone(game, theirs)).toBe("exile");
    expect(zone(game, mine)).toBe("graveyard");
  });

  it("the cost takes only a creature card exiled with Shelob: refused without one, chosen among several, to its owner's graveyard", () => {
    const { game, a } = table({ deck: "Forest" });
    lands(game, "Swamp", 9);
    const shelob = spawn(game, "Shelob, Dread Weaver");
    // In exile, an opponent's, but not exiled with Shelob.
    const stray = toExile(game, "Hill Giant", B);
    expect(() => activate(game, shelob, 0)).toThrow(/exiled with Shelob/);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    destroy(game, bears, A);
    destroy(game, giant, A);
    const cards = hand(game).length;
    const seen = pickFromZone(a, giant);
    activate(game, shelob, 0);
    expect([...seen.offered].sort()).toEqual([bears, giant].sort());
    expect(graveyard(game, B)).toEqual([giant]);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, stray)).toBe("exile");
    expect(counters(game, shelob)).toBe(2);
    expect(hand(game).length).toBe(cards + 1);
    // One left: no choice to make.
    activate(game, shelob, 0);
    expect(graveyard(game, B)).toEqual(expect.arrayContaining([giant, bears]));
    expect(counters(game, shelob)).toBe(4);
    expect(() => activate(game, shelob, 0)).toThrow(/exiled with Shelob/);
  });

  it("a card exiled with an earlier Shelob isn't one exiled with this one", () => {
    const { game } = table({ deck: "Forest" });
    lands(game, "Swamp", 3);
    const first = spawn(game, "Shelob, Dread Weaver");
    const bears = spawn(game, "Grizzly Bears", B);
    destroy(game, bears, A);
    expect(zone(game, bears)).toBe("exile");
    game.debugMove(first, "hand");
    const again = spawn(game, "Shelob, Dread Weaver");
    expect(() => activate(game, again, 0)).toThrow(/exiled with Shelob/);
  });

  it("{X}{1}{B} puts an exiled creature card with mana value X onto the battlefield tapped under your control", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const shelob = spawn(game, "Shelob, Dread Weaver");
    const bears = spawn(game, "Grizzly Bears", B);
    destroy(game, bears, A);
    expect(() => activate(game, shelob, 1, { x: 1, targets: [ref(bears)] })).toThrow();
    activate(game, shelob, 1, { x: 2, targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});
