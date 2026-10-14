/**
 * The order of replacement and prevention effects (rule 616.1): the affected
 * player — the one being dealt the damage or controlling the permanent, the
 * one gaining the life, the controller of the permanent getting the counters
 * — chooses which applies first. The engine chooses for them, the best order:
 * the least damage, the most +1/+1 counters (the fewest -1/-1), a life gain
 * turned to loss before anything grows it. A player who wants the other
 * order isn't asked (a known limitation, docs/engine-gaps.md).
 *
 * Also the additive counter replacements ("that many plus one" — Hardened
 * Scales and its kin) and the damage and life cards that came with them.
 */

import { describe, expect, it } from "vitest";

import { defineCard } from "../cards/define.js";
import { invalidateComputedCache } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { A, B, activate, cast, counters, lands, life, pt, ref, spawn, table, toHand, zone } from "./harness.js";

const BLIGHT_ENGINE = "Test Blight Engine";
const BLIGHT_TEXT =
  "If one or more -1/-1 counters would be put on a creature you control, that many plus one -1/-1 counters are put on it instead.";
const blightEngine = defineCard({
  name: BLIGHT_ENGINE,
  manaCost: "{0}",
  types: ["enchantment"],
  text: BLIGHT_TEXT,
  static: [
    {
      affects: { scope: "self" },
      replacement: { event: "would-add-counter", plus: 1, counterKind: "-1/-1", filter: { type: "creature" } },
      text: BLIGHT_TEXT,
    },
  ],
});

/** Alice casts Lightning Bolt at `target`. */
const bolt = (game: Game, target: PlayerId | ObjectId): void => {
  lands(game, "Mountain", 1);
  cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(target)] });
};

/** Alice casts Battlegrowth: a +1/+1 counter on `target`. */
const battlegrowth = (game: Game, target: ObjectId): void => {
  lands(game, "Forest", 1);
  cast(game, toHand(game, "Battlegrowth"), { targets: [ref(target)] });
};

/** Alice casts `name` for X, paid with Wastes and Forests. */
const castX = (game: Game, name: string, x: number, generic: number, green = 0): ObjectId => {
  lands(game, "Wastes", generic);
  lands(game, "Forest", green);
  const card = toHand(game, name);
  cast(game, card, { x });
  return game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === name)!;
};

