/**
 * Arabian Nights and Antiquities (ARN + ATQ; B131), group D. One test per card
 * whose behaviour is more than a stat line, on the clause most likely to be
 * wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  keywords,
  lands,
  life,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Sorceress Queen", () => {
  it("sets another creature's base power and toughness to 0/2, and can't target itself", () => {
    const { game } = table();
    const queen = spawn(game, "Sorceress Queen");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(() => activate(game, queen, 0, { targets: [ref(queen)] })).toThrow(/refused/);
    activate(game, queen, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 0, toughness: 2 });
  });
});

describe("Rukh Egg", () => {
  it("makes a 4/4 red flying Bird for its controller only at the next end step", () => {
    const { game } = table();
    const egg = spawn(game, "Rukh Egg");
    destroy(game, egg);
    expect(zone(game, egg)).toBe("graveyard");
    expect(tokensNamed(game, "4/4 Red Bird Token")).toBe(0);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "4/4 Red Bird Token", A)).toBe(1);
  });
});

describe("Unstable Mutation", () => {
  it("puts a -1/-1 counter on the creature only in its controller's upkeep", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    const aura = toHand(game, "Unstable Mutation");
    cast(game, aura, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    toStep(game, "upkeep", B);
    settle(game);
    expect(counters(game, bears, "-1/-1")).toBe(1);
    toStep(game, "upkeep", A);
    settle(game);
    expect(counters(game, bears, "-1/-1")).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Sandals of Abdallah", () => {
  it("gives islandwalk, and is destroyed when that creature dies this turn", () => {
    const { game } = table();
    const sandals = spawn(game, "Sandals of Abdallah");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 2);
    activate(game, sandals, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("islandwalk")).toBe(true);
    expect(zone(game, sandals)).toBe("battlefield");
    destroy(game, bears);
    expect(zone(game, sandals)).toBe("graveyard");
  });
});

describe("Crumble", () => {
  it("destroys the artifact and its controller gains life equal to its mana value", () => {
    const { game } = table();
    const stone = spawn(game, "Mind Stone", B);
    lands(game, "Forest", 1);
    cast(game, toHand(game, "Crumble"), { targets: [ref(stone)] });
    expect(zone(game, stone)).toBe("graveyard");
    expect(life(game, B)).toBe(22);
    expect(life(game, A)).toBe(20);
  });
});

describe("Dwarven Weaponsmith", () => {
  it("can be activated only during your upkeep", () => {
    const { game } = table();
    const smith = spawn(game, "Dwarven Weaponsmith");
    const ring = spawn(game, "Sol Ring");
    const act = { type: "activate-ability", player: A, source: smith, abilityIndex: 0, targets: [ref(smith)], sacrifice: ring } as const;
    expect(game.canDispatch(act)).not.toBeNull();
    toStep(game, "upkeep");
    expect(game.canDispatch(act)).toBeNull();
    game.dispatch(act);
    settle(game);
    expect(zone(game, ring)).toBe("graveyard");
    expect(counters(game, smith)).toBe(1);
  });
});

describe("Argothian Treefolk", () => {
  it("prevents damage from artifact sources only", () => {
    const { game } = table();
    const treefolk = spawn(game, "Argothian Treefolk");
    const rod = spawn(game, "Rod of Ruin");
    lands(game, "Mountain", 4);
    activate(game, rod, 0, { targets: [ref(treefolk)] });
    expect(game.state.objects[treefolk].damageMarked).toBe(0);
    cast(game, toHand(game, "Shock"), { targets: [ref(treefolk)] });
    expect(game.state.objects[treefolk].damageMarked).toBe(2);
  });
});

describe("Obelisk of Undoing", () => {
  it("targets only a permanent you both own and control", () => {
    const { game } = table();
    const obelisk = spawn(game, "Obelisk of Undoing");
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 6);
    expect(() => activate(game, obelisk, 0, { targets: [ref(theirs)] })).toThrow(/refused/);
    activate(game, obelisk, 0, { targets: [ref(mine)] });
    expect(zone(game, mine)).toBe("hand");
  });
});
