/**
 * Theme 4 of docs/plans/need-key-themes.md: cost modifiers read `EffectAmount`s
 * and one spell clause, and effects can be costs.
 */
import { describe, expect, it } from "vitest";
import { POOL_CARDS, TOKEN_CARDS } from "../cards/generated.js";
import { costActMayAsk, costActUnknownKinds } from "../cost-acts.js";
import { A, B, activate, cast, counters, graveyard, hand, lands, life, named, nextTurn, pt, ref, settle, spawn, table, toGraveyard, toHand, toLibrary, tokensNamed, zone } from "./harness.js";

function valuesAt(value: unknown, key: string, out: unknown[] = []): unknown[] {
  if (value === null || typeof value !== "object") return out;
  if (Array.isArray(value)) {
    for (const v of value) valuesAt(v, key, out);
    return out;
  }
  for (const [k, v] of Object.entries(value)) {
    if (k === key) out.push(v);
    valuesAt(v, key, out);
  }
  return out;
}

/** Field names only the deleted shapes had. An object declared `as const` and
 * used later isn't excess-checked, so a leftover would be silently ignored. */
const REMOVED = [
  "cardsInGraveyard",
  "greatestOpponentCount",
  "playersInGame",
  "scaled",
  "sameNameAsSpell",
  "alternativeEquipCost",
  "alternativeCyclingCost",
];

