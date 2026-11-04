/**
 * Exiled objects linked to what exiled them, each with its own way back: any
 * number chosen until the source leaves (Glorious Protector), one target per
 * opponent until it leaves, and a card put from there into a graveyard
 * (Bronzebeak Foragers), and "exile all permanents" with one back per player's
 * upkeep while any remain exiled (Dimensional Breach).
 */
import { describe, expect, it } from "vitest";

import { A, B, C, activate, cast, destroy, enter, lands, life, pickPermanents, pickTargets, ref, settle, spawn, table, toHand, zone } from "./harness.js";

describe("Glorious Protector: any number of non-Angels until it leaves", () => {
  it("offers only your non-Angel creatures, exiles the chosen, and they come back as it leaves", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    const angel = spawn(game, "Serra Angel");
    const theirs = spawn(game, "Grizzly Bears", B);
    const seen = pickPermanents(a, bears);
    const protector = enter(game, "Glorious Protector");
    expect(seen.offered).toEqual(expect.arrayContaining([bears, elves]));
    expect(seen.offered).not.toContain(angel);
    expect(seen.offered).not.toContain(protector);
    expect(seen.offered).not.toContain(theirs);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, elves)).toBe("battlefield");
    destroy(game, protector);
    settle(game);
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("choosing none is fine, and several go together", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const elves = spawn(game, "Llanowar Elves");
    pickPermanents(a);
    const first = enter(game, "Glorious Protector");
    expect(zone(game, bears)).toBe("battlefield");
    destroy(game, first);
    settle(game);
    pickPermanents(a, bears, elves);
    enter(game, "Glorious Protector");
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, elves)).toBe("exile");
  });

  it("has foretell", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const protector = toHand(game, "Glorious Protector");
    game.dispatch({ type: "foretell", player: A, card: protector });
    expect(zone(game, protector)).toBe("exile");
  });
});

describe("Bronzebeak Foragers", () => {
  it("one target per opponent; its second ability moves one on and it doesn't come back", () => {
    const { game, a } = table({ players: 3 });
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Llanowar Elves", C);
    pickTargets(a, bobs, carols);
    const foragers = enter(game, "Bronzebeak Foragers");
    settle(game);
    expect(zone(game, bobs)).toBe("exile");
    expect(zone(game, carols)).toBe("exile");
    lands(game, "Plains", 3);
    activate(game, foragers, 0, { x: 2, targets: [ref(bobs)] });
    expect(zone(game, bobs)).toBe("graveyard");
    expect(life(game)).toBe(22);
    destroy(game, foragers);
    settle(game);
    expect(zone(game, bobs)).toBe("graveyard");
    expect(zone(game, carols)).toBe("battlefield");
  });
});

describe("Dimensional Breach", () => {
  /** Everything exiled, with Bob and Alice owning two permanents each. */
  function breached() {
    const t = table();
    const bears = spawn(t.game, "Grizzly Bears");
    const elves = spawn(t.game, "Llanowar Elves");
    const bobsBears = spawn(t.game, "Grizzly Bears", B);
    const bobsElves = spawn(t.game, "Llanowar Elves", B);
    const mana = lands(t.game, "Plains", 7);
    const breach = toHand(t.game, "Dimensional Breach");
    cast(t.game, breach);
    return { ...t, bears, elves, bobsBears, bobsElves, mana, breach };
  }

  it("exiles all permanents", () => {
    const { game, bears, bobsBears, mana } = breached();
    expect(game.state.zones.shared.battlefield).toEqual([]);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, bobsBears)).toBe("exile");
    expect(zone(game, mana[0])).toBe("exile");
  });

  it("each player's upkeep returns one of their own, their choice, under them", () => {
    const { game, a, b, bears, elves, bobsBears, bobsElves, mana } = breached();
    const offeredToBob: (readonly unknown[])[] = [];
    b.chooseFromZoneFn = (_view, ids) => {
      offeredToBob.push(ids);
      return [bobsElves];
    };
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "draw");
    expect(offeredToBob[0]).toEqual(expect.arrayContaining([bobsBears, bobsElves]));
    expect(offeredToBob[0]).not.toContain(bears);
    expect(zone(game, bobsElves)).toBe("battlefield");
    expect(game.state.objects[bobsElves].controller).toBe(B);
    expect(zone(game, bobsBears)).toBe("exile");
    a.chooseFromZoneFn = (_view, ids) => {
      expect(ids).toContain(elves);
      expect(ids).toContain(mana[0]);
      return [elves];
    };
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "draw");
    expect(zone(game, elves)).toBe("battlefield");
    expect(zone(game, bears)).toBe("exile");
  });

  it("stops once none remain exiled, and one that left exile isn't one of them", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const breach = toHand(game, "Dimensional Breach");
    lands(game, "Plains", 7);
    cast(game, breach);
    expect(game.state.delayedTriggers.length).toBe(1);
    expect(zone(game, bears)).toBe("exile");
    // Alice's lands and Bears come back, one an upkeep; Bob owns nothing and isn't asked.
    let bobAsked = false;
    b.chooseFromZoneFn = () => {
      bobAsked = true;
      return [];
    };
    a.chooseFromZoneFn = (_view, ids) => [ids[0]];
    game.advanceUntil((s) => s.turn.number === 20);
    expect(bobAsked).toBe(false);
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.delayedTriggers.length).toBe(0);
    expect(game.state.zones.shared.stack).toEqual([]);
  });

  it("one that came back and was exiled again is a new object, and isn't offered", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 7);
    cast(game, toHand(game, "Dimensional Breach"));
    a.chooseFromZoneFn = (_view, ids) => [bears, ...ids].slice(0, 1);
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main");
    expect(zone(game, bears)).toBe("battlefield");
    let offered: readonly unknown[] = [];
    a.chooseFromZoneFn = (_view, ids) => {
      offered = ids;
      return [ids[0]];
    };
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Swords to Plowshares"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    game.advanceUntil((s) => s.turn.number === 5 && s.turn.step === "draw");
    expect(offered.length).toBeGreaterThan(0);
    expect(offered).not.toContain(bears);
  });

  it("an Aura with nothing to enchant can't be picked", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 7);
    const growth = spawn(game, "Rancor");
    game.state.objects[growth].attachedTo = bears;
    cast(game, toHand(game, "Dimensional Breach"));
    let offered: readonly unknown[] = [];
    a.chooseFromZoneFn = (_view, ids) => {
      offered = ids;
      return [ids[0]];
    };
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "draw");
    expect(offered).not.toContain(growth);
  });
});
