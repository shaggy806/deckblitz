/**
 * An emblem that gives others abilities (rules 113.6p, 114.4): activated ones to
 * a class of permanents (`grantsActivated` — Koth of the Hammer, Mu Yanling, Sky
 * Dancer), triggered ones (`grantsTriggered`), and what `grantsToSpells` gives
 * spells (Ral, Crackling Wit's storm). Read off the emblem, its owner's side.
 */
import { describe, expect, it } from "vitest";
import type { EffectSpec } from "../effects.js";
import type { Game } from "../game.js";
import type { StaticAbility } from "../cards.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import { spellCantBeCountered, spellHasSplitSecond } from "../characteristics.js";
import {
  A,
  activate,
  B,
  cast,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  loyalty,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

const ultimate = (game: Game, name: string, cost: number, atLeast = 12): ObjectId => {
  const walker = enter(game, name);
  loyalty(game, walker, cost, { atLeast });
  return walker;
};

const emblem = (game: Game, statics: readonly StaticAbility[], player: PlayerId = A): void => {
  const source = spawn(game, "Wastes", player);
  const effect: EffectSpec = { kind: "create-emblem", text: "test emblem", static: statics[0], moreStatics: statics.slice(1) };
  game.debugApplyEffect(player, effect, [], { source });
};

const offersAbility = (game: Game, source: ObjectId, player: PlayerId = A): boolean =>
  game.legalActions(player).some((a) => a.kind === "activate-ability" && a.source === source);

describe("Koth of the Hammer", () => {
  it("−5: its owner's Mountains deal damage, and those of no one else or any other land", () => {
    const { game } = table();
    const mountain = spawn(game, "Mountain");
    const forest = spawn(game, "Forest");
    const theirs = spawn(game, "Mountain", B);
    const koth = ultimate(game, "Koth of the Hammer", -5);
    expect(offersAbility(game, mountain)).toBe(true);
    // A Forest makes green mana, a Mountain red and now this as well.
    const index = game
      .legalActions(A)
      .filter((a) => a.kind === "activate-ability" && a.source === mountain)
      .map((a) => (a.kind === "activate-ability" ? a.abilityIndex : -1))
      .at(-1)!;
    activate(game, mountain, index, { targets: [ref(B)] });
    expect(life(game, B)).toBe(19);
    expect(game.state.objects[mountain].tapped).toBe(true);
    // The emblem stays when Koth is gone (rule 114.4).
    destroy(game, koth);
    const second = spawn(game, "Mountain");
    activate(game, second, index, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
    // Only its own {T}: Add {G}.
    expect(game.legalActions(A).filter((a) => a.kind === "activate-ability" && a.source === forest).length).toBe(1);
    expect(game.legalActions(B).filter((a) => a.kind === "activate-ability" && a.source === theirs).length).toBe(0);
  });

  it("+1: untaps a Mountain, a 4/4 red Elemental creature until end of turn, still a land", () => {
    const { game } = table();
    const mountain = spawn(game, "Mountain", A, { tapped: true });
    const koth = enter(game, "Koth of the Hammer");
    loyalty(game, koth, 1, { targets: [ref(mountain)] });
    expect(game.state.objects[mountain].tapped).toBe(false);
    expect(pt(game, mountain)).toEqual({ power: 4, toughness: 4 });
    expect(types(game, mountain)).toContain("land");
    expect(types(game, mountain)).toContain("creature");
  });

  it("−2: {R} for each Mountain", () => {
    const { game } = table();
    lands(game, "Mountain", 3);
    const koth = enter(game, "Koth of the Hammer");
    loyalty(game, koth, -2);
    expect(game.state.players[A].manaPool.filter((unit) => unit.type === "R").length).toBe(3);
  });
});

describe("Mu Yanling, Sky Dancer", () => {
  it("−8: her owner's Islands draw", () => {
    const { game } = table();
    toLibrary(game, "Wastes");
    const island = spawn(game, "Island");
    ultimate(game, "Mu Yanling, Sky Dancer", -8);
    const before = hand(game).length;
    const index = game
      .legalActions(A)
      .filter((a) => a.kind === "activate-ability" && a.source === island)
      .map((a) => (a.kind === "activate-ability" ? a.abilityIndex : -1))
      .at(-1)!;
    activate(game, island, index);
    expect(hand(game).length).toBe(before + 1);
  });

  it("+2: -2/-0 and no flying until her controller's next turn, or no target", () => {
    const { game } = table();
    const drake = spawn(game, "Wind Drake", B);
    const mu = enter(game, "Mu Yanling, Sky Dancer");
    loyalty(game, mu, 2, { targets: [ref(drake)] });
    expect(pt(game, drake).power).toBe(0);
    expect(keywords(game, drake).has("flying")).toBe(false);
  });

  it("−3: a 4/4 flier", () => {
    const { game } = table();
    const mu = enter(game, "Mu Yanling, Sky Dancer");
    loyalty(game, mu, -3, { atLeast: 3 });
    expect(tokensNamed(game, "Elemental Bird Token (Mu Yanling, Sky Dancer)", A)).toBe(1);
  });
});

describe("an emblem's grant of mana and triggers", () => {
  const swamps: StaticAbility = {
    affects: { scope: "filter", filter: { subtype: "Swamp", controlledBy: "you" } },
    grantsActivated: [
      {
        cost: { mana: null, tap: true },
        targets: [],
        effect: { kind: "add-mana", mana: { all: ["B", "B", "B", "B"] }, amount: 1 },
        resolve: null,
        text: "{T}: Add {B}{B}{B}{B}.",
      },
    ],
    text: "Swamps you control have \"{T}: Add {B}{B}{B}{B}.\"",
  };

  it("a granted mana ability pays a cost as any mana source does", () => {
    const { game } = table();
    const swamp = spawn(game, "Swamp");
    const card = toHand(game, "Phyrexian Rager");
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card)).toBe(false);
    emblem(game, [swamps]);
    // One Swamp, four black (and the Wastes the test's emblem came from).
    expect(game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card)).toBe(true);
    toLibrary(game, "Wastes");
    cast(game, card);
    expect(zone(game, card)).toBe("battlefield");
    expect(game.state.objects[swamp].tapped).toBe(true);
  });

  it("a one-pip spell still takes one mana, not the richer option", () => {
    const { game } = table();
    const swamp = spawn(game, "Swamp");
    emblem(game, [swamps]);
    const ritual = toHand(game, "Dark Ritual");
    cast(game, ritual);
    expect(game.state.objects[swamp].tapped).toBe(true);
    expect(game.state.players[A].manaPool.filter((unit) => unit.type === "B").length).toBe(3);
  });

  it("gives a triggered ability to its owner's creatures, not an opponent's", () => {
    const { game } = table();
    emblem(game, [
      {
        affects: { scope: "creatures-you-control" },
        grantsTriggered: [
          {
            trigger: { on: "dies", who: "self" },
            targets: [],
            effect: { kind: "gain-life", amount: 2 },
            resolve: null,
            text: "When this creature dies, you gain 2 life.",
          },
        ],
        text: "test",
      },
    ]);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    destroy(game, mine);
    settle(game);
    expect(life(game)).toBe(22);
    destroy(game, theirs);
    settle(game);
    expect(life(game, B)).toBe(20);
  });
});

