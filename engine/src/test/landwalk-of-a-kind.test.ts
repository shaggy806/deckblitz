import { describe, expect, it } from "vitest";

import { canBlock, combatCreatures } from "../bot/combat-math.js";
import { computeCharacteristics } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  table,
  toHand,
  toStep,
} from "./harness.js";

/**
 * Landwalk of a kind no keyword names (rule 702.14a, c): a land as a filter on
 * `StaticAbility.landwalk`, or the land type a permanent chose. The Bazaar of
 * Baghdad here is a nonbasic land with no land type; the Darksteel Citadel an
 * artifact land.
 */

/** Whether the block offer lets `blocker` block `attacker`. A second attacker
 * has `defender` asked to block at all. */
const canBeBlockedBy = (game: Game, seat: ReturnType<typeof table>["a"], attacker: ObjectId, blocker: ObjectId, defender: PlayerId = B): boolean => {
  const offer = blockOffer(game, seat, [attacker, spawn(game, "Hill Giant", A)], defender);
  return offer.eligible.some((b) => b.blocker === blocker && b.canBlock.includes(attacker));
};

const walkers = (game: Game, id: ObjectId): readonly unknown[] =>
  computeCharacteristics(game.state, registryOf(game), id).landwalk;

describe("nonbasic landwalk (Dryad Sophisticate)", () => {
  it("can't be blocked while the defending player controls a nonbasic land", () => {
    const { game, a } = table();
    const dryad = spawn(game, "Dryad Sophisticate", A);
    const blocker = spawn(game, "Grizzly Bears", B);
    spawn(game, "Bazaar of Baghdad", B);
    expect(keywords(game, dryad).has("landwalk")).toBe(true);
    expect(canBeBlockedBy(game, a, dryad, blocker)).toBe(false);
  });

  it("is blocked as usual while they control only basics", () => {
    const { game, a } = table();
    const dryad = spawn(game, "Dryad Sophisticate", A);
    const blocker = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 2, B);
    expect(canBeBlockedBy(game, a, dryad, blocker)).toBe(true);
  });

  it("reads the defending player's lands, not its controller's", () => {
    const { game, a } = table();
    const dryad = spawn(game, "Dryad Sophisticate", A);
    const blocker = spawn(game, "Grizzly Bears", B);
    spawn(game, "Bazaar of Baghdad", A);
    expect(canBeBlockedBy(game, a, dryad, blocker)).toBe(true);
  });

  it("goes by the one being attacked at a table of three", () => {
    const { game, a } = table({ players: 3 });
    const dryad = spawn(game, "Dryad Sophisticate", A);
    const blocker = spawn(game, "Grizzly Bears", C);
    spawn(game, "Bazaar of Baghdad", B);
    expect(canBeBlockedBy(game, a, dryad, blocker, C)).toBe(true);
  });

  it("is lost with all its abilities", () => {
    const { game, a } = table();
    const dryad = spawn(game, "Dryad Sophisticate", A);
    const blocker = spawn(game, "Grizzly Bears", B);
    spawn(game, "Bazaar of Baghdad", B);
    game.state.objects[dryad].modifiers.push({
      power: 0,
      toughness: 0,
      keywords: [],
      loseAbilities: true,
      timestamp: game.state.objects[dryad].timestamp + 1,
      untilEndOfTurn: true,
    });
    expect(keywords(game, dryad).has("landwalk")).toBe(false);
    expect(walkers(game, dryad)).toEqual([]);
    expect(canBeBlockedBy(game, a, dryad, blocker)).toBe(true);
  });
});

describe("Trailblazer's Boots", () => {
  it("gives the equipped creature nonbasic landwalk, and only while equipped", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears", A);
    const boots = spawn(game, "Trailblazer's Boots", A);
    const blocker = spawn(game, "Grizzly Bears", B);
    spawn(game, "Bazaar of Baghdad", B);
    lands(game, "Wastes", 2, A);
    expect(keywords(game, bear).has("landwalk")).toBe(false);
    activate(game, boots, 0, { targets: [ref(bear)] });
    expect(game.state.objects[boots].attachedTo).toBe(bear);
    expect(keywords(game, bear).has("landwalk")).toBe(true);
    expect(canBeBlockedBy(game, a, bear, blocker)).toBe(false);
  });
});

describe("artifact landwalk (Vectis Gloves)", () => {
  const gloved = (game: Game): ObjectId => {
    const bear = spawn(game, "Grizzly Bears", A);
    const gloves = spawn(game, "Vectis Gloves", A);
    lands(game, "Wastes", 2, A);
    activate(game, gloves, 0, { targets: [ref(bear)] });
    return bear;
  };

  it("gets +2/+0 and can't be blocked while they control an artifact land", () => {
    const { game, a } = table();
    const bear = gloved(game);
    const blocker = spawn(game, "Grizzly Bears", B);
    spawn(game, "Darksteel Citadel", B);
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 2 });
    expect(canBeBlockedBy(game, a, bear, blocker)).toBe(false);
  });

  it("an artifact that isn't a land, or a land that isn't one, doesn't count", () => {
    const { game, a } = table();
    const bear = gloved(game);
    const blocker = spawn(game, "Grizzly Bears", B);
    spawn(game, "Sol Ring", B);
    spawn(game, "Bazaar of Baghdad", B);
    expect(canBeBlockedBy(game, a, bear, blocker)).toBe(true);
  });
});

