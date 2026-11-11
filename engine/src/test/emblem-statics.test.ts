/**
 * Static abilities on an emblem, read off the emblem (rules 113.6p, 114.4):
 * every reader `emblemStatics` / `staticSourceIds` reaches, each on a real
 * planeswalker's emblem where one proves it. The last test pins the fields:
 * an emblem in the pool with a static no reader takes would be a lie the game
 * tells at the table, and no other check would notice.
 */

import { describe, expect, it } from "vitest";

import { POOL_CARDS } from "../cards.js";
import type { StaticAbility } from "../cards.js";
import { playerCantLoseGame, playerCantWinGame } from "../prohibitions.js";
import type { EffectSpec } from "../effects.js";
import { Game } from "../game.js";
import {
  A,
  B,
  activate,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  loyalty,
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
  toStep,
  zone,
} from "./harness.js";

const ultimate = (game: Game, name: string, cost: number, atLeast = 12) => {
  const walker = enter(game, name);
  loyalty(game, walker, cost, { atLeast });
  return walker;
};

/** An emblem with these statics, as a card's `create-emblem` would make it. */
const emblem = (game: Game, statics: readonly StaticAbility[], player = A): void => {
  const source = spawn(game, "Wastes", player);
  const effect: EffectSpec = {
    kind: "create-emblem",
    text: "test emblem",
    static: statics[0],
    moreStatics: statics.slice(1),
  };
  game.debugApplyEffect(player, effect, [], { source });
};

