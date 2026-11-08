/**
 * Three reads of mana (theme 13, rules 106.4, 106.7, 106.12, 602.2b): what was
 * spent on a spell or an activated ability, what a tapped permanent makes
 * instead, what's unspent in a pool and how it's lost.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import { POOL_CARDS } from "../cards.js";
import type { Game } from "../game.js";
import { spentManaCount, type ManaType, type SpentMana } from "../mana.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  enter,
  graveyard,
  keywords,
  life,
  pt,
  ref,
  settle,
  spawn,
  table,
  pickFromZone,
  pickTargets,
  toHand,
  toStep,
} from "./harness.js";

const pool = (game: Game, player = A): string[] => game.state.players[player].manaPool.map((unit) => unit.type).sort();

/** Activate by hand, naming the sacrifice and the colour. */
function tapHand(
  game: Game,
  source: ObjectId,
  extra: Partial<Extract<Action, { type: "activate-ability" }>> = {},
  index = 0,
): void {
  game.dispatch({ type: "activate-ability", player: A, source, abilityIndex: index, targets: [], ...extra } as Action);
}

const units = (...types: ManaType[]): SpentMana[] => types.map((type) => ({ type }));

describe("spentManaCount", () => {
  it("counts by type, colours, the most of one colour and whole pairs", () => {
    const spent = units("G", "G", "G", "U", "C");
    expect(spentManaCount(spent, {})).toBe(5);
    expect(spentManaCount(spent, { type: "C" })).toBe(1);
    expect(spentManaCount(spent, { type: ["G", "U"] })).toBe(4);
    // Rule 106.1b: colourless is a type, not a colour.
    expect(spentManaCount(spent, { count: "colors" })).toBe(2);
    expect(spentManaCount(spent, { count: "most-of-one-color" })).toBe(3);
    // "For each {G}{G} spent": a third {G} alone adds nothing.
    expect(spentManaCount(spent, { type: "G", per: 2 })).toBe(1);
  });

  it("counts only mana from a matching source", () => {
    const treasure = { types: ["artifact" as const], subtypes: ["Treasure"], supertypes: [] };
    const spent: SpentMana[] = [{ type: "R", from: treasure }, { type: "G" }];
    expect(spentManaCount(spent, { from: { subtype: "Treasure" } })).toBe(1);
    expect(spentManaCount(spent, { from: { type: "land" } })).toBe(0);
  });
});

describe("what paid for a spell", () => {
  it("is one record: the units paid, kept by the permanent", () => {
    const { game } = table();
    spawn(game, "Forest");
    spawn(game, "Forest");
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears);
    expect(game.state.objects[bears].manaSpent?.map((unit) => unit.type)).toEqual(["G", "G"]);
    expect(game.state.objects[bears].manaSpent?.every((unit) => unit.from?.subtypes.includes("Forest"))).toBe(true);
  });
});