describe("Ral, Crackling Wit", () => {
  it("−10: draws three, and its owner's instants and sorceries have storm from then on", () => {
    const { game } = table();
    for (let i = 0; i < 3; i += 1) toLibrary(game, "Wastes");
    const ral = enter(game, "Ral, Crackling Wit");
    const before = hand(game).length;
    loyalty(game, ral, -10, { atLeast: 12 });
    expect(hand(game).length).toBe(before + 3);
    lands(game, "Mountain", 2);
    // Ral's loyalty rises on the first; the second is copied once for it.
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(11);
    // A creature spell has none.
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
    expect(tokensNamed(game, "Grizzly Bears", A)).toBe(0);
  });

  it("storm is its owner's: an opponent's spell has none", () => {
    const { game, b } = table();
    const ral = enter(game, "Ral, Crackling Wit");
    loyalty(game, ral, -10, { atLeast: 12 });
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)], settle: false });
    lands(game, "Mountain", 1, B);
    const bolt = toHand(game, "Lightning Bolt", B);
    b.enqueue({ type: "cast-spell", player: B, card: bolt, targets: [ref(A)] });
    settle(game);
    expect(life(game, A)).toBe(17);
  });

  it("whenever you cast a noncreature spell it gains loyalty; +1 makes an Otter", () => {
    const { game } = table();
    const ral = enter(game, "Ral, Crackling Wit");
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(game.state.objects[ral].counters.loyalty).toBe(5);
    loyalty(game, ral, 1);
    expect(tokensNamed(game, "Otter Token", A)).toBe(1);
    expect(game.state.objects[ral].counters.loyalty).toBe(6);
  });

  it("an emblem's split second and can't-be-countered reach its owner's spells only", () => {
    const { game } = table();
    emblem(game, [
      {
        affects: { scope: "self" },
        grantsToSpells: { filter: { type: "instant" }, splitSecond: true, cantBeCountered: true },
        text: "test",
      },
    ]);
    lands(game, "Mountain", 1);
    const bolt = toHand(game, "Lightning Bolt");
    cast(game, bolt, { targets: [ref(B)], settle: false });
    expect(spellHasSplitSecond(game.state, game.registry, game.state.objects[bolt])).toBe(true);
    expect(spellCantBeCountered(game.state, game.registry, game.state.objects[bolt])).toBe(true);
    settle(game);
    lands(game, "Mountain", 1, B);
    const theirs = toHand(game, "Lightning Bolt", B);
    game.advanceUntil((s) => s.priority.holder === B);
    cast(game, theirs, { player: B, targets: [ref(A)], settle: false });
    expect(spellHasSplitSecond(game.state, game.registry, game.state.objects[theirs])).toBe(false);
    expect(spellCantBeCountered(game.state, game.registry, game.state.objects[theirs])).toBe(false);
  });
});
