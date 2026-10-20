/**
 * Adventures in the Forgotten Realms and its Commander set, group e: Bard
 * Class, Monk Class, Storvald, Frost Giant Jarl, Varis, Silverymoon Ranger,
 * Wandering Troubadour, True Polymorph, Circle of the Moon Druid, Leather
 * Armor, Baleful Beholder and Herald of Hadar — the clause of each most likely
 * to be wrong. Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  activate,
  cast,
  counters,
  destroy,
  enter,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pickTargets,
  pt,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const ventures = (game: Game, player = A): number =>
  game.state.eventLog.filter((e) => e.type === "ventured" && e.player === player).length;

/** Enter Lost Mine of Phandelver whenever asked, and take the first room at a fork. */
const intoLostMine = (seat: ScriptedController): void => {
  seat.chooseVentureFn = (_view, offer) =>
    offer.dungeons !== undefined ? { dungeon: "Lost Mine of Phandelver" } : { room: offer.rooms![0]! };
};

/** Gain level `n` of the Class `cls` (its level bar, paid from alice's lands). */
const levelUp = (game: Game, cls: ObjectId, n: number): void => {
  const index = game.registry
    .get(game.state.objects[cls].cardName)
    .activated.findIndex((a) => a.effect?.kind === "gain-class-level" && a.effect.level === n);
  activate(game, cls, index);
};

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card);

describe("Bard Class", () => {
  it("level 1: legendary creatures you control enter with a +1/+1 counter, others don't", () => {
    const { game } = table();
    spawn(game, "Bard Class");
    lands(game, "Forest", 5);
    const varis = toHand(game, "Varis, Silverymoon Ranger");
    cast(game, varis);
    expect(counters(game, varis)).toBe(1);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(counters(game, bears)).toBe(0);
  });

  it("level 2 takes {R}{G} off legendary spells, coloured mana only; level 3 exiles two to play", () => {
    const { game } = table();
    const bard = spawn(game, "Bard Class");
    lands(game, "Mountain", 1);
    lands(game, "Forest", 1);
    levelUp(game, bard, 2);
    // Varis is {1}{G}{G}: {1}{G} now — a Forest and a Wastes pay it, which
    // they couldn't if the reduction had come off its generic mana.
    spawn(game, "Forest");
    spawn(game, "Wastes");
    const varis = toHand(game, "Varis, Silverymoon Ranger");
    expect(castable(game, varis)).toBe(true);
    cast(game, varis);
    expect(zone(game, varis)).toBe("battlefield");
    // A nonlegendary spell gets nothing: Grizzly Bears still needs {1}{G}.
    lands(game, "Wastes", 2);
    const bears = toHand(game, "Grizzly Bears");
    expect(castable(game, bears)).toBe(false);

    lands(game, "Mountain", 2);
    lands(game, "Forest", 1);
    lands(game, "Wastes", 1);
    levelUp(game, bard, 3);
    const exiledBefore = game.state.zones.shared.exile.length;
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Varis, Silverymoon Ranger"));
    expect(game.state.zones.shared.exile.length).toBe(exiledBefore + 2);
  });
});

describe("Monk Class", () => {
  it("level 3: the exiled card is castable only once you've cast another spell this turn", () => {
    const { game, a } = table();
    const monk = spawn(game, "Monk Class");
    lands(game, "Plains", 2);
    lands(game, "Island", 2);
    lands(game, "Wastes", 1);
    pickTargets(a, null);
    levelUp(game, monk, 2);
    levelUp(game, monk, 3);
    const bears = toLibrary(game, "Grizzly Bears");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, bears)).toBe("exile");
    toStep(game, "precombat-main");
    lands(game, "Forest", 2);
    expect(castable(game, bears)).toBe(false);
    cast(game, toHand(game, "Ornithopter"));
    expect(castable(game, bears)).toBe(true);
    cast(game, bears, { via: "impulse" });
    expect(zone(game, bears)).toBe("battlefield");
  });

  it("level 2: returns up to one nonland permanent as it's gained", () => {
    const { game, a } = table();
    const monk = spawn(game, "Monk Class");
    lands(game, "Plains", 1);
    lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    levelUp(game, monk, 2);
    expect(zone(game, bears)).toBe("hand");
  });
});