describe("what paid for an activated ability (rule 602.2b)", () => {
  it("Jetmir's Fixer: mana from a Treasure makes it a counter instead", () => {
    const { game } = table();
    const fixer = spawn(game, "Jetmir's Fixer");
    spawn(game, "Forest");
    spawn(game, "Treasure Token");
    activate(game, fixer);
    expect(counters(game, fixer)).toBe(1);
    expect(pt(game, fixer)).toEqual({ power: 3, toughness: 3 });
  });

  it("Jetmir's Fixer: without a Treasure it's only the pump", () => {
    const { game } = table();
    const fixer = spawn(game, "Jetmir's Fixer");
    spawn(game, "Forest");
    spawn(game, "Mountain");
    activate(game, fixer);
    expect(counters(game, fixer)).toBe(0);
    expect(pt(game, fixer)).toEqual({ power: 3, toughness: 3 });
  });

  it("Forsworn Paladin: Treasure mana adds deathtouch, other mana doesn't", () => {
    const withTreasure = table();
    const one = spawn(withTreasure.game, "Forsworn Paladin");
    spawn(withTreasure.game, "Swamp");
    spawn(withTreasure.game, "Swamp");
    spawn(withTreasure.game, "Treasure Token");
    activate(withTreasure.game, one, 1, { targets: [ref(one)] });
    expect(keywords(withTreasure.game, one).has("deathtouch")).toBe(true);
    expect(pt(withTreasure.game, one).power).toBe(3);

    const without = table();
    const two = spawn(without.game, "Forsworn Paladin");
    spawn(without.game, "Swamp");
    spawn(without.game, "Swamp");
    spawn(without.game, "Swamp");
    activate(without.game, two, 1, { targets: [ref(two)] });
    expect(keywords(without.game, two).has("deathtouch")).toBe(false);
    expect(pt(without.game, two).power).toBe(3);
  });

  it("Paragon of Modernity: exactly three colours, colourless no colour", () => {
    const three = table();
    const one = spawn(three.game, "Paragon of Modernity");
    spawn(three.game, "Plains");
    spawn(three.game, "Island");
    spawn(three.game, "Swamp");
    activate(three.game, one);
    expect(counters(three.game, one)).toBe(1);

    const wastes = table();
    const two = spawn(wastes.game, "Paragon of Modernity");
    spawn(wastes.game, "Plains");
    spawn(wastes.game, "Island");
    spawn(wastes.game, "Wastes");
    activate(wastes.game, two);
    expect(counters(wastes.game, two)).toBe(0);
    expect(pt(wastes.game, two)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("what a tapped permanent makes instead (rule 106.12b)", () => {
  it("Ritual of Subdual: the type changes and the amount doesn't", () => {
    const { game } = table();
    spawn(game, "Ritual of Subdual", B);
    const forest = spawn(game, "Forest");
    tapHand(game, forest);
    expect(pool(game)).toEqual(["C"]);
  });

  it("Damping Sphere: two or more mana is one {C}, less is untouched", () => {
    const { game } = table();
    spawn(game, "Damping Sphere", B);
    const tomb = spawn(game, "Ancient Tomb");
    tapHand(game, tomb);
    expect(pool(game)).toEqual(["C"]);
    const forest = spawn(game, "Forest");
    tapHand(game, forest);
    expect(pool(game)).toEqual(["C", "G"]);
  });

  it("Damping Sphere with Mana Reflection: read before the multiplier, the order with the most mana", () => {
    const { game } = table();
    spawn(game, "Damping Sphere", B);
    spawn(game, "Mana Reflection");
    const forest = spawn(game, "Forest");
    tapHand(game, forest);
    expect(pool(game)).toEqual(["G", "G"]);
    const tomb = spawn(game, "Ancient Tomb");
    tapHand(game, tomb);
    expect(pool(game)).toEqual(["C", "C", "G", "G"]);
  });

  it("Damping Sphere: each other spell its caster cast costs {1} more", () => {
    const { game } = table();
    spawn(game, "Damping Sphere", B);
    spawn(game, "Mountain");
    spawn(game, "Mountain");
    spawn(game, "Mountain");
    const first = toHand(game, "Lightning Bolt");
    cast(game, first, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    // The second costs {1}{R}, not {R}: two of the two Mountains left.
    const second = toHand(game, "Lightning Bolt");
    cast(game, second, { targets: [ref(B)] });
    expect(life(game, B)).toBe(14);
    expect(game.state.zones.shared.battlefield.filter((id) => game.state.objects[id].tapped).length).toBe(3);
  });

  it("Mana Reflection still doubles, as one rule", () => {
    const { game } = table();
    spawn(game, "Mana Reflection");
    const forest = spawn(game, "Forest");
    tapHand(game, forest);
    expect(pool(game)).toEqual(["G", "G"]);
  });
});

describe("unspent mana (rule 106.4)", () => {
  it("Omnath, Locus of the Void: grows with the pool, and the pool stays, colourless", () => {
    const { game } = table();
    const omnath = spawn(game, "Omnath, Locus of the Void");
    enter(game, "Wastes");
    expect(pool(game)).toEqual(["C", "C"]);
    expect(pt(game, omnath)).toEqual({ power: 8, toughness: 8 });
    const forest = spawn(game, "Forest");
    tapHand(game, forest);
    expect(pt(game, omnath)).toEqual({ power: 9, toughness: 9 });
    toStep(game, "begin-combat");
    // Lost mana stays, colourless (its ruling).
    expect(pool(game)).toEqual(["C", "C", "C"]);
    expect(pt(game, omnath)).toEqual({ power: 9, toughness: 9 });
  });

  it("Omnath, Locus of Mana: only green stays, and only green counts", () => {
    const { game } = table();
    const omnath = spawn(game, "Omnath, Locus of Mana");
    const forest = spawn(game, "Forest");
    const mountain = spawn(game, "Mountain");
    tapHand(game, forest);
    tapHand(game, mountain);
    expect(pt(game, omnath)).toEqual({ power: 2, toughness: 2 });
    toStep(game, "begin-combat");
    expect(pool(game)).toEqual(["G"]);
    expect(pt(game, omnath)).toEqual({ power: 2, toughness: 2 });
  });

  it("spending the pool shrinks what reads it", () => {
    const { game } = table();
    const omnath = spawn(game, "Omnath, Locus of Mana");
    const one = spawn(game, "Forest");
    const two = spawn(game, "Forest");
    tapHand(game, one);
    tapHand(game, two);
    expect(pt(game, omnath).power).toBe(3);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(pool(game)).toEqual([]);
    expect(pt(game, omnath).power).toBe(1);
  });

  it("Ozai: six or more unspent mana gives flying and indestructible; lost mana is red", () => {
    const { game } = table();
    const ozai = spawn(game, "Ozai, the Phoenix King");
    for (let i = 0; i < 5; i += 1) tapHand(game, spawn(game, "Forest"));
    expect(keywords(game, ozai).has("flying")).toBe(false);
    tapHand(game, spawn(game, "Forest"));
    expect(keywords(game, ozai).has("flying")).toBe(true);
    expect(keywords(game, ozai).has("indestructible")).toBe(true);
    toStep(game, "begin-combat");
    expect(pool(game)).toEqual(Array(6).fill("R"));
  });

  it("Mana Short: tapped lands and an empty pool; a step-end permission is no help", () => {
    const { game, b } = table();
    const forest = spawn(game, "Forest", B);
    spawn(game, "Leyline Tyrant", B);
    game.state.players[B].manaPool.push({ type: "R" }, { type: "G" });
    spawn(game, "Island");
    spawn(game, "Island");
    spawn(game, "Island");
    void b;
    cast(game, toHand(game, "Mana Short"), { targets: [ref(B)] });
    expect(game.state.objects[forest].tapped).toBe(true);
    expect(pool(game, B)).toEqual([]);
  });

  it("an effect's loss is replaced, and costs Yurlok's life, like a step's", () => {
    const replaced = table();
    spawn(replaced.game, "Kruphix, God of Horizons", B);
    replaced.game.state.players[B].manaPool.push({ type: "G" });
    spawn(replaced.game, "Island");
    spawn(replaced.game, "Island");
    spawn(replaced.game, "Island");
    cast(replaced.game, toHand(replaced.game, "Mana Short"), { targets: [ref(B)] });
    expect(pool(replaced.game, B)).toEqual(["C"]);

    const yurlok = table();
    spawn(yurlok.game, "Yurlok of Scorch Thrash", B);
    yurlok.game.state.players[B].manaPool.push({ type: "G" }, { type: "G" });
    spawn(yurlok.game, "Island");
    spawn(yurlok.game, "Island");
    spawn(yurlok.game, "Island");
    cast(yurlok.game, toHand(yurlok.game, "Mana Short"), { targets: [ref(B)] });
    expect(life(yurlok.game, B)).toBe(18);
  });

  it("Power Sink: an unpaid X taps only lands with mana abilities and empties the pool", () => {
    const { game } = table();
    spawn(game, "Forest");
    spawn(game, "Forest");
    const spare = spawn(game, "Forest");
    const depths = spawn(game, "Dark Depths");
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    expect(game.state.objects[bears].zone).toBe("stack");
    game.state.players[A].manaPool.push({ type: "U" });
    // X is 3: more than the Forest left and the floating {U} can pay.
    for (let i = 0; i < 4; i += 1) spawn(game, "Island", B);
    game.state.priority.holder = B;
    cast(game, toHand(game, "Power Sink", B), { player: B, targets: [ref(bears)], x: 3 });
    expect(game.state.objects[bears].zone).toBe("graveyard");
    expect(game.state.objects[depths].tapped).toBe(false);
    expect(game.state.objects[spare].tapped).toBe(true);
    expect(pool(game, A)).toEqual([]);
  });
});

describe("pairs and unspent mana on the proving cards", () => {
  it("Doubling Cube: each type doubled, the cost's mana gone first", () => {
    const { game } = table();
    const cube = spawn(game, "Doubling Cube");
    game.state.players[A].manaPool.push(
      { type: "R" },
      { type: "G", restriction: { spell: { type: "creature" }, text: "creature spells only" } },
      { type: "C" },
      { type: "C" },
      { type: "C" },
    );
    tapHand(game, cube);
    // {3} took the {C}s; what was left doubled, one of each plain (rule 106.6).
    expect(pool(game)).toEqual(["G", "G", "R", "R"]);
    const greens = game.state.players[A].manaPool.filter((unit) => unit.type === "G");
    expect(greens.filter((unit) => unit.restriction !== undefined)).toHaveLength(1);
  });

  it("Glissa Sunseeker: destroys an artifact only at the pool's amount", () => {
    const { game } = table();
    const glissa = spawn(game, "Glissa Sunseeker");
    const ring = spawn(game, "Sol Ring", B);
    activate(game, glissa, 0, { targets: [ref(ring)] });
    expect(game.state.objects[ring].zone).toBe("battlefield");
    const again = table();
    const second = spawn(again.game, "Glissa Sunseeker");
    const relic = spawn(again.game, "Sol Ring", B);
    again.game.state.players[A].manaPool.push({ type: "G" });
    activate(again.game, second, 0, { targets: [ref(relic)] });
    expect(again.game.state.objects[relic].zone).toBe("graveyard");
  });

  it("Bladecoil Serpent: whole pairs, and nothing else counts", () => {
    const { game } = table();
    for (let i = 0; i < 3; i += 1) spawn(game, "Island");
    for (let i = 0; i < 3; i += 1) spawn(game, "Wastes");
    const before = game.state.zones.perPlayer[A].hand.length;
    const serpent = toHand(game, "Bladecoil Serpent");
    cast(game, serpent, { x: 0 });
    expect(game.state.objects[serpent].zone).toBe("battlefield");
    // Three {U}: one {U}{U}.
    expect(game.state.zones.perPlayer[A].hand.length).toBe(before + 1);
  });

  it("Clay Champion: three counters for each {G}{G}", () => {
    const { game } = table();
    for (let i = 0; i < 4; i += 1) spawn(game, "Forest");
    const champion = toHand(game, "Clay Champion");
    cast(game, champion, { x: 0 });
    expect(counters(game, champion)).toBe(6);
  });

  it("Wumpus Aberration: no trigger when {C} paid for it", () => {
    const { game } = table();
    spawn(game, "Forest");
    for (let i = 0; i < 3; i += 1) spawn(game, "Wastes");
    const bear = toHand(game, "Grizzly Bears", B);
    const wumpus = toHand(game, "Wumpus Aberration");
    cast(game, wumpus);
    expect(game.state.objects[wumpus].zone).toBe("battlefield");
    expect(game.state.objects[bear].zone).toBe("hand");
  });

  it("Wumpus Aberration: without {C}, its target opponent may put a creature in", () => {
    const { game, a, b } = table();
    for (let i = 0; i < 4; i += 1) spawn(game, "Forest");
    const bear = toHand(game, "Grizzly Bears", B);
    pickTargets(a, B);
    pickFromZone(b, bear);
    cast(game, toHand(game, "Wumpus Aberration"));
    expect(game.state.objects[bear].zone).toBe("battlefield");
  });
});

describe("a depletion land", () => {
  it("Peat Bog: two counters, {B}{B} a use, sacrificed with the last", () => {
    const { game } = table();
    const bog = enter(game, "Peat Bog");
    expect(game.state.objects[bog].tapped).toBe(true);
    expect(counters(game, bog, "depletion")).toBe(2);
    game.state.objects[bog].tapped = false;
    tapHand(game, bog);
    expect(pool(game)).toEqual(["B", "B"]);
    expect(counters(game, bog, "depletion")).toBe(1);
    game.state.objects[bog].tapped = false;
    tapHand(game, bog);
    settle(game);
    expect(graveyard(game)).toContain(bog);
  });
});

describe("Squandered Resources (rule 106.7)", () => {
  it("offers each colour with only the lands that make it", () => {
    const { game } = table();
    const squander = spawn(game, "Squandered Resources");
    const forest = spawn(game, "Forest");
    const island = spawn(game, "Island");
    const depths = spawn(game, "Dark Depths");
    const offers = game
      .legalActions(A)
      .filter((o) => o.kind === "activate-ability" && o.source === squander) as Extract<
      ReturnType<Game["legalActions"]>[number],
      { kind: "activate-ability" }
    >[];
    const byColor = new Map(offers.map((o) => [o.manaColors?.[0] ?? "none", o.sacrifice?.choices]));
    expect(byColor.get("G")).toEqual([forest]);
    expect(byColor.get("U")).toEqual([island]);
    expect(byColor.get("none")).toEqual([depths]);
  });

  it("makes one mana the sacrificed land could produce, read before the cost took it", () => {
    const { game } = table();
    const squander = spawn(game, "Squandered Resources");
    const forest = spawn(game, "Forest");
    tapHand(game, squander, { sacrifice: forest, manaColors: ["G"] });
    expect(graveyard(game)).toContain(forest);
    expect(pool(game)).toEqual(["G"]);
  });

  it("makes none for a land that could produce none (the ruling)", () => {
    const { game } = table();
    const squander = spawn(game, "Squandered Resources");
    const depths = spawn(game, "Dark Depths");
    tapHand(game, squander, { sacrifice: depths });
    expect(graveyard(game)).toContain(depths);
    expect(pool(game)).toEqual([]);
  });

  it("reads the replacement: under Contamination a Forest could produce only {B}", () => {
    const { game } = table();
    const squander = spawn(game, "Squandered Resources");
    spawn(game, "Contamination", B);
    const forest = spawn(game, "Forest");
    tapHand(game, squander, { sacrifice: forest, manaColors: ["B"] });
    expect(pool(game)).toEqual(["B"]);
  });
});

/** Everything in a definition that's an object. */
function* walk(value: unknown): Generator<Record<string, unknown>> {
  if (Array.isArray(value)) {
    for (const item of value) yield* walk(item);
    return;
  }
  if (value === null || typeof value !== "object") return;
  const object = value as Record<string, unknown>;
  yield object;
  for (const v of Object.values(object)) if (typeof v === "object") yield* walk(v);
}

describe("every definition speaks the one vocabulary", () => {
  const REMOVED = ["manaFrom", "manaSpentOfColors", "manaSpentOfOneColor", "colorsSpentOf", "landManaInstead", "unspentManaBecomesColorless"];

  it("the removed spellings are gone, and every manaSpent clause and production rule is well formed", () => {
    const bad: string[] = [];
    let clauses = 0;
    let rules = 0;
    for (const card of POOL_CARDS) {
      for (const o of walk(card)) {
        for (const f of REMOVED) if (f in o) bad.push(`${card.name}: ${f}`);
        if ((o as { event?: unknown }).event === "tap-for-mana") bad.push(`${card.name}: tap-for-mana replacement`);
        if ("manaSpent" in o) {
          if (!Array.isArray(o.manaSpent)) bad.push(`${card.name}: manaSpent isn't a clause list`);
          else clauses += o.manaSpent.length;
        }
        if ("manaProduction" in o) {
          const list = (Array.isArray(o.manaProduction) ? o.manaProduction : [o.manaProduction]) as Record<string, unknown>[];
          for (const rule of list) {
            rules += 1;
            if (rule.tapper === undefined) bad.push(`${card.name}: a production rule with no tapper`);
            if (rule.produces === undefined && rule.times === undefined) bad.push(`${card.name}: a production rule that changes nothing`);
          }
        }
      }
    }
    expect(bad).toEqual([]);
    // The walk really reached them (a broken walker would pass).
    expect(clauses).toBeGreaterThan(100);
    expect(rules).toBeGreaterThan(9);
  });
});
