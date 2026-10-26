/**
 * Magic 2010 and Alara Reborn, group D — the clause of each card most likely
 * to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
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
  types,
  zone,
} from "./harness.js";

function cycle(game: Game, card: ObjectId): void {
  const why = game.canDispatch({ type: "cycle", player: A, card });
  if (why !== null) throw new Error(`cycle refused: ${why}`);
  game.dispatch({ type: "cycle", player: A, card });
  settle(game);
}

describe("Djinn of Wishes", () => {
  it("enters with three wish counters; the revealed card may be cast for free", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    const djinn = enter(game, "Djinn of Wishes");
    expect(counters(game, djinn, "wish")).toBe(3);
    const wurm = toLibrary(game, "Craw Wurm");
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts.find((c) => c.card === wurm);
      if (way === undefined) return null;
      return { type: "cast-spell", player: A, card: wurm, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    activate(game, djinn);
    expect(counters(game, djinn, "wish")).toBe(2);
    expect(zone(game, wurm)).toBe("battlefield");
  });

  it("a card not played is exiled", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const djinn = enter(game, "Djinn of Wishes");
    const wurm = toLibrary(game, "Craw Wurm");
    activate(game, djinn);
    expect(zone(game, wurm)).toBe("exile");
  });
});

describe("Awakener Druid", () => {
  it("an opponent's Forest becomes a 4/5 green Treefolk land creature while the Druid stays", () => {
    const { game, a } = table();
    const forest = spawn(game, "Forest", B);
    pickTargets(a, forest);
    const druid = enter(game, "Awakener Druid");
    expect(types(game, forest)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(pt(game, forest)).toEqual({ power: 4, toughness: 5 });
    destroy(game, druid);
    expect(types(game, forest)).not.toContain("creature");
  });
});

describe("Lightwielder Paladin", () => {
  it("combat damage to a player lets it exile a black permanent that player controls", () => {
    const { game, a } = table();
    const paladin = spawn(game, "Lightwielder Paladin");
    const corpse = spawn(game, "Walking Corpse", B);
    pickTargets(a, corpse);
    pickModes(a, 0);
    attack(game, a, [paladin]);
    expect(life(game, B)).toBe(16);
    expect(zone(game, corpse)).toBe("exile");
  });
});

describe("Karrthus, Tyrant of Jund", () => {
  it("takes every Dragon, untaps them, and gives the others haste", () => {
    const { game } = table();
    const shivan = spawn(game, "Shivan Dragon", B, { tapped: true });
    enter(game, "Karrthus, Tyrant of Jund");
    expect(controller(game, shivan)).toBe(A);
    expect(game.state.objects[shivan].tapped).toBe(false);
    expect(keywords(game, shivan).has("haste")).toBe(true);
  });
});

describe("Spellbreaker Behemoth", () => {
  it("a creature spell with power 5 or greater can't be countered; a smaller one can", () => {
    const { game } = table();
    spawn(game, "Spellbreaker Behemoth");
    lands(game, "Forest", 8);
    const wurm = toHand(game, "Craw Wurm");
    cast(game, wurm, { settle: false });
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(wurm)]);
    settle(game);
    expect(zone(game, wurm)).toBe("battlefield");
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    game.debugApplyEffect(B, { kind: "counter", target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Anathemancer", () => {
  it("deals damage equal to the target player's nonbasic lands", () => {
    const { game, a } = table();
    spawn(game, "Bloodfell Caves", B);
    spawn(game, "Bloodfell Caves", B);
    spawn(game, "Forest", B);
    spawn(game, "Bloodfell Caves", A);
    pickTargets(a, B);
    enter(game, "Anathemancer");
    expect(life(game, B)).toBe(18);
  });
});

describe("Crystallization", () => {
  it("the enchanted creature is exiled when it becomes a target", () => {
    const { game } = table();
    spawn(game, "Plains");
    spawn(game, "Island");
    spawn(game, "Mountain");
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Crystallization"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    cast(game, toHand(game, "Shock"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("Vengeful Rebirth", () => {
  it("a nonland card returned deals its mana value to any target, and the spell is exiled", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    lands(game, "Forest", 3);
    const wurm = toGraveyard(game, "Craw Wurm");
    const rebirth = toHand(game, "Vengeful Rebirth");
    cast(game, rebirth, { targets: [ref(wurm), ref(B)] });
    expect(zone(game, wurm)).toBe("hand");
    expect(life(game, B)).toBe(14);
    expect(zone(game, rebirth)).toBe("exile");
  });

  it("a land card returned deals no damage", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    lands(game, "Forest", 3);
    const forest = toGraveyard(game, "Forest");
    cast(game, toHand(game, "Vengeful Rebirth"), { targets: [ref(forest), ref(B)] });
    expect(zone(game, forest)).toBe("hand");
    expect(life(game, B)).toBe(20);
  });
});

describe("Knotvine Paladin", () => {
  it("gets +1/+1 for each untapped creature, counted after attacking", () => {
    const { game, a } = table();
    const paladin = spawn(game, "Knotvine Paladin");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    attack(game, a, [paladin]);
    expect(pt(game, paladin)).toEqual({ power: 4, toughness: 4 });
    expect(life(game, B)).toBe(16);
  });
});

describe("Bant Sureblade and Grixis Grimblade", () => {
  it("each needs another multicolored permanent", () => {
    const { game } = table();
    const sureblade = spawn(game, "Bant Sureblade");
    expect(pt(game, sureblade)).toEqual({ power: 2, toughness: 1 });
    expect(keywords(game, sureblade).has("first-strike")).toBe(false);
    const grimblade = spawn(game, "Grixis Grimblade");
    expect(pt(game, sureblade)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, sureblade).has("first-strike")).toBe(true);
    expect(pt(game, grimblade)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, grimblade).has("deathtouch")).toBe(true);
  });
});

describe("Jund Sojourners", () => {
  it("cycling it may deal 1 damage, and it still draws", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    pickTargets(a, B);
    pickModes(a, 0);
    const card = toHand(game, "Jund Sojourners");
    const before = hand(game).length;
    cycle(game, card);
    expect(life(game, B)).toBe(19);
    expect(hand(game).length).toBe(before);
  });

  it("dying, it may deal 1 damage", () => {
    const { game, a } = table();
    const sojourners = spawn(game, "Jund Sojourners");
    pickTargets(a, B);
    pickModes(a, 0);
    destroy(game, sojourners);
    expect(life(game, B)).toBe(19);
  });
});

describe("Vedalken Ghoul", () => {
  it("becoming blocked makes the defending player lose 4 life", () => {
    const { game, a, b } = table();
    const ghoul = spawn(game, "Vedalken Ghoul");
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: ghoul }];
    attack(game, a, [ghoul]);
    expect(life(game, B)).toBe(16);
  });
});

describe("Glassdust Hulk", () => {
  it("another artifact entering gives it +1/+1 and can't be blocked", () => {
    const { game } = table();
    const hulk = spawn(game, "Glassdust Hulk");
    enter(game, "Ornithopter");
    expect(pt(game, hulk)).toEqual({ power: 4, toughness: 5 });
    expect(keywords(game, hulk).has("unblockable")).toBe(true);
  });
});
