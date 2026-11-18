/**
 * "Target creature **the opponent to your left** controls" — `CardFilter`'s
 * `controlledBy: "player-to-your-left"` (and `-right`), read from the side of
 * whoever chooses: the next player in turn order still in the game (rule
 * 101.4). Barroom Brawl: the fight, then that player may copy the spell with
 * new targets (rule 707.10c), the copy's "your left" theirs, round the table.
 */

import { describe, expect, it } from "vitest";

import { A, B, C, D, cast, lands, pickModes, pickTargets, ref, settle, spawn, table, toHand, watchTargets, zone } from "./harness.js";

const BRAWL = "Barroom Brawl";

describe("Barroom Brawl", () => {
  it("fights the opponent to your left's creature, and that player may copy it at new targets", () => {
    const { game, a, b } = table();
    const wurm = spawn(game, "Craw Wurm");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const ox = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    // Bob copies it: his Hill Giant fights Alice's other Bears; Alice
    // declines the next copy.
    pickModes(b, 0);
    pickTargets(b, giant, ox);
    pickModes(a);
    cast(game, toHand(game, BRAWL), { targets: [ref(wurm), ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
    expect(game.state.objects[wurm].damageMarked).toBe(2);
    expect(zone(game, ox)).toBe("graveyard");
    expect(game.state.objects[giant].damageMarked).toBe(2);
    expect(game.state.zones.shared.stack).toHaveLength(0);
  });

  it("only the creatures of the player to your left — and the copy's left is its controller's", () => {
    const { game, b } = table({ players: 4 });
    const wurm = spawn(game, "Craw Wurm");
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Grizzly Bears", C);
    const carols2 = spawn(game, "Hill Giant", C);
    const daves = spawn(game, "Grizzly Bears", D);
    const bobsOther = spawn(game, "Hill Giant", B);
    lands(game, "Forest", 2);
    const brawl = toHand(game, BRAWL);
    expect(game.canDispatch({ type: "cast-spell", player: A, card: brawl, targets: [ref(wurm), ref(carols)] })).toMatch(
      /target/i,
    );
    // Bob copies it; his copy's second target is a creature Carol controls.
    pickModes(b, 0);
    const seen = watchTargets(b, () => [bobsOther, carols2]);
    cast(game, brawl, { targets: [ref(wurm), ref(bobs)] });
    expect(seen.asked).toBe(1);
    // New targets are Carol's creatures (the old one may be kept, rule
    // 707.10c, so it's offered too) — not Alice's or Dave's.
    expect(seen.offered[1]).toEqual(expect.arrayContaining([carols, carols2]));
    expect(seen.offered[1]).not.toContain(wurm);
    expect(seen.offered[1]).not.toContain(daves);
    expect(seen.offered[0]).toContain(bobsOther);
    expect(seen.offered[0]).not.toContain(carols);
    // Two Hill Giants fight: both die.
    expect(zone(game, carols2)).toBe("graveyard");
    expect(zone(game, bobsOther)).toBe("graveyard");
  });

  it("goes on round the table while each next player copies it", () => {
    const { game, a, b, c } = table({ players: 3 });
    const wurm = spawn(game, "Craw Wurm");
    const bobs = spawn(game, "Grizzly Bears", B);
    const bobsGiant = spawn(game, "Hill Giant", B);
    const carols = spawn(game, "Grizzly Bears", C);
    const carolsGiant = spawn(game, "Hill Giant", C);
    const alicesBears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 2);
    let asked: string[] = [];
    b.chooseModesFn = () => {
      asked = [...asked, "bob"];
      return [0];
    };
    pickTargets(b, bobsGiant, carols);
    c.chooseModesFn = () => {
      asked = [...asked, "carol"];
      return [0];
    };
    // Carol's copy: her Hill Giant fights a creature Alice controls.
    pickTargets(c, carolsGiant, alicesBears);
    // Alice declines.
    let aliceAsked = 0;
    a.chooseModesFn = () => {
      aliceAsked += 1;
      return [];
    };
    cast(game, toHand(game, BRAWL), { targets: [ref(wurm), ref(bobs)] });
    expect(asked).toEqual(["bob", "carol"]);
    expect(aliceAsked).toBe(1);
    expect(zone(game, bobs)).toBe("graveyard");
    expect(zone(game, carols)).toBe("graveyard");
    expect(zone(game, alicesBears)).toBe("graveyard");
  });

  // Rule 701.14b and the rulings: one illegal target, no damage — but the
  // copy is still offered; both illegal, the spell does nothing.
  it("with one target gone there's no fight, but the copy is still offered", () => {
    const { game, b } = table();
    const wurm = spawn(game, "Craw Wurm");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 2);
    let offered = 0;
    b.chooseModesFn = () => {
      offered += 1;
      return [];
    };
    cast(game, toHand(game, BRAWL), { targets: [ref(wurm), ref(bears)], settle: false });
    game.debugMove(bears, "graveyard");
    settle(game);
    expect(game.state.objects[wurm].damageMarked ?? 0).toBe(0);
    expect(offered).toBe(1);
  });

  it("with both targets gone it does nothing, and nobody is offered a copy", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 2);
    let offered = 0;
    b.chooseModesFn = () => {
      offered += 1;
      return [];
    };
    cast(game, toHand(game, BRAWL), { targets: [ref(bears), ref(theirs)], settle: false });
    game.debugMove(bears, "graveyard");
    game.debugMove(theirs, "graveyard");
    settle(game);
    expect(offered).toBe(0);
  });
});