describe("the pool on the cost pipeline", () => {
  it("writes every do cost from COST_ACTS, beside no other part that asks", () => {
    const bad: string[] = [];
    const asking = ["sacrifice", "discard", "exileFromGraveyard", "exileFromHand", "exileSpell", "putFromExile", "reveal", "returnToHand", "untapOthers", "blight", "collectEvidence"];
    for (const def of POOL_CARDS) {
      for (const ability of def.activated ?? []) {
        const act = ability.cost.do;
        if (act === undefined) continue;
        for (const kind of costActUnknownKinds(act)) bad.push(`${def.name}: ${kind} isn't a cost act`);
        if (costActMayAsk(act) && asking.some((k) => k in ability.cost)) bad.push(`${def.name}: a do that asks beside another part that asks`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("spells no shape the pipeline replaced", () => {
    const bad: string[] = [];
    for (const def of [...POOL_CARDS, ...TOKEN_CARDS]) {
      for (const key of REMOVED) if (valuesAt(def, key).length > 0) bad.push(`${def.name}: ${key}`);
      for (const mod of valuesAt(def, "costModification") as Record<string, unknown>[]) {
        for (const key of ["caster", "castFrom", "castFromAnyones", "notFromCastersHand", "firstEachTurn", "exceptOnCastersTurn"]) {
          if (key in mod) bad.push(`${def.name}: costModification.${key}`);
        }
      }
      for (const grant of valuesAt(def, "alternativeCostForSpells") as Record<string, unknown>[]) {
        for (const key of ["fromHand", "fromZones", "yourTurnOnly"]) if (key in grant) bad.push(`${def.name}: ${key}`);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe("power-up abilities", () => {
  const ready = (name: string) => {
    const t = table();
    const id = spawn(t.game, name);
    nextTurn(t.game); // Bob's
    nextTurn(t.game); // Alice's: it didn't enter this turn
    return { ...t, id };
  };

  it("Hulk takes {3} off another creature's power-up, not his own", () => {
    const { game, id } = ready("Wonder Man, Hollywood Hero");
    spawn(game, "Hulk, Gamma Goliath");
    lands(game, "Mountain", 4);
    activate(game, id, 0);
    expect(counters(game, id)).toBe(2);
  });

  it("Hulk doesn't discount his own power-up", () => {
    const { game, id } = ready("Hulk, Gamma Goliath");
    lands(game, "Taiga", 5);
    expect(() => activate(game, id, 0)).toThrow(/mana|pay/i);
  });

  it("without Hulk the same activation can't be paid", () => {
    const { game, id } = ready("Wonder Man, Hollywood Hero");
    lands(game, "Mountain", 4);
    expect(() => activate(game, id, 0)).toThrow(/mana|pay/i);
  });

  it("Advancing the Spirit: the first power-up each of your turns for {0}, once", () => {
    const { game, id } = ready("Hulk, Gamma Goliath");
    const second = spawn(game, "Kang the Conqueror");
    spawn(game, "Advancing the Spirit");
    activate(game, id, 1); // the copy at {0}
    expect(counters(game, id)).toBe(5);
    // Used up, by the copy, at either cost.
    lands(game, "Taiga", 8);
    expect(() => activate(game, id, 0)).toThrow(/only once/);
    // And no second free one this turn: Kang has no second ability left to name.
    expect(() => activate(game, second, 1)).toThrow();
  });

  it("Advancing the Spirit does nothing on another player's turn", () => {
    const { game, id } = ready("Hulk, Gamma Goliath");
    spawn(game, "Advancing the Spirit");
    nextTurn(game);
    expect(() => activate(game, id, 1)).toThrow();
  });

  it("Wonder Man: each power-up can be activated one more time", () => {
    const { game, id } = ready("Wonder Man, Hollywood Hero");
    lands(game, "Mountain", 14);
    activate(game, id, 0);
    activate(game, id, 0);
    expect(counters(game, id)).toBe(4);
    expect(() => activate(game, id, 0)).toThrow(/only once/);
  });

  it("Kang: no power-up abilities during the extra turn", () => {
    const { game, id } = ready("Kang the Conqueror");
    const other = spawn(game, "Abomination, Terrifying Titan");
    lands(game, "Island", 8);
    activate(game, id, 0);
    expect(counters(game, id)).toBe(1);
    nextTurn(game);
    lands(game, "Taiga", 7);
    expect(() => activate(game, other, 0)).toThrow(/can't be activated this turn/);
  });
});

describe("effects as costs", () => {
  it("Sphinx of the Revelation pays X energy, X announced up to what's there", () => {
    const { game } = table();
    const sphinx = spawn(game, "Sphinx of the Revelation");
    lands(game, "Tundra", 3);
    for (let i = 0; i < 4; i += 1) toLibrary(game, "Wastes");
    game.state.players[A].energy = 3;
    const before = hand(game).length;
    expect(() => activate(game, sphinx, 0, { x: 4 })).toThrow();
    activate(game, sphinx, 0, { x: 2 });
    expect(game.state.players[A].energy).toBe(1);
    expect(hand(game).length).toBe(before + 2);
  });

  it("forage with a Food: a mana ability that waits for nothing it can't pay", () => {
    const { game } = table();
    const forager = spawn(game, "Thornvault Forager");
    const food = spawn(game, "Food Token");
    activate(game, forager, 1, { manaColors: ["G", "G"], settle: false } as never);
    expect(zone(game, food)).not.toBe("battlefield");
    expect(game.state.players[A].manaPool.length).toBe(2);
  });

  it("forage offers exile only with three cards in the graveyard, and can't be paid with neither", () => {
    const { game } = table();
    const forager = spawn(game, "Thornvault Forager");
    expect(() => activate(game, forager, 1)).toThrow();
    const cards = [toGraveyard(game, "Wastes"), toGraveyard(game, "Wastes"), toGraveyard(game, "Wastes")];
    activate(game, forager, 1, { settle: false });
    game.dispatch({ type: "choose-from-zone", player: A, chosen: cards } as never);
    expect(cards.every((id) => zone(game, id) === "exile")).toBe(true);
  });

  it("Feed the Cycle: forage or pay {B}", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", "bob" as never);
    spawn(game, "Food Token");
    lands(game, "Swamp", 2);
    const feed = toHand(game, "Feed the Cycle");
    cast(game, feed, { targets: [ref(bears)], costOption: 0 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(named(game, "Food Token").length).toBe(0);
  });

  it("Leashling puts a card from hand on top: payable only with a card in hand", () => {
    const { game } = table();
    const dog = spawn(game, "Leashling");
    game.state.zones.perPlayer[A].hand = [];
    expect(() => activate(game, dog, 0)).toThrow();
    const card = toHand(game, "Wastes");
    activate(game, dog, 0);
    expect(zone(game, card)).toBe("library");
    expect(zone(game, dog)).toBe("hand");
  });

  it("Timestream Navigator goes to the bottom as a cost", () => {
    const { game } = table();
    const nav = spawn(game, "Timestream Navigator");
    lands(game, "Island", 10);
    game.state.players[A].citysBlessing = true;
    activate(game, nav, 0);
    expect(zone(game, nav)).toBe("library");
    expect(game.state.extraTurns).toEqual([A]);
  });

  it("Darksteel Monolith: once each turn, from hand, colorless only", () => {
    const { game } = table();
    spawn(game, "Darksteel Monolith");
    const ornithopter = toHand(game, "Ornithopter");
    cast(game, ornithopter, { altCost: true });
    expect(zone(game, ornithopter)).toBe("battlefield");
    const second = toHand(game, "Ornithopter");
    expect(() => cast(game, second, { altCost: true })).toThrow();
  });

  it("Leyline of Mutation pays five colors for any spell", () => {
    const { game } = table();
    spawn(game, "Leyline of Mutation");
    lands(game, "City of Brass", 5);
    const blast = toHand(game, "Worldfire");
    expect(game.legalActions(A).some((o) => o.kind === "cast-spell" && o.card === blast && o.altCost === true)).toBe(true);
  });

  it("Corpse Cobble makes a token with the sacrificed creatures' total power", () => {
    const { game } = table();
    const a = spawn(game, "Grizzly Bears");
    const b = spawn(game, "Hill Giant");
    spawn(game, "Llanowar Elves");
    lands(game, "Underground Sea", 2);
    const cobble = toHand(game, "Corpse Cobble");
    cast(game, cobble, { x: 2, settle: false });
    game.dispatch({ type: "sacrifice", player: A, permanents: [a, b] });
    settle(game);
    const token = named(game, "Zombie Token (Blue-Black, Menace)")[0];
    expect(pt(game, token)).toEqual({ power: 5, toughness: 5 });
    expect(tokensNamed(game, "Zombie Token (Blue-Black, Menace)")).toBe(1);
  });

  it("Soulblast sacrifices them all, and deals their total power", () => {
    const { game } = table();
    spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant");
    lands(game, "Mountain", 6);
    const blast = toHand(game, "Soulblast");
    cast(game, blast, { targets: [ref("bob" as never)] });
    expect(life(game, "bob" as never)).toBe(15);
    expect(graveyard(game).length).toBe(3);
  });

  it("Verdeloth: kicker {X}, X reads what was paid", () => {
    const { game } = table();
    lands(game, "Forest", 8);
    const verdeloth = toHand(game, "Verdeloth the Ancient");
    cast(game, verdeloth, { x: 2, kicked: true });
    expect(tokensNamed(game, "Saproling Token")).toBe(2);
    settle(game);
  });

  it("an Inscription chooses any number of modes when kicked, one otherwise", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", "bob" as never);
    lands(game, "Swamp", 7);
    const card = toHand(game, "Inscription of Ruin");
    expect(() => cast(game, card, { modes: [0, 2], targets: [ref("bob" as never), ref(bears)] })).toThrow();
    cast(game, card, { kicked: true, modes: [0, 2], targets: [ref("bob" as never), ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("flagged cards on the cost pipeline", () => {
  it("World War Hulk: the next red or green creature spell is free, once", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    cast(game, toHand(game, "World War Hulk"));
    const elf = toHand(game, "Llanowar Elves");
    const next = toHand(game, "Llanowar Elves");
    cast(game, elf, { altCost: true });
    expect(zone(game, elf)).toBe("battlefield");
    expect(() => cast(game, next, { altCost: true })).toThrow();
  });

  it("World War Hulk doesn't reach a spell of another color", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    cast(game, toHand(game, "World War Hulk"));
    const crow = toHand(game, "Storm Crow");
    expect(() => cast(game, crow, { altCost: true })).toThrow();
  });

  it("The Dominion Bracelet: the equipped creature's power comes off, and the Bracelet is exiled as a cost", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    const bracelet = spawn(game, "The Dominion Bracelet");
    lands(game, "Wastes", 1);
    activate(game, bracelet, 0, { targets: [ref(giant)] });
    lands(game, "Wastes", 11);
    activate(game, giant, 0, { targets: [ref("bob" as never)] });
    expect(zone(game, bracelet)).toBe("exile");
    expect((game.state.playerControl ?? []).length).toBe(1);
  });
  it("Varolz gives a creature card in your graveyard scavenge at its mana cost", () => {
    const { game } = table();
    spawn(game, "Varolz, the Scar-Striped");
    const bears = spawn(game, "Hill Giant");
    const dead = toGraveyard(game, "Hill Giant");
    lands(game, "Mountain", 4);
    activate(game, dead, 0, { targets: [ref(bears)] });
    expect(zone(game, dead)).toBe("exile");
    expect(counters(game, bears)).toBe(3);
  });
  it("Sinister Concoction discards before it mills (601.2h: library parts last)", () => {
    const { game, a } = table();
    const concoction = spawn(game, "Sinister Concoction");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 1);
    game.state.zones.perPlayer[A].hand = [];
    const card = toHand(game, "Wastes");
    toHand(game, "Wastes");
    const top = toLibrary(game, "Hill Giant");
    let libraryTopAtDiscard: string | undefined;
    a.chooseDiscardsFn = (cards) => {
      libraryTopAtDiscard = game.state.objects[top]?.zone;
      return cards.slice(0, 1).map((c) => c.id);
    };
    activate(game, concoction, 0, { targets: [ref(bears)] });
    expect(zone(game, card)).toBe("graveyard");
    expect(libraryTopAtDiscard).toBe("library");
    expect(zone(game, top)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
  });
});