describe("Storvald, Frost Giant Jarl", () => {
  it("both modes on the same creature: 7/7, then 1/1 in the listed order", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0, 1);
    pickTargets(a, bears, bears);
    enter(game, "Storvald, Frost Giant Jarl");
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
  });

  it("one mode: target creature has base 7/7, counters still on top", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[bears].counters["+1/+1"] = 1;
    pickModes(a, 0);
    pickTargets(a, bears);
    enter(game, "Storvald, Frost Giant Jarl");
    expect(pt(game, bears)).toEqual({ power: 8, toughness: 8 });
    nextTurn(game);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Varis, Silverymoon Ranger", () => {
  it("ventures once each turn for creature spells, and makes a Wolf on completing a dungeon", () => {
    const { game, a } = table();
    intoLostMine(a);
    spawn(game, "Varis, Silverymoon Ranger");
    cast(game, toHand(game, "Ornithopter"));
    cast(game, toHand(game, "Ornithopter"));
    expect(ventures(game)).toBe(1);
    for (let i = 0; i < 3; i += 1) {
      game.debugApplyEffect(A, { kind: "venture" });
      settle(game);
    }
    expect(game.state.players[A].completedDungeons).toEqual(["Lost Mine of Phandelver"]);
    expect(tokensNamed(game, "Wolf Token", A)).toBe(1);
  });
});

describe("Wandering Troubadour", () => {
  it("ventures at your end step only if a land entered under your control this turn", () => {
    const { game, a } = table();
    intoLostMine(a);
    spawn(game, "Wandering Troubadour");
    toStep(game, "end");
    settle(game);
    expect(ventures(game)).toBe(0);
    toStep(game, "precombat-main");
    const forest = toHand(game, "Forest");
    game.dispatch({ type: "play-land", player: A, card: forest });
    toStep(game, "end");
    settle(game);
    expect(ventures(game)).toBe(1);
  });
});

describe("True Polymorph", () => {
  it("the first target becomes a copy of the second", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "True Polymorph"), { targets: [{ kind: "object", object: bears }, { kind: "object", object: giant }] });
    expect(game.state.objects[bears].zone).toBe("battlefield");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });

  it("does nothing once the second target is gone (the ruling)", () => {
    const { game } = table();
    lands(game, "Island", 6);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "True Polymorph"), {
      targets: [{ kind: "object", object: bears }, { kind: "object", object: giant }],
      settle: false,
    });
    destroy(game, giant);
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Circle of the Moon Druid", () => {
  it("is a 4/2 Bear only during your turn", () => {
    const { game } = table();
    const druid = spawn(game, "Circle of the Moon Druid");
    expect(pt(game, druid)).toEqual({ power: 4, toughness: 2 });
    expect(subtypes(game, druid)).toEqual(["Bear"]);
    nextTurn(game);
    expect(pt(game, druid)).toEqual({ power: 2, toughness: 4 });
    expect([...subtypes(game, druid)].sort()).toEqual(["Druid", "Elf", "Human"]);
  });
});

describe("Leather Armor", () => {
  it("equip {0} only once each turn; the creature gets +0/+1", () => {
    const { game, a } = table();
    const armor = spawn(game, "Leather Armor");
    const bears = spawn(game, "Grizzly Bears");
    const hill = spawn(game, "Hill Giant");
    pickTargets(a, bears);
    activate(game, armor, 0, { targets: [{ kind: "object", object: bears }] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 3 });
    expect(() => activate(game, armor, 0, { targets: [{ kind: "object", object: hill }] })).toThrow();
  });
});

describe("Baleful Beholder", () => {
  it("Antimagic Cone: each opponent sacrifices an enchantment; Fear Ray: menace", () => {
    const { game, a } = table({ players: 3 });
    const bPacifism = spawn(game, "Glorious Anthem", B);
    const cPacifism = spawn(game, "Glorious Anthem", C);
    const mine = spawn(game, "Glorious Anthem");
    pickModes(a, 0);
    enter(game, "Baleful Beholder");
    expect(zone(game, bPacifism)).toBe("graveyard");
    expect(zone(game, cPacifism)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");

    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 1);
    enter(game, "Baleful Beholder");
    expect(keywords(game, bears).has("menace")).toBe(true);
  });
});

describe("Herald of Hadar", () => {
  it("the d20 row that holds the roll", () => {
    for (const seed of [1, 2, 3, 4, 5, 6]) {
      const { game } = table({ seed });
      const herald = spawn(game, "Herald of Hadar");
      lands(game, "Swamp", 6);
      activate(game, herald);
      const total = game.state.lastRoll!.total;
      expect(life(game, B)).toBe(18);
      expect(life(game, A)).toBe(total <= 9 ? 20 : 22);
      expect(tokensNamed(game, "Treasure Token", A)).toBe(total === 20 ? 2 : 0);
    }
  });
});