describe("damage: the order dealing the least (616.1)", () => {
  it("a prevention shield applies before a doubler: Heal, then Bolt under Furnace of Rath", () => {
    const { game } = table();
    spawn(game, "Furnace of Rath", A);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Heal"), { targets: [ref(dreadmaw)] });
    // 3, less the shield's 1, doubled: 4 — not 3 doubled less 1 (5).
    bolt(game, dreadmaw);
    expect(game.state.objects[dreadmaw].damageMarked).toBe(4);
  });

  it("a plus applies after a doubler: Mechanized Warfare and Furnace of Rath", () => {
    const { game } = table();
    spawn(game, "Furnace of Rath", A);
    spawn(game, "Mechanized Warfare", A);
    // Bob orders them: 3 doubled plus 1 (7), not 3 plus 1 doubled (8).
    bolt(game, B);
    expect(life(game, B)).toBe(13);
  });

  it("Mechanized Warfare adds to damage to an opponent, not to its controller", () => {
    const { game } = table();
    spawn(game, "Mechanized Warfare", A);
    bolt(game, B);
    expect(life(game, B)).toBe(16);
    bolt(game, A);
    expect(life(game, A)).toBe(17);
  });

  it("Collective Inferno doubles damage from sources of the chosen type only", () => {
    const { game } = table();
    const inferno = spawn(game, "Collective Inferno", A);
    game.state.objects[inferno].chosenCreatureType = "Construct";
    invalidateComputedCache();
    // Walking Ballista is a Construct: its 1 damage is 2.
    const ballista = castX(game, "Walking Ballista", 1, 2);
    activate(game, ballista, 1, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    // Lightning Bolt isn't: 3.
    bolt(game, B);
    expect(life(game, B)).toBe(15);
  });
});

describe("counters: the order putting on the most +1/+1, the fewest -1/-1", () => {
  it("Hardened Scales and Doubling Season: X = 2 enters with (2 + 1) × 2, not 2 × 2 + 1", () => {
    const { game } = table();
    spawn(game, "Hardened Scales", A);
    spawn(game, "Doubling Season", A);
    const ballista = castX(game, "Walking Ballista", 2, 4);
    expect(counters(game, ballista)).toBe(6);
  });

  it("two additive replacements add two: Hardened Scales, Ozolith and Doubling Season on one counter", () => {
    const { game } = table();
    spawn(game, "Hardened Scales", A);
    spawn(game, "Ozolith, the Shattered Spire", A);
    spawn(game, "Doubling Season", A);
    const giant = spawn(game, "Hill Giant", A);
    battlegrowth(game, giant);
    expect(counters(game, giant)).toBe(6);
  });

  it("-1/-1 counters: doubled before the plus, the fewer", () => {
    const { game } = table();
    game.registry.register(blightEngine);
    spawn(game, BLIGHT_ENGINE, A);
    spawn(game, "Doubling Season", A);
    const wurm = spawn(game, "Craw Wurm", A);
    const spitter = spawn(game, "Fume Spitter", A);
    activate(game, spitter, 0, { targets: [ref(wurm)] });
    // 1 × 2 + 1 = 3, not (1 + 1) × 2 = 4, which kills the 6/4.
    expect(counters(game, wurm, "-1/-1")).toBe(3);
    expect(zone(game, wurm)).toBe("battlefield");
  });

  it("Hardened Scales doesn't touch -1/-1 counters, nor an opponent's creature", () => {
    const { game } = table();
    spawn(game, "Hardened Scales", A);
    const mine = spawn(game, "Hill Giant", A);
    const theirs = spawn(game, "Hill Giant", B);
    activate(game, spawn(game, "Fume Spitter", A), 0, { targets: [ref(mine)] });
    expect(counters(game, mine, "-1/-1")).toBe(1);
    battlegrowth(game, theirs);
    expect(counters(game, theirs)).toBe(1);
  });

  it("Benevolent Hydra adds to another creature's counters, not its own", () => {
    const { game } = table();
    const hydra = castX(game, "Benevolent Hydra", 2, 2, 2);
    expect(counters(game, hydra)).toBe(2);
    game.state.objects[hydra].summoningSick = false;
    // Another creature entering with counters gets one more (the 2022 ruling).
    const ballista = castX(game, "Walking Ballista", 1, 2);
    expect(counters(game, ballista)).toBe(2);
    // Its own ability moves one across: the Ballista gets two.
    activate(game, hydra, 0, { targets: [ref(ballista)] });
    expect(counters(game, hydra)).toBe(1);
    expect(counters(game, ballista)).toBe(4);
  });

  it("Mauhúr counts Orcs, Goblins and Armies — itself, not a Giant", () => {
    const { game } = table();
    const mauhur = spawn(game, "Mauhúr, Uruk-hai Captain", A);
    const giant = spawn(game, "Hill Giant", A);
    battlegrowth(game, mauhur);
    battlegrowth(game, giant);
    expect(counters(game, mauhur)).toBe(2);
    expect(counters(game, giant)).toBe(1);
  });

  it("Kami of Whispered Hopes adds to the counters on a permanent you control", () => {
    const { game } = table();
    const kami = spawn(game, "Kami of Whispered Hopes", A);
    battlegrowth(game, kami);
    expect(pt(game, kami).power).toBe(3);
  });

  it("Conclave Mentor: its controller gains life equal to its power as it died", () => {
    const { game } = table();
    const mentor = spawn(game, "Conclave Mentor", A);
    battlegrowth(game, mentor);
    expect(counters(game, mentor)).toBe(2);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Murder"), { targets: [ref(mentor)] });
    expect(zone(game, mentor)).toBe("graveyard");
    // A 4/4 as it last existed.
    expect(life(game, A)).toBe(24);
  });
});

describe("life: a gain turned to loss before anything grows it", () => {
  it("Tainted Remedy and Boon Reflection: Bob loses what he would have gained, not twice that", () => {
    const { game } = table();
    spawn(game, "Tainted Remedy", A);
    spawn(game, "Boon Reflection", B);
    const giant = spawn(game, "Hill Giant", B);
    lands(game, "Plains", 1);
    // Swords to Plowshares: Bob would gain 3 life.
    cast(game, toHand(game, "Swords to Plowshares"), { targets: [ref(giant)] });
    expect(life(game, B)).toBe(17);
  });

  it("Tainted Remedy leaves its controller's own gains alone", () => {
    const { game } = table();
    spawn(game, "Tainted Remedy", A);
    const giant = spawn(game, "Hill Giant", A);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Swords to Plowshares"), { targets: [ref(giant)] });
    expect(life(game, A)).toBe(23);
  });
});
