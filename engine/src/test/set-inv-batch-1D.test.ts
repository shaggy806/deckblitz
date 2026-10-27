/**
 * Set walk batch 226, group D (2026-10-27): Invasion (INV).
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  graveyard,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("Invasion, group D", () => {
  it("Thicket Elemental, kicked, puts the first creature revealed onto the battlefield", () => {
    const { game, a } = table();
    lands(game, "Forest", 7);
    const bears = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Wastes");
    a.chooseModesFn = (_view, _min, _max, texts) => {
      const i = (texts ?? []).findIndex((t) => /^(yes|reveal)/i.test(t));
      if (i < 0) throw new Error(`no yes option: ${JSON.stringify(texts)}`);
      return [i];
    };
    cast(game, toHand(game, "Thicket Elemental"), { kicked: true, kickCount: 1 });
    expect(zone(game, bears)).toBe("battlefield");
    expect(named(game, "Thicket Elemental", A).length).toBe(1);
  });

  it("Thicket Elemental, unkicked, reveals nothing", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const bears = toLibrary(game, "Grizzly Bears");
    cast(game, toHand(game, "Thicket Elemental"));
    expect(zone(game, bears)).toBe("library");
  });

  it("Llanowar Elite enters with five +1/+1 counters only when kicked", () => {
    const { game } = table();
    lands(game, "Forest", 10);
    cast(game, toHand(game, "Llanowar Elite"), { kicked: true, kickCount: 1 });
    cast(game, toHand(game, "Llanowar Elite"));
    const sizes = named(game, "Llanowar Elite", A)
      .map((id) => pt(game, id).power)
      .sort();
    expect(sizes).toEqual([1, 6]);
  });

  it("Savage Offensive, kicked, gives first strike and +1/+1", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Savage Offensive"), { kicked: true, kickCount: 1 });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("first-strike")).toBe(true);
  });

  it("Urza's Filter takes {2} off a multicolored spell", () => {
    const { game } = table();
    spawn(game, "Urza's Filter");
    lands(game, "Swamp", 1);
    lands(game, "Forest", 1);
    const target = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Putrefy"), { targets: [ref(target)] });
    expect(zone(game, target)).toBe("graveyard");
  });

  it("Aether Rift returns the discarded creature when no one pays", () => {
    const { game } = table({ deck: "Grizzly Bears" });
    spawn(game, "Aether Rift");
    nextTurn(game); // Bob's
    nextTurn(game); // Alice's: her upkeep discarded a Grizzly Bears at random
    expect(named(game, "Grizzly Bears", A).length).toBe(1);
  });

  it("Aether Rift leaves it in the graveyard when a player pays 5 life", () => {
    const t = table({ deck: "Grizzly Bears" });
    const { game } = t;
    spawn(game, "Aether Rift");
    nextTurn(game);
    pickModes(t.b, 0);
    nextTurn(game);
    expect(named(game, "Grizzly Bears", A).length).toBe(0);
    expect(graveyard(game, A).length).toBe(1);
    expect(life(game, B)).toBe(15);
  });
});