describe("landwalk of the chosen type (Traveler's Cloak)", () => {
  const cloak = (game: Game, seat: ReturnType<typeof table>["a"], bear: ObjectId, type: string): ObjectId => {
    const card = toHand(game, "Traveler's Cloak", A);
    lands(game, "Island", 3, A);
    seat.chooseCreatureTypeFn = (_view, _source, options) => {
      expect(options).toContain("Urza's");
      return type;
    };
    cast(game, card, { targets: [ref(bear)] });
    settle(game);
    return card;
  };

  it("draws a card as it enters, and walks a type with no keyword of its own", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears", A);
    const blocker = spawn(game, "Grizzly Bears", B);
    const before = game.state.zones.perPlayer[A].hand.length;
    cloak(game, a, bear, "Gate");
    expect(game.state.zones.perPlayer[A].hand.length).toBe(before + 1);
    expect(keywords(game, bear).has("landwalk")).toBe(true);
    spawn(game, "Azorius Guildgate", B);
    expect(canBeBlockedBy(game, a, bear, blocker)).toBe(false);
  });

  it("another land type doesn't count", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears", A);
    const blocker = spawn(game, "Grizzly Bears", B);
    cloak(game, a, bear, "Gate");
    spawn(game, "Bazaar of Baghdad", B);
    lands(game, "Forest", 1, B);
    expect(canBeBlockedBy(game, a, bear, blocker)).toBe(true);
  });

  it("with a named walk's type chosen, it is that keyword (rule 702.14a)", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears", A);
    const blocker = spawn(game, "Grizzly Bears", B);
    cloak(game, a, bear, "Swamp");
    expect(keywords(game, bear).has("swampwalk")).toBe(true);
    expect(keywords(game, bear).has("landwalk")).toBe(false);
    expect(walkers(game, bear)).toEqual([]);
    // Quagmire names swampwalk, so it reaches this one.
    spawn(game, "Swamp", B);
    spawn(game, "Quagmire", B);
    expect(canBeBlockedBy(game, a, bear, blocker)).toBe(true);
  });

  it("with a named walk's type chosen, it stops a block like the keyword", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears", A);
    const blocker = spawn(game, "Grizzly Bears", B);
    cloak(game, a, bear, "Swamp");
    spawn(game, "Swamp", B);
    expect(canBeBlockedBy(game, a, bear, blocker)).toBe(false);
  });
});

describe("what names every landwalk", () => {
  it("Staff of the Ages lets a creature be blocked as though it hadn't it, and leaves it the ability", () => {
    const { game, a } = table();
    const dryad = spawn(game, "Dryad Sophisticate", A);
    const blocker = spawn(game, "Grizzly Bears", B);
    spawn(game, "Bazaar of Baghdad", B);
    spawn(game, "Staff of the Ages", B);
    expect(keywords(game, dryad).has("landwalk")).toBe(true);
    expect(canBeBlockedBy(game, a, dryad, blocker)).toBe(true);
  });

  it("Quagmire, naming swampwalk, doesn't reach nonbasic landwalk", () => {
    const { game, a } = table();
    const dryad = spawn(game, "Dryad Sophisticate", A);
    const blocker = spawn(game, "Grizzly Bears", B);
    spawn(game, "Bazaar of Baghdad", B);
    spawn(game, "Quagmire", B);
    expect(canBeBlockedBy(game, a, dryad, blocker)).toBe(false);
  });

  it("Hammerheim takes a printed landwalk away until end of turn", () => {
    const { game, a } = table();
    const dryad = spawn(game, "Dryad Sophisticate", A);
    const blocker = spawn(game, "Grizzly Bears", B);
    spawn(game, "Bazaar of Baghdad", B);
    activate(game, spawn(game, "Hammerheim", A), 1, { targets: [ref(dryad)] });
    expect(keywords(game, dryad).has("landwalk")).toBe(false);
    expect(walkers(game, dryad)).toEqual([]);
    expect(canBeBlockedBy(game, a, dryad, blocker)).toBe(true);
  });

  it("Hammerheim takes a granted one too, and the next turn it's back", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", A);
    const boots = spawn(game, "Trailblazer's Boots", A);
    lands(game, "Wastes", 2, A);
    activate(game, boots, 0, { targets: [ref(bear)] });
    activate(game, spawn(game, "Hammerheim", A), 1, { targets: [ref(bear)] });
    expect(keywords(game, bear).has("landwalk")).toBe(false);
    toStep(game, "upkeep", B);
    expect(keywords(game, bear).has("landwalk")).toBe(true);
  });

  it("a printed landwalk goes with a loss older than the creature (rule 613.7)", () => {
    const { game } = table();
    const dryad = spawn(game, "Dryad Sophisticate", A);
    const object = game.state.objects[dryad];
    object.modifiers.push({
      power: 0,
      toughness: 0,
      keywords: [],
      loseKeywords: ["landwalk"],
      timestamp: object.timestamp - 1,
      untilEndOfTurn: true,
    });
    expect(walkers(game, dryad)).toEqual([]);
    expect(keywords(game, dryad).has("landwalk")).toBe(false);
  });

  it("a grant later than the loss survives it", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", A);
    const boots = spawn(game, "Trailblazer's Boots", A);
    lands(game, "Wastes", 2, A);
    const object = game.state.objects[bear];
    object.modifiers.push({
      power: 0,
      toughness: 0,
      keywords: [],
      loseKeywords: ["landwalk"],
      timestamp: game.state.objects[boots].timestamp - 1,
      untilEndOfTurn: true,
    });
    activate(game, boots, 0, { targets: [ref(bear)] });
    expect(keywords(game, bear).has("landwalk")).toBe(true);
  });
});