describe("an anthem emblem of any scope", () => {
  it("Elspeth, Knight-Errant: artifacts, creatures, enchantments and lands you control, and only yours", () => {
    const { game } = table();
    const walker = ultimate(game, "Elspeth, Knight-Errant", -8);
    const bears = spawn(game, "Grizzly Bears");
    const land = spawn(game, "Forest");
    const trinket = spawn(game, "Sol Ring");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(keywords(game, bears).has("indestructible")).toBe(true);
    expect(keywords(game, land).has("indestructible")).toBe(true);
    expect(keywords(game, trinket).has("indestructible")).toBe(true);
    expect(keywords(game, theirs).has("indestructible")).toBe(false);
    // Not a planeswalker, and the emblem outlives her (rule 114.1).
    expect(keywords(game, walker).has("indestructible")).toBe(false);
    destroy(game, walker);
    expect(zone(game, walker)).toBe("graveyard");
    expect(keywords(game, bears).has("indestructible")).toBe(true);
    // The emblem itself is in no zone a player can act on.
    const object = game.state.emblems[0].object;
    expect(object).toBeDefined();
    expect(game.state.zones.shared.command).not.toContain(object);
  });

  it("Nissa, Who Shakes the World: lands you control, the ones that come later too", () => {
    const { game } = table();
    ultimate(game, "Nissa, Who Shakes the World", -8);
    const land = spawn(game, "Forest");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Forest", B);
    expect(keywords(game, land).has("indestructible")).toBe(true);
    expect(keywords(game, bears).has("indestructible")).toBe(false);
    expect(keywords(game, theirs).has("indestructible")).toBe(false);
  });

  it("Saheeli, Filigree Master: two statics, an anthem by filter and a cost reduction", () => {
    const { game } = table();
    ultimate(game, "Saheeli, Filigree Master", -4);
    const thopter = spawn(game, "Ornithopter");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Ornithopter", B);
    expect(pt(game, thopter)).toEqual({ power: 1, toughness: 3 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    expect(pt(game, theirs)).toEqual({ power: 0, toughness: 2 });
    // Sol Ring for {0}: nothing on the board to pay with.
    const ring = toHand(game, "Sol Ring");
    cast(game, ring, { settle: false });
    expect(game.state.zones.shared.stack).toContain(ring);
    settle(game);
    expect(zone(game, ring)).toBe("battlefield");
  });
});

describe("a player's rules, off an emblem", () => {
  it("Tamiyo, the Moon Sage: no maximum hand size, and the trigger beside it", () => {
    const { game, a } = table();
    game.state.players[A].maxHandSize = 7;
    ultimate(game, "Tamiyo, the Moon Sage", -8);
    while (game.handOf(A).length < 11) toHand(game, "Island");
    // Whenever a card is put into your graveyard from anywhere, you may
    // return it: here, from the library.
    const milled = toLibrary(game, "Island");
    pickModes(a, 0);
    game.debugApplyEffect(A, { kind: "mill", amount: 1, target: "you" }, [], { source: spawn(game, "Wastes") });
    settle(game);
    expect(zone(game, milled)).toBe("hand");
    const held = game.handOf(A).length;
    game.advanceUntil((s) => s.turn.number === 2);
    expect(game.handOf(A).length).toBe(held);
  });

  it("an opponent's hand size isn't touched by your emblem", () => {
    const { game } = table();
    game.state.players[B].maxHandSize = 7;
    emblem(game, [{ affects: { scope: "self" }, noMaxHandSize: true, text: "You have no maximum hand size." }]);
    for (let i = 0; i < 9; i += 1) toHand(game, "Island", B);
    game.advanceUntil((s) => s.turn.number === 3);
    expect(game.handOf(B).length).toBe(7);
  });

  it("Gideon of the Trials: can't lose and opponents can't win, as long as you control a Gideon", () => {
    const { game } = table({ players: 3 });
    const gideon = enter(game, "Gideon of the Trials");
    activate(game, gideon, 2);
    expect(playerCantLoseGame(game.state, game.registry, A)).toBe(true);
    expect(playerCantWinGame(game.state, game.registry, B)).toBe(true);
    expect(playerCantLoseGame(game.state, game.registry, B)).toBe(false);
    game.state.players[A].life = 0;
    toStep(game, "begin-combat");
    expect(game.state.players[A].hasLost).toBe(false);
    // Gone, the condition fails and the next state-based check takes her.
    destroy(game, gideon);
    expect(zone(game, gideon)).toBe("graveyard");
    expect(playerCantLoseGame(game.state, game.registry, A)).toBe(false);
    game.advanceUntil((s) => s.players[A].hasLost === true);
    expect(game.state.players[A].hasLost).toBe(true);
  });

  it("Your opponents can't cast noncreature spells (Narset Transcendent's emblem's static)", () => {
    const { game } = table();
    emblem(game, [
      {
        affects: { scope: "self" },
        prohibits: [{ act: "cast", who: "opponents", filter: { notTypes: ["creature"] } }],
        text: "Your opponents can't cast noncreature spells.",
      },
    ]);
    const bolt = toHand(game, "Lightning Bolt", B);
    const mine = toHand(game, "Lightning Bolt", A);
    const offered = (player: typeof A, card: unknown) =>
      game.legalActions(player).some((x) => x.kind === "cast-spell" && x.card === card);
    lands(game, "Mountain", 1, A);
    lands(game, "Mountain", 1, B);
    expect(offered(A, mine)).toBe(true);
    game.dispatch({ type: "pass-priority", player: A });
    expect(game.state.priority.holder).toBe(B);
    expect(offered(B, bolt)).toBe(false);
  });
});

describe("damage, off an emblem", () => {
  it("Ajani Steadfast: all but 1 of the damage to you and your planeswalkers, not your creatures or anyone else", () => {
    const { game } = table();
    const ajani = ultimate(game, "Ajani Steadfast", -7);
    const bears = spawn(game, "Grizzly Bears");
    const other = enter(game, "Elspeth, Knight-Errant");
    const bolt = (target: Parameters<typeof ref>[0]): void => {
      const source = spawn(game, "Wastes", B);
      game.debugApplyEffect(B, { kind: "damage", target: 0, amount: 3 }, [ref(target)], { source });
      settle(game);
    };
    bolt(A);
    expect(life(game, A)).toBe(19);
    const before = game.state.objects[other].counters.loyalty;
    bolt(other);
    expect(game.state.objects[other].counters.loyalty).toBe((before ?? 0) - 1);
    bolt(bears);
    expect(game.state.objects[bears].damageMarked).toBe(3);
    bolt(B);
    expect(life(game, B)).toBe(17);
    expect(zone(game, ajani)).toBe("battlefield");
  });
});

describe("loyalty abilities at instant speed, off an emblem", () => {
  const plusOne = (game: Game, source: unknown, player = A) =>
    game
      .legalActions(player)
      .some((x) => x.kind === "activate-ability" && x.source === source && x.loyalty === 1);

  it("Teferi, Temporal Archmage: every planeswalker you control, on any player's turn, still once a turn", () => {
    const { game } = table();
    const other = enter(game, "Elspeth, Knight-Errant");
    expect(plusOne(game, other)).toBe(true);
    ultimate(game, "Teferi, Temporal Archmage", -10);
    // Their turn, their upkeep: priority is all it needs.
    game.advanceUntil((s) => s.turn.number === 2 && s.priority.holder === A);
    expect(game.state.turn.step).not.toBe("precombat-main");
    expect(plusOne(game, other)).toBe(true);
    loyalty(game, other, 1, { settle: false, targets: [] });
    settle(game);
    // Rule 606.3 still stands.
    expect(plusOne(game, other)).toBe(false);
  });

  it("without it, or with an opponent's, the timing rule stands", () => {
    const { game } = table();
    const mine = enter(game, "Elspeth, Knight-Errant");
    const theirs = enter(game, "Elspeth, Knight-Errant", B);
    emblem(game, [{ affects: { scope: "self" }, loyaltyAtInstantSpeed: true, text: "t" }], B);
    game.advanceUntil((s) => s.turn.number === 2 && s.priority.holder === A);
    expect(plusOne(game, mine)).toBe(false);
    game.advanceUntil((s) => s.priority.holder === B && s.zones.shared.stack.length === 0);
    expect(plusOne(game, theirs, B)).toBe(true);
    game.advanceUntil((s) => s.turn.number === 3 && s.priority.holder === B);
    expect(plusOne(game, theirs, B)).toBe(true);
  });
});

describe("cast and play permissions, off an emblem", () => {
  it("Jaya Ballard: instants and sorceries from your graveyard, exiled afterwards", () => {
    const { game, a } = table();
    ultimate(game, "Jaya Ballard", -8);
    lands(game, "Mountain", 2);
    const bolt = toGraveyard(game, "Lightning Bolt");
    const bears = toGraveyard(game, "Grizzly Bears");
    const theirs = toGraveyard(game, "Lightning Bolt", B);
    const offers = (card: unknown) =>
      game.legalActions(A).filter((x) => x.kind === "cast-spell" && x.card === card);
    expect(offers(bears)).toHaveLength(0);
    expect(offers(theirs)).toHaveLength(0);
    const [offer] = offers(bolt);
    expect(offer).toBeDefined();
    pickTargets(a, B);
    cast(game, bolt, {
      targets: [ref(B)],
      via: "graveyard-permission",
      ...(offer.kind === "cast-spell" && offer.graveyardGrant !== undefined ? { graveyardGrant: offer.graveyardGrant } : {}),
    });
    expect(life(game, B)).toBe(17);
    expect(zone(game, bolt)).toBe("exile");
    expect(graveyard(game)).not.toContain(bolt);
  });

  it("You may play lands and cast permanent spells from your graveyard (Wrenn and Realmbreaker's emblem's static)", () => {
    const { game } = table();
    emblem(game, [
      {
        affects: { scope: "self" },
        mayPlay: { from: "graveyard", play: true, filter: { typesAnyOf: ["land", "artifact", "creature", "enchantment", "planeswalker", "battle"] } },
        text: "You may play lands and cast permanent spells from your graveyard.",
      },
    ]);
    const land = toGraveyard(game, "Forest");
    const bears = toGraveyard(game, "Grizzly Bears");
    const bolt = toGraveyard(game, "Lightning Bolt");
    lands(game, "Forest", 2);
    lands(game, "Mountain", 1);
    const actions = game.legalActions(A);
    expect(actions.some((x) => x.kind === "play-land" && x.card === land)).toBe(true);
    expect(actions.some((x) => x.kind === "cast-spell" && x.card === bears)).toBe(true);
    expect(actions.some((x) => x.kind === "cast-spell" && x.card === bolt)).toBe(false);
  });

  it("You may cast spells from your hand without paying their mana costs (Tamiyo, Field Researcher's emblem's static)", () => {
    const { game } = table();
    emblem(game, [
      {
        affects: { scope: "self" },
        alternativeCostForSpells: { mana: "{0}", when: { castFrom: "hand" } },
        text: "You may cast spells from your hand without paying their mana costs.",
      },
      { affects: { scope: "self" }, mayPlay: { from: "graveyard", filter: { type: "creature" } }, text: "for the test" },
    ]);
    const bears = toHand(game, "Grizzly Bears");
    const buried = toGraveyard(game, "Grizzly Bears");
    // No mana on the board: only the emblem's {0} can pay, and only from the hand.
    const offered = (card: unknown) => game.legalActions(A).some((x) => x.kind === "cast-spell" && x.card === card);
    expect(offered(bears)).toBe(true);
    expect(offered(buried)).toBe(false);
    expect(hand(game)).toContain(bears);
  });
});

describe("discard up to a number, chosen as it resolves", () => {
  it("Jaya Ballard's +1: at most three, that many drawn", () => {
    const { game, a } = table();
    const jaya = enter(game, "Jaya Ballard");
    const held = [toHand(game, "Island"), toHand(game, "Island"), toHand(game, "Island"), toHand(game, "Island")];
    const size = hand(game).length;
    let most = -1;
    a.chooseDiscardsFn = (_hand, count) => {
      most = count;
      return held.slice(0, 2);
    };
    activate(game, jaya, 1);
    expect(most).toBe(3);
    expect(graveyard(game)).toEqual(expect.arrayContaining(held.slice(0, 2)));
    expect(hand(game).length).toBe(size);
  });
});

describe("a snapshot from before emblems' statics had an object", () => {
  it("an anthem and a hand size still work, and the object it's given is in no zone list", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    game.state.emblems.push({
      id: "emblem-old",
      owner: A,
      text: "Creatures you control get +2/+2.",
      timestamp: 1,
      static: { affects: { scope: "creatures-you-control" }, grantPt: [2, 2], text: "Creatures you control get +2/+2." },
    });
    const restored = Game.fromSnapshot(game.state);
    const emblem = restored.state.emblems[0];
    expect(emblem.object).toBeDefined();
    expect(restored.state.zones.shared.command).not.toContain(emblem.object);
    expect(pt(restored, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("what is read off an emblem", () => {
  /** The `StaticAbility` fields some reader of `emblemStatics` or
   * `staticSourceIds` takes. A pool emblem with any other field must teach a
   * reader first, and this list with it. */
  const READ: ReadonlySet<string> = new Set([
    // Every static.
    "affects",
    "condition",
    "text",
    // The layer system (`contributingStaticSources`).
    "grantPt",
    "grantPtPerCount",
    "grantKeywords",
    "loseKeywords",
    "grantToxic",
    "restrictions",
    "combatDamageByToughness",
    "canAttackAsThoughNoDefender",
    "assignAsThoughUnblocked",
    "cantBeSacrificed",
    "blockAdditional",
    "protection",
    "hexproofFrom",
    "bandsWithOther",
    "setBasePt",
    // A player's rules.
    "noMaxHandSize",
    "maxHandSize",
    "cantLoseGame",
    "opponentsCantLoseGame",
    "cantWinGame",
    "opponentsCantWinGame",
    "prohibits",
    "targetsIgnoringHexproof",
    "playerKeywords",
    "costModification",
    "untapLimit",
    "loyaltyAtInstantSpeed",
    "replacement",
    // The legend rule (`exemptFromLegendRule`) - Hall of Echoes' timed static.
    "legendRuleOff",
    // `playerDamageLifeFloor` reads emblems (Serra the Benevolent).
    "damageLifeFloor",
    // Permissions.
    "mayPlay",
    "alternativeCostForSpells",
    "grantsToGraveyard",
    // Abilities for permanents and for spells.
    "grantsActivated",
    "grantsTriggered",
    "grantsToSpells",
  ]);

  const emblemsIn = (node: unknown, out: { static?: StaticAbility; moreStatics?: readonly StaticAbility[] }[]): void => {
    if (Array.isArray(node)) {
      for (const each of node) emblemsIn(each, out);
    } else if (node !== null && typeof node === "object") {
      const record = node as Record<string, unknown>;
      if (record.kind === "create-emblem") out.push(record as (typeof out)[number]);
      // A timed static rides an emblem: the same readers.
      if (record.kind === "timed-static") out.push({ moreStatics: record.static as readonly StaticAbility[] });
      for (const value of Object.values(record)) emblemsIn(value, out);
    }
  };

  it("every static on every emblem in the pool uses only what a reader takes", () => {
    const unread: string[] = [];
    let seen = 0;
    for (const card of POOL_CARDS) {
      const emblems: { static?: StaticAbility; moreStatics?: readonly StaticAbility[] }[] = [];
      emblemsIn(card.activated, emblems);
      emblemsIn(card.triggered, emblems);
      emblemsIn(card.effect, emblems);
      seen += emblems.length;
      for (const made of emblems) {
        for (const ability of [...(made.static !== undefined ? [made.static] : []), ...(made.moreStatics ?? [])]) {
          for (const field of Object.keys(ability)) {
            if (!READ.has(field)) unread.push(`${card.name}: ${field}`);
          }
          // Only a damage or a life-gain replacement is read off an emblem
          // (`playerEventReplacements` reads mill and life loss there too).
          const replacement = (ability as { replacement?: { event?: string } }).replacement;
          if (replacement !== undefined && !["would-deal-damage", "would-gain-life", "would-lose-life", "would-mill"].includes(replacement.event ?? "")) {
            unread.push(`${card.name}: replacement ${replacement.event}`);
          }
        }
      }
    }
    expect(seen).toBeGreaterThan(30);
    expect(unread).toEqual([]);
  });
});
