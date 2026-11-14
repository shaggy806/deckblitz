import { describe, expect, it } from "vitest";
import { A, B, C, D, cast, lands, named, pickFromZone, ref, spawn, table, toHand, zone } from "./harness.js";
import type { Game } from "../game.js";

const wastesOut = (game: Game): number => named(game, "Wastes", A).filter((id) => zone(game, id) === "battlefield").length;

// Disorienting Choice: one optional target per opponent; each controller of a
// chosen permanent may exile it, asked in turn order with the exiles done
// together after the last answer (the ruling, rule 101.4); then a search for
// up to as many lands as chosen permanents are still on the battlefield.
describe("Disorienting Choice — the chosen permanents still on the battlefield", () => {
  it("asks each controller in turn, exiles together, then searches for one land per survivor", () => {
    const { game, a, b, c, d } = table({ players: 4 });
    const ring = spawn(game, "Sol Ring", B);
    const study = spawn(game, "Ghostly Prison", C);
    const stone = spawn(game, "Mind Stone", D);
    const order: string[] = [];
    b.chooseModesFn = () => {
      order.push("bob");
      return [0];
    };
    c.chooseModesFn = () => {
      // Bob said yes, but nothing is exiled until everyone has answered.
      order.push(`carol sees the ring on the ${zone(game, ring)}`);
      return [];
    };
    d.chooseModesFn = () => {
      order.push("dave");
      return [];
    };
    const found = pickFromZone(a);
    a.chooseFromZoneFn = (_view, eligible) => {
      found.offered = eligible;
      return eligible.slice(0, 2);
    };
    const before = wastesOut(game);
    lands(game, "Forest", 4);
    const spell = toHand(game, "Disorienting Choice");
    cast(game, spell, { targets: [ref(ring), ref(study), ref(stone)] });
    expect(order).toEqual(["bob", "carol sees the ring on the battlefield", "dave"]);
    expect(zone(game, ring)).toBe("exile");
    expect(zone(game, study)).toBe("battlefield");
    expect(zone(game, stone)).toBe("battlefield");
    // Two chosen permanents still there: up to two lands, tapped.
    expect(wastesOut(game) - before).toBe(2);
    expect(found.offered.length).toBeGreaterThan(2);
    const fetched = named(game, "Wastes", A).filter((id) => zone(game, id) === "battlefield");
    expect(fetched.every((id) => game.state.objects[id].tapped === true)).toBe(true);
  });

  it("searches for nothing when every chosen permanent was exiled", () => {
    const { game, a, b, c } = table({ players: 3 });
    const ring = spawn(game, "Sol Ring", B);
    const study = spawn(game, "Ghostly Prison", C);
    b.chooseModesFn = () => [0];
    c.chooseModesFn = () => [0];
    let searched = false;
    a.chooseFromZoneFn = () => {
      searched = true;
      return [];
    };
    lands(game, "Forest", 4);
    const spell = toHand(game, "Disorienting Choice");
    cast(game, spell, { targets: [ref(ring), ref(study), null] });
    expect(zone(game, ring)).toBe("exile");
    expect(zone(game, study)).toBe("exile");
    expect(searched).toBe(false);
  });

  it("doesn't ask an opponent with nothing chosen, nor count a slot left empty", () => {
    const { game, a, b, c } = table({ players: 3 });
    spawn(game, "Sol Ring", B);
    const study = spawn(game, "Ghostly Prison", C);
    let bobAsked = false;
    b.chooseModesFn = () => {
      bobAsked = true;
      return [0];
    };
    c.chooseModesFn = () => [];
    const found = pickFromZone(a);
    a.chooseFromZoneFn = (_view, eligible) => {
      found.offered = eligible;
      return eligible.slice(0, 1);
    };
    const before = wastesOut(game);
    lands(game, "Forest", 4);
    const spell = toHand(game, "Disorienting Choice");
    cast(game, spell, { targets: [null, ref(study), null] });
    expect(bobAsked).toBe(false);
    expect(zone(game, study)).toBe("battlefield");
    expect(wastesOut(game) - before).toBe(1);
  });
});