describe("Illusionary Presence", () => {
  /** Alice's next turn, past the Presence's two upkeep triggers. */
  const afterUpkeep = (type: string, ...pay: number[]): { game: Game; presence: ObjectId; blocker: ObjectId; a: ReturnType<typeof table>["a"] } => {
    const { game, a } = table();
    const presence = spawn(game, "Illusionary Presence", A);
    const blocker = spawn(game, "Grizzly Bears", B);
    spawn(game, "Azorius Guildgate", B);
    lands(game, "Island", 2, A);
    a.chooseCreatureTypeFn = () => type;
    pickModes(a, ...pay);
    nextTurn(game);
    nextTurn(game);
    return { game, presence, blocker, a };
  };

  it("pays its cumulative upkeep, and walks the type chosen until end of turn", () => {
    const { game, presence, blocker, a } = afterUpkeep("Gate", 0);
    expect(counters(game, presence, "age")).toBe(1);
    expect(keywords(game, presence).has("landwalk")).toBe(true);
    expect(canBeBlockedBy(game, a, presence, blocker)).toBe(false);
  });

  it("the walk ends with the turn", () => {
    const { game, presence } = afterUpkeep("Gate", 0);
    nextTurn(game);
    expect(keywords(game, presence).has("landwalk")).toBe(false);
    expect(walkers(game, presence)).toEqual([]);
  });

  it("another type doesn't stop the block", () => {
    const { game, presence, blocker, a } = afterUpkeep("Cave", 0);
    expect(keywords(game, presence).has("landwalk")).toBe(true);
    expect(canBeBlockedBy(game, a, presence, blocker)).toBe(true);
  });

  it("gains the keyword itself when that type has one", () => {
    const { game, presence } = afterUpkeep("Island", 0);
    expect(keywords(game, presence).has("islandwalk")).toBe(true);
    expect(keywords(game, presence).has("landwalk")).toBe(false);
  });

  it("is sacrificed when its upkeep goes unpaid", () => {
    const { game, presence } = afterUpkeep("Gate");
    expect(game.state.objects[presence].zone).toBe("graveyard");
  });
});

describe("the bots' block check", () => {
  it("knows what a landwalk of a kind stops, per defending player", () => {
    const { game } = table({ players: 3 });
    const dryad = spawn(game, "Dryad Sophisticate", A);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Grizzly Bears", C);
    spawn(game, "Bazaar of Baghdad", B);
    const reg = registryOf(game);
    const attacker = combatCreatures(game.state, reg, A, false).find((c) => c.id === dryad)!;
    expect(canBlock(combatCreatures(game.state, reg, B, true)[0], attacker)).toBe(false);
    expect(canBlock(combatCreatures(game.state, reg, C, true)[0], attacker)).toBe(true);
  });

  it("knows Staff of the Ages undoes it", () => {
    const { game } = table();
    const dryad = spawn(game, "Dryad Sophisticate", A);
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Bazaar of Baghdad", B);
    spawn(game, "Staff of the Ages", B);
    const reg = registryOf(game);
    const attacker = combatCreatures(game.state, reg, A, false).find((c) => c.id === dryad)!;
    expect(canBlock(combatCreatures(game.state, reg, B, true)[0], attacker)).toBe(true);
  });
});

// An attacker that does get through, the walk's whole point.
describe("in combat", () => {
  it("an unblocked Dryad deals its damage", () => {
    const { game, a } = table();
    const dryad = spawn(game, "Dryad Sophisticate", A, { sick: false });
    spawn(game, "Grizzly Bears", B);
    spawn(game, "Bazaar of Baghdad", B);
    attack(game, a, [dryad]);
    expect(life(game, B)).toBe(18);
  });
});
