/**
 * Nemesis (NEM, B223), group A. One test per card whose behaviour is more
 * than a stat line or an exact copy of an already-tested pattern, on the
 * clause most likely to be wrong — fading most of all (rule 702.32a).
 */
import { describe, expect, it } from "vitest";

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
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";
import type { Game } from "../game.js";
import type { PlayerId } from "../primitives.js";

const permanentsOf = (game: Game, player: PlayerId): number =>
  game.battlefield.filter((id) => game.state.objects[id].controller === player).length;

describe("Skyshroud Ridgeback", () => {
  it("enters with two fade counters, loses one each upkeep, and is sacrificed when it can't", () => {
    const { game } = table();
    const beast = enter(game, "Skyshroud Ridgeback");
    expect(counters(game, beast, "fade")).toBe(2);
    toStep(game, "precombat-main");
    expect(counters(game, beast, "fade")).toBe(1);
    toStep(game, "precombat-main");
    expect(counters(game, beast, "fade")).toBe(0);
    expect(zone(game, beast)).toBe("battlefield");
    toStep(game, "precombat-main");
    expect(zone(game, beast)).toBe("graveyard");
  });
});

describe("Parallax Tide", () => {
  it("exiles a land for a fade counter and returns it to its owner when the Tide leaves", () => {
    const { game } = table();
    const tide = enter(game, "Parallax Tide");
    expect(counters(game, tide, "fade")).toBe(5);
    const [island] = lands(game, "Island", 1, B);
    activate(game, tide, 0, { targets: [ref(island)] });
    expect(counters(game, tide, "fade")).toBe(4);
    expect(zone(game, island)).toBe("exile");
    destroy(game, tide);
    const back = game.battlefield.filter((id) => game.state.objects[id].cardName === "Island");
    expect(back).toHaveLength(1);
    expect(controller(game, back[0])).toBe(B);
  });
});

describe("Parallax Dementia", () => {
  it("pumps the creature, then destroys it when fading sacrifices the Aura", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    const aura = toHand(game, "Parallax Dementia");
    cast(game, aura, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 4 });
    expect(counters(game, aura, "fade")).toBe(1);
    toStep(game, "precombat-main");
    expect(counters(game, aura, "fade")).toBe(0);
    expect(zone(game, bears)).toBe("battlefield");
    toStep(game, "precombat-main");
    expect(zone(game, aura)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Laccolith Whelp", () => {
  it("when blocked, may deal its power to a creature and then assigns no combat damage", () => {
    const { game, a, b } = table();
    const whelp = spawn(game, "Laccolith Whelp");
    const wall = spawn(game, "Wall of Wood", B);
    const bears = spawn(game, "Grizzly Bears", B);
    b.declareBlockersFn = () => [{ blocker: wall, attacker: whelp }];
    pickTargets(a, bears);
    pickModes(a, 0);
    attack(game, a, [whelp]);
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(game.state.objects[wall].damageMarked).toBe(0);
  });
});

describe("Belbe's Armor", () => {
  it("gives -X/+X", () => {
    const { game } = table();
    const armor = spawn(game, "Belbe's Armor");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 2);
    activate(game, armor, 0, { targets: [ref(bears)], x: 2 });
    expect(pt(game, bears)).toEqual({ power: 0, toughness: 4 });
  });
});

describe("Aether Barrier", () => {
  it("makes the caster of a creature spell sacrifice a permanent when they can't pay {1}", () => {
    const { game } = table();
    spawn(game, "Aether Barrier");
    toStep(game, "precombat-main", B);
    lands(game, "Forest", 2, B);
    const before = permanentsOf(game, B);
    cast(game, toHand(game, "Grizzly Bears", B), { player: B });
    // The Bears arrive and one permanent goes: the count is unchanged.
    expect(permanentsOf(game, B)).toBe(before);
  });
});

describe("Noble Stand", () => {
  it("gains 2 life for each creature you control that blocks", () => {
    const { game, a, b } = table();
    spawn(game, "Noble Stand");
    const w1 = spawn(game, "Wall of Wood");
    const w2 = spawn(game, "Wall of Wood");
    const x = spawn(game, "Grizzly Bears", B);
    const y = spawn(game, "Grizzly Bears", B);
    a.declareBlockersFn = () => [
      { blocker: w1, attacker: x },
      { blocker: w2, attacker: y },
    ];
    toStep(game, "precombat-main", B);
    attack(game, b, [x, y], A);
    expect(life(game, A)).toBe(24);
  });
});

describe("Phyrexian Driver", () => {
  it("gives every other Mercenary +1/+1, whoever controls it", () => {
    const { game } = table();
    const mine = spawn(game, "Misshapen Fiend");
    const theirs = spawn(game, "Misshapen Fiend", B);
    const bears = spawn(game, "Grizzly Bears");
    const driver = enter(game, "Phyrexian Driver");
    expect(pt(game, mine)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, driver)).toEqual({ power: 1, toughness: 1 });
  });
});
