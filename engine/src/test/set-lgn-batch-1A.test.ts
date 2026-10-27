/**
 * Legions and the rest of Mirrodin (LGN, MRD; B219), group A. One test per
 * card whose behaviour is more than a stat line, on the clause most likely to
 * be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import {
  A,
  B,
  attack,
  cast,
  destroy,
  hand,
  lands,
  life,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
} from "./harness.js";

describe("Nim Shambler", () => {
  it("gets +1/+0 for each artifact you control, and sacrifices a creature to regenerate", () => {
    const { game } = table();
    const shambler = spawn(game, "Nim Shambler");
    spawn(game, "Sol Ring");
    spawn(game, "Sol Ring");
    spawn(game, "Sol Ring", B);
    expect(pt(game, shambler)).toEqual({ power: 4, toughness: 1 });
    const bears = spawn(game, "Grizzly Bears");
    game.dispatch({ type: "activate-ability", player: A, source: shambler, abilityIndex: 0, targets: [], sacrifice: bears });
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    destroy(game, shambler);
    expect(zone(game, shambler)).toBe("battlefield");
  });
});

describe("Essence Sliver", () => {
  it("each Sliver's controller gains the life — an opponent's Sliver too", () => {
    const { game, a } = table();
    const essence = spawn(game, "Essence Sliver");
    const theirs = spawn(game, "Muscle Sliver", B);
    const bears = spawn(game, "Grizzly Bears");
    // Bob's Muscle Sliver (2/2 with its own +1/+1) fights the Bears; both die.
    game.debugApplyEffect(B, { kind: "fight", a: 0, b: 1 }, [ref(theirs), ref(bears)]);
    settle(game);
    expect(life(game, B)).toBe(22);
    expect(life(game, A)).toBe(20);
    attack(game, a, [essence]);
    expect(life(game, B)).toBe(22 - 3);
    expect(life(game, A)).toBe(23);
  });
});

describe("Toxin Sliver", () => {
  it("destroys a creature a Sliver deals combat damage to, past regeneration", () => {
    const { game, a, b } = table();
    spawn(game, "Toxin Sliver", B);
    const sliver = spawn(game, "Muscle Sliver");
    const wall = spawn(game, "Wall of Stone", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: sliver }];
    game.debugApplyEffect(B, { kind: "regenerate", target: 0 }, [ref(wall)]);
    attack(game, a, [sliver]);
    expect(zone(game, wall)).toBe("graveyard");
    expect(zone(game, sliver)).toBe("battlefield");
  });
});

describe("Willbender", () => {
  it("turned face up, moves a single-target spell to its other legal target", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    lands(game, "Swamp", 2);
    const willbender = toHand(game, "Willbender");
    cast(game, willbender, { via: "face-down" });
    const bears = spawn(game, "Grizzly Bears", B);
    const murder = toHand(game, "Murder");
    cast(game, murder, { targets: [ref(willbender)], settle: false });
    pickTargets(a, murder);
    game.dispatch({ type: "turn-face-up", player: A, permanent: willbender, morph: true } as Action);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, willbender)).toBe("battlefield");
  });
});

describe("Skinthinner", () => {
  it("turned face up, destroys a nonblack creature", () => {
    const { game, a } = table();
    lands(game, "Swamp", 8);
    const thinner = toHand(game, "Skinthinner");
    cast(game, thinner, { via: "face-down" });
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    game.dispatch({ type: "turn-face-up", player: A, permanent: thinner, morph: true } as Action);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Corpse Harvester", () => {
  it("finds a Zombie card and a Swamp card", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const harvester = spawn(game, "Corpse Harvester");
    const fodder = spawn(game, "Grizzly Bears");
    const zombie = toLibrary(game, "Skinthinner");
    const swamp = toLibrary(game, "Swamp");
    const bears = toLibrary(game, "Grizzly Bears");
    a.chooseFromZoneFn = (_view, eligible, _min, max) => eligible.slice(0, max);
    const before = hand(game).length;
    game.dispatch({ type: "activate-ability", player: A, source: harvester, abilityIndex: 0, targets: [], sacrifice: fodder });
    settle(game);
    expect(zone(game, zombie)).toBe("hand");
    expect(zone(game, swamp)).toBe("hand");
    expect(zone(game, bears)).toBe("library");
    expect(hand(game).length).toBe(before + 2);
  });
});

describe("Mistform Ultimus", () => {
  it("is every creature type in the graveyard", () => {
    const { game, a } = table();
    lands(game, "Swamp", 8);
    const ultimus = toGraveyard(game, "Mistform Ultimus");
    const bears = toGraveyard(game, "Grizzly Bears");
    a.chooseCreatureTypeFn = () => "Goblin";
    cast(game, toHand(game, "Bloodline Bidding"));
    expect(zone(game, ultimus)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Deathmark Prelate", () => {
  it("sacrifices a Zombie to destroy a non-Zombie creature", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const prelate = spawn(game, "Deathmark Prelate");
    const zombie = spawn(game, "Skinthinner");
    const bears = spawn(game, "Grizzly Bears", B);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: prelate,
      abilityIndex: 0,
      targets: [ref(bears)],
      sacrifice: zombie,
    });
    settle(game);
    expect(zone(game, zombie)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });
});
