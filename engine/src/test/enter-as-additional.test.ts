/**
 * What a put-onto-battlefield says the permanent is, in addition to its own
 * characteristics, in place as it enters (`EnterTypes` — rules 611.2c,
 * 614.12): colours and subtypes (Rise from the Grave's "a black Zombie in
 * addition to its other colors and types"), card types with a base P/T
 * (Relive the Past's "5/5 Elemental creatures in addition to their other
 * types"), keywords (Excava's "a 1/1 Spirit creature with flying"), and all
 * of it only "if it's a creature" (Lim-Dûl the Necromancer).
 */

import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  attack,
  cast,
  controller,
  counters,
  destroy,
  keywords,
  lands,
  life,
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

const colors = (game: Game, id: ObjectId): ReadonlySet<string> =>
  computeCharacteristics(game.state, game.registry, id).colors;

describe("Rise from the Grave — colours and subtypes in addition", () => {
  it("puts another player's creature card onto the battlefield as a black Zombie, keeping its own", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const bears = toGraveyard(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Rise from the Grave"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect([...colors(game, bears)].sort()).toEqual(["B", "G"]);
    expect(subtypes(game, bears)).toContain("Bear");
    expect(subtypes(game, bears)).toContain("Zombie");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Relive the Past — card types and base P/T in addition", () => {
  it("returns an artifact, a land and an enchantment at once, each a 5/5 Elemental creature", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    lands(game, "Plains", 3);
    const ring = toGraveyard(game, "Sol Ring");
    const forest = toGraveyard(game, "Forest");
    const anthem = toGraveyard(game, "Glorious Anthem");
    cast(game, toHand(game, "Relive the Past"), { targets: [ref(ring), ref(forest), ref(anthem)] });
    for (const id of [ring, forest, anthem]) {
      expect(zone(game, id)).toBe("battlefield");
      expect(types(game, id)).toContain("creature");
      expect(subtypes(game, id)).toContain("Elemental");
      // Base 5/5 (layer 7b), and Glorious Anthem's +1/+1 (7c) over it —
      // the Anthem itself is one of the creatures it pumps.
      expect(pt(game, id)).toEqual({ power: 6, toughness: 6 });
    }
    // Each keeps its own types.
    expect(types(game, ring)).toContain("artifact");
    expect(types(game, forest)).toContain("land");
    expect(subtypes(game, forest)).toContain("Forest");
    expect(types(game, anthem)).toContain("enchantment");
  });

  it("returns only what was chosen", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    lands(game, "Plains", 3);
    const forest = toGraveyard(game, "Forest");
    cast(game, toHand(game, "Relive the Past"), { targets: [null, ref(forest), null] });
    expect(zone(game, forest)).toBe("battlefield");
    expect(pt(game, forest)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Excava, the Risen Past — keywords in addition, seen as it enters", () => {
  it("returns a noncreature artifact as a 1/1 Spirit artifact creature with flying and a finality counter", () => {
    const { game, a } = table();
    const excava = spawn(game, "Excava, the Risen Past");
    spawn(game, "Soul Warden");
    const ring = toGraveyard(game, "Sol Ring");
    pickTargets(a, ring);
    const before = life(game);
    attack(game, a, [excava]);
    expect(zone(game, ring)).toBe("battlefield");
    expect(types(game, ring)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(subtypes(game, ring)).toContain("Spirit");
    expect(pt(game, ring)).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, ring).has("flying")).toBe(true);
    expect(counters(game, ring, "finality")).toBe(1);
    // Soul Warden saw a creature enter: it was one from the start. (Excava's
    // 3 combat damage to Bob doesn't touch Alice's life.)
    expect(life(game)).toBe(before + 1);
  });

  it("makes a creature card a 1/1 that keeps its creature types", () => {
    const { game, a } = table();
    const excava = spawn(game, "Excava, the Risen Past");
    const elves = toGraveyard(game, "Llanowar Elves");
    pickTargets(a, elves);
    attack(game, a, [excava]);
    expect(zone(game, elves)).toBe("battlefield");
    expect(subtypes(game, elves)).toEqual(expect.arrayContaining(["Elf", "Druid", "Spirit"]));
    expect(pt(game, elves)).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, elves).has("flying")).toBe(true);
  });
});

describe("Lim-Dûl the Necromancer — only if it's a creature", () => {
  it("returns an opponent's creature that died as a Zombie under your control", () => {
    const { game, a } = table();
    spawn(game, "Lim-Dûl the Necromancer");
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    a.chooseModesFn = () => [0];
    destroy(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(subtypes(game, bears)).toEqual(expect.arrayContaining(["Bear", "Zombie"]));
  });

  it("judges the creature as it enters: a noncreature put there gets none of it", () => {
    const put = (ifCreature: boolean): { game: Game; ring: ObjectId } => {
      const { game } = table();
      const ring = toGraveyard(game, "Sol Ring");
      const effect: EffectSpec = {
        kind: "put-onto-battlefield",
        target: 0,
        enterAs: { addSubtypes: ["Zombie"], ...(ifCreature ? { ifCreature: true as const } : {}) },
      };
      game.debugApplyEffect(A, effect, [ref(ring)]);
      expect(zone(game, ring)).toBe("battlefield");
      // Made a creature afterwards: a Zombie only if the entry made it one.
      game.debugApplyEffect(
        A,
        { kind: "animate", target: 0, power: 1, toughness: 1, addTypes: ["creature"], addSubtypes: [], duration: "permanent" },
        [ref(ring)],
      );
      return { game, ring };
    };
    const gated = put(true);
    expect(subtypes(gated.game, gated.ring)).not.toContain("Zombie");
    const ungated = put(false);
    expect(subtypes(ungated.game, ungated.ring)).toContain("Zombie");
  });
});

describe("colours set rather than added", () => {
  it("\"That creature is black\" (Chainer) replaces its colours as it enters", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears", B);
    game.debugApplyEffect(
      A,
      {
        kind: "put-onto-battlefield",
        target: 0,
        underYourControl: true,
        enterAs: { setColors: ["B"], addSubtypes: ["Nightmare"] },
      },
      [ref(bears)],
    );
    expect([...colors(game, bears)]).toEqual(["B"]);
    expect(subtypes(game, bears)).toEqual(expect.arrayContaining(["Bear", "Nightmare"]));
  });
});
