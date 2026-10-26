/**
 * Avacyn Restored and Dark Ascension (AVR, DKA; B185), group A. One test per
 * card whose behaviour is more than a stat line, on the clause most likely to
 * be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  graveyard,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const libraryCount = (game: ReturnType<typeof table>["game"], player = B): number =>
  game.state.zones.perPlayer[player].library.length;

describe("Increasing Confusion", () => {
  it("mills X from hand, twice X when cast with flashback", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const before = libraryCount(game);
    const card = toHand(game, "Increasing Confusion");
    cast(game, card, { x: 2, targets: [ref(B)] });
    expect(libraryCount(game)).toBe(before - 2);
    expect(zone(game, card)).toBe("graveyard");
    cast(game, card, { x: 2, targets: [ref(B)], via: "flashback" });
    expect(libraryCount(game)).toBe(before - 2 - 4);
    expect(zone(game, card)).toBe("exile");
  });
});

describe("Beguiler of Wills", () => {
  it("steals a creature whose power is at most the number of creatures you control", () => {
    const { game } = table();
    const beguiler = spawn(game, "Beguiler of Wills");
    spawn(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    expect(() => activate(game, beguiler, 0, { targets: [ref(giant)] })).toThrow();
    activate(game, beguiler, 0, { targets: [ref(bears)] });
    expect(game.state.objects[bears].controller).toBe(A);
  });
});

describe("Havengul Runebinder", () => {
  it("exiles a creature card, makes a Zombie and grows every Zombie, the new one too", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const binder = spawn(game, "Havengul Runebinder");
    const old = spawn(game, "Zombie Token");
    const corpse = toGraveyard(game, "Grizzly Bears");
    activate(game, binder, 0);
    expect(zone(game, corpse)).toBe("exile");
    const zombies = named(game, "Zombie Token", A);
    expect(zombies).toHaveLength(2);
    for (const z of zombies) expect(counters(game, z)).toBe(1);
    expect(counters(game, old)).toBe(1);
  });
});

describe("Thatcher Revolt", () => {
  it("makes three hasty red Humans, sacrificed at the next end step", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Thatcher Revolt"));
    const humans = named(game, "Red Human Token (Haste)", A);
    expect(tokensNamed(game, "Red Human Token (Haste)", A)).toBe(3);
    expect(keywords(game, humans[0]).has("haste")).toBe(true);
    nextTurn(game);
    expect(tokensNamed(game, "Red Human Token (Haste)", A)).toBe(0);
  });
});

describe("Kessig Malcontents", () => {
  it("deals damage equal to the Humans you control, itself included", () => {
    const { game, a } = table();
    spawn(game, "Havengul Runebinder"); // a Human
    spawn(game, "Grizzly Bears"); // not one
    pickTargets(a, B);
    enter(game, "Kessig Malcontents");
    expect(life(game, B)).toBe(18);
  });
});

describe("Demonic Rising", () => {
  it("makes a Demon at your end step only with exactly one creature", () => {
    const { game } = table();
    spawn(game, "Demonic Rising");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    toStep(game, "cleanup");
    expect(tokensNamed(game, "5/5 Demon Token", A)).toBe(0);
    const { game: g2 } = table();
    spawn(g2, "Demonic Rising");
    spawn(g2, "Grizzly Bears");
    toStep(g2, "cleanup");
    expect(tokensNamed(g2, "5/5 Demon Token", A)).toBe(1);
  });
});

describe("Corpse Traders", () => {
  it("sacrifices a creature to make the opponent discard a card you choose", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const traders = spawn(game, "Corpse Traders");
    const bears = spawn(game, "Grizzly Bears");
    const gyBefore = graveyard(game, B).length;
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: traders,
      abilityIndex: 0,
      targets: [ref(B)],
      sacrifice: bears,
    });
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(zone(game, bears)).toBe("graveyard");
    expect(graveyard(game, B).length).toBe(gyBefore + 1);
  });
});

describe("Gang of Devils", () => {
  it("deals 3 damage divided among its targets when it dies", () => {
    const { game, a } = table();
    const devils = spawn(game, "Gang of Devils");
    pickTargets(a, B);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(devils)]);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0 && s.awaiting === null && s.pendingTriggers.length === 0);
    expect(life(game, B)).toBe(17);
  });
});

describe("Fettergeist", () => {
  it("is sacrificed at upkeep when you can't pay {1} per other creature", () => {
    const { game } = table();
    const geist = spawn(game, "Fettergeist");
    spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    lands(game, "Island", 1);
    nextTurn(game);
    expect(zone(game, geist)).toBe("battlefield");
    nextTurn(game);
    expect(zone(game, geist)).toBe("graveyard");
  });
});

describe("Wildwood Geist", () => {
  it("is 5/5 on your turn and 3/3 on others'", () => {
    const { game } = table();
    const geist = spawn(game, "Wildwood Geist");
    expect(pt(game, geist)).toEqual({ power: 5, toughness: 5 });
    nextTurn(game);
    expect(pt(game, geist)).toEqual({ power: 3, toughness: 3 });
  });
});
