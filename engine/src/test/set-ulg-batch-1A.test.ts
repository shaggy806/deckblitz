/**
 * Urza's Legacy and Portal Three Kingdoms (ULG, PTK; B203), group A. One test
 * per card whose behaviour is more than a stat line, on the clause most
 * likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
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

describe("Iron Maiden", () => {
  it("deals an opponent the cards in their hand minus 4 at their upkeep", () => {
    const { game } = table();
    spawn(game, "Iron Maiden");
    for (let i = 0; i < 3; i++) toHand(game, "Wastes", B);
    nextTurn(game, "upkeep");
    settle(game);
    expect(game.state.turn.step).toBe("upkeep");
    const cards = hand(game, B).length;
    expect(cards).toBeGreaterThan(4);
    expect(life(game, B)).toBe(20 - (cards - 4));
    expect(life(game, A)).toBe(20);
  });
});

describe("Viashino Heretic", () => {
  it("destroys an artifact and deals its controller its mana value", () => {
    const { game } = table();
    const heretic = spawn(game, "Viashino Heretic");
    lands(game, "Mountain", 2);
    const stone = spawn(game, "Mind Stone", B);
    activate(game, heretic, 0, { targets: [ref(stone)] });
    expect(zone(game, stone)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });
});

describe("Multani, Maro-Sorcerer", () => {
  it("is as big as every hand put together", () => {
    const { game } = table();
    const multani = spawn(game, "Multani, Maro-Sorcerer");
    toHand(game, "Wastes", B);
    const total = hand(game, A).length + hand(game, B).length;
    expect(pt(game, multani)).toEqual({ power: total, toughness: total });
  });
});

describe("Engineered Plague", () => {
  it("shrinks every player's creatures of the chosen type", () => {
    const { game, a } = table();
    a.chooseCreatureTypeFn = () => "Bear";
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    const other = spawn(game, "Serra Angel", B);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Engineered Plague"));
    expect(pt(game, mine)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, other)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Walking Sponge", () => {
  it("takes away the one keyword chosen as it resolves", () => {
    const { game, a } = table();
    const sponge = spawn(game, "Walking Sponge");
    const angel = spawn(game, "Serra Angel", B);
    grantTrample(angel);
    pickModes(a, 2);
    activate(game, sponge, 0, { targets: [ref(angel)] });
    expect(keywords(game, angel).has("trample")).toBe(false);
    expect(keywords(game, angel).has("flying")).toBe(true);

    function grantTrample(id: typeof angel): void {
      game.debugApplyEffect(B, { kind: "grant-keyword", target: 0, keyword: "trample", duration: "end-of-turn" }, [
        ref(id),
      ]);
      settle(game);
    }
  });
});

describe("Hunting Cheetah", () => {
  it("may fetch a Forest card when it damages an opponent", () => {
    const { game, a } = table();
    const cheetah = spawn(game, "Hunting Cheetah");
    const forest = toLibrary(game, "Forest");
    pickModes(a, 0);
    pickFromZone(a, forest);
    attack(game, a, [cheetah]);
    expect(life(game, B)).toBe(18);
    expect(zone(game, forest)).toBe("hand");
  });
});

describe("Loyal Retainers", () => {
  it("is sacrificed to return a legendary creature card", () => {
    const { game } = table();
    const retainers = spawn(game, "Loyal Retainers");
    const multani = toGraveyard(game, "Multani, Maro-Sorcerer");
    activate(game, retainers, 0, { targets: [ref(multani)] });
    expect(zone(game, multani)).toBe("battlefield");
    expect(graveyard(game)).toContain(retainers);
  });
});

describe("Dong Zhou, the Tyrant", () => {
  it("has an opponent's creature deal its power to its controller", () => {
    const { game, a } = table();
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(a, wurm);
    enter(game, "Dong Zhou, the Tyrant");
    expect(life(game, B)).toBe(20 - pt(game, wurm).power);
    expect(life(game, A)).toBe(20);
  });
});
