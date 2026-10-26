/**
 * The set walk, Coldsnap (CSP), batch 1, group A (2026-10-26): Adarkar
 * Valkyrie's delayed reanimation, the snow-mana activations, the counting
 * CDAs, Phyrexian Etchings' age counters read after it left, Stalking Yeti's
 * two-way damage and Tresserhorn Skyknight's first-strike-only prevention.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  controller,
  destroy,
  enter,
  grant,
  hand,
  keywords,
  lands,
  life,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toStep,
  zone,
} from "./harness.js";

/** Whether alice may activate `source`'s ability `index` targeting `target`. */
const canTarget = (game: Game, source: ObjectId, index: number, target: ObjectId): boolean =>
  game.canDispatch({ type: "activate-ability", player: A, source, abilityIndex: index, targets: [ref(target)] } as Action) ===
  null;

describe("Adarkar Valkyrie", () => {
  it("returns the targeted creature under your control when it dies this turn, and can't target itself", () => {
    const { game } = table();
    const valkyrie = spawn(game, "Adarkar Valkyrie");
    const bears = spawn(game, "Grizzly Bears", B);
    expect(canTarget(game, valkyrie, 0, valkyrie)).toBe(false);
    activate(game, valkyrie, 0, { targets: [ref(bears)] });
    destroy(game, bears);
    const back = game.battlefield.find((id) => game.state.objects[id].cardName === "Grizzly Bears");
    expect(back).toBeDefined();
    expect(controller(game, back!)).toBe(A);
  });
});

describe("Mouth of Ronom", () => {
  it("pays {S} from a snow land and deals 4 damage to the target", () => {
    const { game } = table();
    const mouth = spawn(game, "Mouth of Ronom");
    lands(game, "Wastes", 4);
    lands(game, "Snow-Covered Swamp", 1);
    const giant = spawn(game, "Hill Giant", B);
    activate(game, mouth, 1, { targets: [ref(giant)] });
    expect(zone(game, mouth)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("can't be activated with no snow mana", () => {
    const { game } = table();
    const mouth = spawn(game, "Mouth of Ronom");
    lands(game, "Wastes", 6);
    const giant = spawn(game, "Hill Giant", B);
    expect(() => activate(game, mouth, 1, { targets: [ref(giant)] })).toThrow();
  });
});

describe("Krovikan Mist", () => {
  it("counts every Illusion on the battlefield, each player's", () => {
    const { game } = table();
    const mist = spawn(game, "Krovikan Mist");
    spawn(game, "Krovikan Mist", B);
    spawn(game, "Grizzly Bears");
    expect(pt(game, mist)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Wilderness Elemental", () => {
  it("counts only nonbasic lands your opponents control", () => {
    const { game } = table();
    const elemental = spawn(game, "Wilderness Elemental");
    lands(game, "Mouth of Ronom", 2, B);
    lands(game, "Snow-Covered Swamp", 1, B);
    lands(game, "Mouth of Ronom", 1, A);
    expect(pt(game, elemental)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Phyrexian Etchings", () => {
  it("draws a card per age counter at your end step", () => {
    const { game } = table();
    const etchings = spawn(game, "Phyrexian Etchings");
    game.state.objects[etchings].counters.age = 2;
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(before + 2);
  });

  it("loses 2 life per age counter it had as it was put into a graveyard", () => {
    const { game } = table();
    const etchings = spawn(game, "Phyrexian Etchings");
    game.state.objects[etchings].counters.age = 3;
    destroy(game, etchings);
    expect(zone(game, etchings)).toBe("graveyard");
    expect(life(game, A)).toBe(14);
  });
});

describe("Stalking Yeti", () => {
  it("deals damage equal to its power to the target, which deals its power back", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const yeti = enter(game, "Stalking Yeti");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, yeti)).toBe("battlefield");
    expect(game.state.objects[yeti].damageMarked).toBe(2);
  });

  it("does nothing if it left the battlefield before the trigger resolved", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, giant);
    const yeti = enter(game, "Stalking Yeti", A, { settle: false });
    game.debugApplyEffect(B, { kind: "return-to-hand", target: 0 }, [ref(yeti)]);
    settle(game);
    expect(zone(game, yeti)).toBe("hand");
    expect(game.state.objects[giant].damageMarked).toBe(0);
  });

  it("returns to hand only at sorcery speed, paying {S}", () => {
    const { game } = table();
    const yeti = spawn(game, "Stalking Yeti");
    lands(game, "Wastes", 2);
    lands(game, "Snow-Covered Mountain", 1);
    activate(game, yeti, 0);
    expect(zone(game, yeti)).toBe("hand");
  });
});

describe("Ohran Yeti", () => {
  it("targets only snow creatures", () => {
    const { game } = table();
    const yeti = spawn(game, "Ohran Yeti");
    const other = spawn(game, "Stalking Yeti", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 2);
    lands(game, "Snow-Covered Mountain", 1);
    expect(canTarget(game, yeti, 0, bears)).toBe(false);
    expect(canTarget(game, yeti, 0, yeti)).toBe(true);
    activate(game, yeti, 0, { targets: [ref(other)] });
    expect(keywords(game, other).has("first-strike")).toBe(true);
  });
});

describe("Tresserhorn Skyknight", () => {
  it("prevents damage from a first striker (Kjeldoran Gargoyle gains nothing) but not from a double striker", () => {
    const { game, a, b } = table();
    const gargoyle = spawn(game, "Kjeldoran Gargoyle");
    const knight = spawn(game, "Tresserhorn Skyknight", B);
    b.declareBlockersFn = () => [{ blocker: knight, attacker: gargoyle }];
    attack(game, a, [gargoyle]);
    expect(game.state.objects[knight].damageMarked).toBe(0);
    expect(life(game, A)).toBe(20);

    const { game: g2, a: a2, b: b2 } = table();
    const bears = spawn(g2, "Grizzly Bears");
    grant(g2, bears, "double-strike");
    const knight2 = spawn(g2, "Tresserhorn Skyknight", B);
    b2.declareBlockersFn = () => [{ blocker: knight2, attacker: bears }];
    attack(g2, a2, [bears]);
    expect(zone(g2, knight2)).toBe("graveyard");
  });
});

describe("Kjeldoran Gargoyle", () => {
  it("gains life equal to the damage it deals", () => {
    const { game, a } = table();
    const gargoyle = spawn(game, "Kjeldoran Gargoyle");
    attack(game, a, [gargoyle]);
    settle(game);
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
  });
});
