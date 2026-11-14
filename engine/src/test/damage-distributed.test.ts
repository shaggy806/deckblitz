/**
 * Damage divided among untargeted permanents as the effect resolves (rule
 * 608.2d — the `damage-distributed` effect), by a player who may not be the
 * effect's controller: Master of the Wild Hunt's target creature deals damage
 * equal to its power divided as **its controller** chooses among any number
 * of the Wolves tapped this way — at least one each, all of it among them.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import { A, B, C, activate, pickPermanents, ref, spawn, table, zone } from "./harness.js";

const damageOn = (game: ReturnType<typeof table>["game"], id: ObjectId): number => game.state.objects[id]?.damageMarked ?? 0;

describe("Master of the Wild Hunt", () => {
  const setUp = (players: 2 | 4 = 2, victimSeat = B) => {
    const t = table({ players });
    const { game } = t;
    const master = spawn(game, "Master of the Wild Hunt");
    const wolves = [spawn(game, "Wolf Token"), spawn(game, "Wolf Token"), spawn(game, "Wolf Token")];
    const tired = spawn(game, "Wolf Token", A, { tapped: true });
    const wurm = spawn(game, "Craw Wurm", victimSeat);
    return { ...t, master, wolves, tired, wurm };
  };

  it("taps the untapped Wolves, each deals its power to the target, and the target's controller divides its power among them", () => {
    const { game, a, b, master, wolves, tired, wurm } = setUp();
    let asked: string | undefined;
    const seen = pickPermanents(b, wolves[0], wolves[1]);
    b.chooseNumberFn = (view, offer) => {
      asked = view.player;
      expect(offer.min).toBe(1);
      // 6 among two: the first may take 1 to 5.
      expect(offer.max).toBe(5);
      return 4;
    };
    a.choosePermanentsFn = () => {
      throw new Error("alice isn't the one dividing");
    };
    activate(game, master, 0, { targets: [ref(wurm)] });
    // Only the Wolves tapped this way are offered, the already-tapped one not.
    expect([...seen.offered].sort()).toEqual([...wolves].sort());
    expect(asked).toBe(B);
    // Three 2/2s dealt 6 to the 6/4 Craw Wurm; it still dealt 6 (4 and 2).
    expect(zone(game, wurm)).toBe("graveyard");
    expect(zone(game, wolves[0])).toBe("graveyard");
    expect(zone(game, wolves[1])).toBe("graveyard");
    expect(zone(game, wolves[2])).toBe("battlefield");
    expect(game.state.objects[wolves[2]].tapped).toBe(true);
    expect(damageOn(game, wolves[2])).toBe(0);
    expect(zone(game, tired)).toBe("battlefield");
    expect(damageOn(game, tired)).toBe(0);
  });

  it("asks for at least one Wolf: the damage is all dealt", () => {
    const { game, b, master, wolves, wurm } = setUp();
    let min: number | undefined;
    b.choosePermanentsFn = (_view, eligible, least) => {
      min = least;
      return [eligible[2]!];
    };
    activate(game, master, 0, { targets: [ref(wurm)] });
    expect(min).toBe(1);
    expect(zone(game, wolves[2])).toBe("graveyard");
    expect(zone(game, wolves[0])).toBe("battlefield");
  });

  it("at four players, the target's controller divides, not the active player", () => {
    const { game, c, master, wolves, wurm } = setUp(4, C);
    let chooser: string | undefined;
    c.choosePermanentsFn = (view) => {
      chooser = view.player;
      return [wolves[1]];
    };
    activate(game, master, 0, { targets: [ref(wurm)] });
    expect(chooser).toBe(C);
    expect(zone(game, wolves[1])).toBe("graveyard");
    expect(zone(game, wolves[0])).toBe("battlefield");
  });

  it("with no Wolves to tap, the target is dealt nothing and deals nothing", () => {
    const { game, b, master, wolves, wurm } = setUp();
    for (const wolf of wolves) game.state.objects[wolf].tapped = true;
    b.choosePermanentsFn = () => {
      throw new Error("nothing to divide among");
    };
    activate(game, master, 0, { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("battlefield");
    expect(damageOn(game, wurm)).toBe(0);
  });

  it("a target gone illegal: no Wolf is tapped (the ability doesn't resolve)", () => {
    const { game, master, wolves, wurm } = setUp();
    activate(game, master, 0, { targets: [ref(wurm)], settle: false });
    game.debugMove(wurm, "graveyard");
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null);
    for (const wolf of wolves) expect(game.state.objects[wolf].tapped).not.toBe(true);
  });

  it("makes a Wolf at the beginning of your upkeep", () => {
    const { game, master } = setUp();
    expect(master).toBeDefined();
    const before = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Wolf Token").length;
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "draw");
    const after = game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].cardName === "Wolf Token").length;
    expect(after).toBe(before + 1);
  });
});
