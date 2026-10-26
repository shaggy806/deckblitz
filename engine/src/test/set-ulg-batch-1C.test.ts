/**
 * Urza's Legacy and Portal Three Kingdoms (ULG/PTK; B203), group C. One test
 * per card whose behaviour is more than a stat line, on the clause most
 * likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import {
  A,
  B,
  activate,
  cast,
  destroy,
  enter,
  lands,
  nextTurn,
  pickTargets,
  pt,
  ref,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  types,
  zone,
} from "./harness.js";

describe("Thran Lens", () => {
  it("makes every permanent colorless, so Bone Shredder can destroy a black creature", () => {
    const { game, a } = table();
    spawn(game, "Thran Lens");
    const bears = spawn(game, "Grizzly Bears", B);
    const digger = spawn(game, "Gravedigger", B);
    expect(computeCharacteristics(game.state, game.registry, bears).colors.size).toBe(0);
    expect(computeCharacteristics(game.state, game.registry, digger).colors.size).toBe(0);
    pickTargets(a, digger);
    enter(game, "Bone Shredder");
    expect(zone(game, digger)).toBe("graveyard");
  });
});

describe("Radiant, Archangel", () => {
  it("gets +1/+1 for each other flyer on the battlefield, either side's", () => {
    const { game } = table();
    const radiant = spawn(game, "Radiant, Archangel");
    spawn(game, "Suntail Hawk");
    spawn(game, "Suntail Hawk", B);
    spawn(game, "Grizzly Bears", B);
    expect(pt(game, radiant)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Wheel of Torture", () => {
  it("deals 3 minus the hand size to each opponent at their upkeep", () => {
    const { game } = table();
    spawn(game, "Wheel of Torture");
    const handB = game.state.zones.perPlayer[B].hand;
    while (handB.length > 1) game.debugMove(handB[0], "graveyard");
    nextTurn(game);
    expect(game.state.players[B].life).toBe(18);
    expect(game.state.players[A].life).toBe(20);
  });
});

describe("Hope and Glory", () => {
  it("untaps both targets and gives each +1/+1", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const x = spawn(game, "Grizzly Bears", A, { tapped: true });
    const y = spawn(game, "Grizzly Bears", A, { tapped: true });
    cast(game, toHand(game, "Hope and Glory"), { targets: [ref(x), ref(y)] });
    expect(game.state.objects[x].tapped).toBe(false);
    expect(game.state.objects[y].tapped).toBe(false);
    expect(pt(game, x)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, y)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Peace and Quiet", () => {
  it("destroys two target enchantments", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    const e1 = spawn(game, "Darkest Hour", B);
    const e2 = spawn(game, "Darkest Hour", B);
    cast(game, toHand(game, "Peace and Quiet"), { targets: [ref(e1), ref(e2)] });
    expect(zone(game, e1)).toBe("graveyard");
    expect(zone(game, e2)).toBe("graveyard");
  });
});

describe("Spawning Pool", () => {
  it("becomes a 1/1 black Skeleton land creature that can regenerate", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const pool = spawn(game, "Spawning Pool");
    activate(game, pool, 1);
    expect(types(game, pool)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(subtypes(game, pool)).toContain("Skeleton");
    expect([...computeCharacteristics(game.state, game.registry, pool).colors]).toEqual(["B"]);
    expect(pt(game, pool)).toEqual({ power: 1, toughness: 1 });
    activate(game, pool, 2);
    destroy(game, pool);
    expect(zone(game, pool)).toBe("battlefield");
    expect(game.state.objects[pool].tapped).toBe(true);
  });
});

describe("Hua Tuo, Honored Physician", () => {
  it("puts a creature card from your graveyard on top of your library", () => {
    const { game } = table();
    const hua = spawn(game, "Hua Tuo, Honored Physician");
    const bears = toGraveyard(game, "Grizzly Bears");
    activate(game, hua, 0, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    const marker = game.debugSpawn("Wastes", A, "library");
    // The marker went on top, so Grizzly Bears sits right beside it.
    expect(Math.abs(library.indexOf(marker) - library.indexOf(bears))).toBe(1);
  });
});

describe("Shivan Phoenix", () => {
  it("returns to its owner's hand when it dies", () => {
    const { game } = table();
    const phoenix = spawn(game, "Shivan Phoenix");
    destroy(game, phoenix);
    expect(game.state.zones.perPlayer[A].hand.some((id) => game.state.objects[id].cardName === "Shivan Phoenix")).toBe(true);
  });
});
