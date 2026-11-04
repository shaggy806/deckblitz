/**
 * Text-changing effects (rule 612, layer 3 — 613.1c): "change the text of
 * target spell or permanent by replacing all instances of one color word with
 * another" (Sleight of Mind), "one basic land type with another" (Magical
 * Hack), either (Mind Bend), until end of turn (Crystal Spray). Both words are
 * chosen as it resolves; every instance in the object's own text changes —
 * protection, landwalk, a static's filter, a spell's target restriction, its
 * type line's land types — and never a name or a mana symbol (612.2).
 */

import { describe, expect, it } from "vitest";

import { BUILTIN_CARDS, TOKEN_CARDS } from "../cards/generated.js";
import { computeCharacteristics } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { rulesTextName } from "../state.js";
import { changeDefinitionText, COLOR_WORD_KEYS } from "../text-change.js";
import { A, B, cast, keywords, lands, nextTurn, pt, ref, registryOf, settle, spawn, subtypes, table, toHand, zone } from "./harness.js";

const protectionColors = (game: Game, id: ObjectId): string[] => [
  ...computeCharacteristics(game.state, registryOf(game), id).protectionFrom.colors,
];
const manaTexts = (game: Game, id: ObjectId): string[] =>
  game
    .legalActions(A)
    .flatMap((action) => (action.kind === "activate-ability" && action.source === id ? [action.text] : []));
/** Answers each word choice in turn, recording what each offered. */
const answer = (seat: ReturnType<typeof table>["a"], ...words: string[]): (readonly string[])[] => {
  const offered: (readonly string[])[] = [];
  seat.chooseCreatureTypeFn = (_view, _source, options) => {
    offered.push(options);
    return words[offered.length - 1];
  };
  return offered;
};

describe("Sleight of Mind — one colour word for another", () => {
  it("asks both words as it resolves, the second never the first, and changes protection", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const knight = spawn(game, "White Knight", B);
    expect(protectionColors(game, knight)).toEqual(["B"]);
    const offered = answer(a, "black", "red");
    const sleight = toHand(game, "Sleight of Mind");
    cast(game, sleight, { targets: [ref(knight)], settle: false });
    expect(offered).toEqual([]);
    settle(game);
    expect(offered[0]).toEqual(["white", "blue", "black", "red", "green"]);
    expect(offered[1]).toEqual(["white", "blue", "red", "green"]);
    expect(protectionColors(game, knight)).toEqual(["R"]);
    // Its name, mana cost and colour are no text it changes.
    expect(computeCharacteristics(game.state, registryOf(game), knight).colors).toEqual(new Set(["W"]));
    // Indefinitely: still so turns later.
    nextTurn(game);
    nextTurn(game);
    expect(protectionColors(game, knight)).toEqual(["R"]);
    // The client shows the changed text.
    const seen = game.viewFor(A).objects[knight];
    expect(seen.text).toMatch(/Protection from red$/);
    expect(seen.text).not.toMatch(/black/);
  });

  it("changes a static's filter: Bad Moon's black creatures become green ones", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const moon = spawn(game, "Bad Moon");
    const elves = spawn(game, "Llanowar Elves");
    expect(pt(game, elves)).toEqual({ power: 1, toughness: 1 });
    answer(a, "black", "green");
    cast(game, toHand(game, "Sleight of Mind"), { targets: [ref(moon)] });
    expect(pt(game, elves)).toEqual({ power: 2, toughness: 2 });
  });

  it("changes a spell on the stack: a Doom Blade made 'nonwhite' loses its white target", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    lands(game, "Island", 1);
    const lions = spawn(game, "Savannah Lions", B);
    const blade = toHand(game, "Doom Blade");
    cast(game, blade, { targets: [ref(lions)], settle: false });
    answer(a, "black", "white");
    cast(game, toHand(game, "Sleight of Mind"), { targets: [ref(blade)] });
    expect(zone(game, lions)).toBe("battlefield");
    expect(game.events.some((e) => e.type === "spell-fizzled" && e.object === blade)).toBe(true);
  });

  it("keeps a permanent spell's change on the permanent it becomes (rule 400.7a)", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    lands(game, "Island", 1);
    const knight = toHand(game, "White Knight");
    cast(game, knight, { settle: false });
    answer(a, "black", "blue");
    cast(game, toHand(game, "Sleight of Mind"), { targets: [ref(knight)] });
    expect(zone(game, knight)).toBe("battlefield");
    expect(protectionColors(game, knight)).toEqual(["U"]);
  });

  it("never changes a mana symbol: Dark Ritual still adds {B}{B}{B}", () => {
    const registry = registryOf(table().game);
    const ritual = registry.get("Dark Ritual");
    expect(changeDefinitionText(ritual, [{ from: "black", to: "red" }]).effect).toEqual(ritual.effect);
  });
});

describe("Magical Hack — one basic land type for another", () => {
  it("changes landwalk", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const wraith = spawn(game, "Bog Wraith", B);
    answer(a, "Swamp", "Plains");
    cast(game, toHand(game, "Magical Hack"), { targets: [ref(wraith)] });
    expect(keywords(game, wraith).has("plainswalk")).toBe(true);
    expect(keywords(game, wraith).has("swampwalk")).toBe(false);
  });

  it("changes a land's type line: a Forest made an Island taps for {U} and keeps its name", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const forest = spawn(game, "Forest", B);
    expect(subtypes(game, forest)).toEqual(["Forest"]);
    answer(a, "Forest", "Island");
    cast(game, toHand(game, "Magical Hack"), { targets: [ref(forest)] });
    expect(subtypes(game, forest)).toEqual(["Island"]);
    expect(game.state.objects[forest].cardName).toBe("Forest");
    // Its mana ability is its type's (rule 305.6).
    const { game: g2, a: a2 } = table();
    lands(g2, "Island", 1);
    const mine = spawn(g2, "Forest");
    answer(a2, "Forest", "Island");
    cast(g2, toHand(g2, "Magical Hack"), { targets: [ref(mine)] });
    expect(manaTexts(g2, mine)).toEqual(["{T}: Add {U}."]);
  });

  it("changes a land type an Aura's effect names: Spreading Seas makes its land a Swamp instead", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const forest = spawn(game, "Forest", B);
    const seas = toHand(game, "Spreading Seas");
    cast(game, seas, { targets: [ref(forest)] });
    expect(subtypes(game, forest)).toEqual(["Island"]);
    answer(a, "Island", "Swamp");
    cast(game, toHand(game, "Magical Hack"), { targets: [ref(seas)] });
    expect(subtypes(game, forest)).toEqual(["Swamp"]);
  });
});

describe("Mind Bend and Crystal Spray — either kind of word", () => {
  it("offers every colour word and land type, then only the first word's kind (Mind Bend)", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const wraith = spawn(game, "Bog Wraith", B);
    const offered = answer(a, "Swamp", "Forest");
    cast(game, toHand(game, "Mind Bend"), { targets: [ref(wraith)] });
    expect(offered[0]).toEqual(["white", "blue", "black", "red", "green", "Plains", "Island", "Swamp", "Mountain", "Forest"]);
    expect(offered[1]).toEqual(["Plains", "Island", "Mountain", "Forest"]);
    expect(keywords(game, wraith).has("forestwalk")).toBe(true);
  });

  it("lasts until end of turn, and the spell goes on to draw a card (Crystal Spray)", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const wraith = spawn(game, "Bog Wraith", B);
    answer(a, "Swamp", "Mountain");
    const handBefore = game.state.zones.perPlayer[A].hand.length;
    cast(game, toHand(game, "Crystal Spray"), { targets: [ref(wraith)] });
    expect(keywords(game, wraith).has("mountainwalk")).toBe(true);
    expect(game.state.zones.perPlayer[A].hand.length).toBe(handBefore + 1);
    nextTurn(game);
    expect(keywords(game, wraith).has("swampwalk")).toBe(true);
    expect(keywords(game, wraith).has("mountainwalk")).toBe(false);
    expect(rulesTextName(game.state.objects[wraith])).toBe("Bog Wraith");
  });

  it("applies two changes in timestamp order: black to green, then green to red", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const knight = spawn(game, "White Knight", B);
    answer(a, "black", "green");
    cast(game, toHand(game, "Sleight of Mind"), { targets: [ref(knight)] });
    answer(a, "green", "red");
    cast(game, toHand(game, "Sleight of Mind"), { targets: [ref(knight)] });
    expect(protectionColors(game, knight)).toEqual(["R"]);
  });
});

describe("chroma's colour word", () => {
  it("Sleight of Mind on Light from Within counts the new colour's symbols", () => {
    const { game, a } = table();
    const light = spawn(game, "Light from Within");
    const angel = spawn(game, "Serra Angel");
    const elves = spawn(game, "Llanowar Elves");
    lands(game, "Island", 2);
    answer(a, "white", "green");
    cast(game, toHand(game, "Sleight of Mind"), { targets: [ref(light)] });
    expect(pt(game, angel)).toEqual({ power: 4, toughness: 4 });
    expect(pt(game, elves)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("the pool's text holds no colour word the change can't reach", () => {
  // A colour letter outside these fields is a mana symbol, a choice's
  // option or value, or a printed characteristic — none of them a word.
  // Mana symbols, not words (rule 612.2): "produces {B}" (Infernal Darkness,
  // Deep Water) included.
  const NOT_WORDS = new Set(["mana", "oneOf", "all", "xColor", "chooseOnEnter", "value", "produces", "landManaInstead"]);

  it("every field holding a colour is a colour-word field or a known non-word one", () => {
    const unknown = new Map<string, string>();
    const walk = (v: unknown, key: string | null, name: string): void => {
      if (Array.isArray(v)) {
        for (const x of v) walk(x, key, name);
      } else if (v !== null && typeof v === "object") {
        for (const [k, x] of Object.entries(v)) if (k !== "text") walk(x, k, name);
      } else if (typeof v === "string" && ["W", "U", "B", "R", "G"].includes(v) && key !== null) {
        if (!COLOR_WORD_KEYS.has(key) && !NOT_WORDS.has(key) && !unknown.has(key)) unknown.set(key, name);
      }
    };
    for (const def of [...BUILTIN_CARDS, ...TOKEN_CARDS]) {
      for (const [k, v] of Object.entries(def)) if (!["colors", "text"].includes(k)) walk(v, k, def.name);
    }
    expect([...unknown]).toEqual([]);
  });

  it("the only shorthand naming a colour word is the one the change rewrites (Doom Blade's)", () => {
    const word = /(^|[^a-z])(non)?(white|blue|black|red|green)([^a-z]|$)/i;
    // Display strings, names and a choice's options are never rules words
    // here (612.2): the walker skips them too.
    const skip = new Set(["text", "prompt", "label", "name", "token", "cardName", "hasName", "art", "tokenName", "faces", "options", "chooseOnEnter", "value"]);
    const found = new Set<string>();
    const walk = (v: unknown): void => {
      if (Array.isArray(v)) for (const x of v) walk(x);
      else if (v !== null && typeof v === "object") {
        for (const [k, x] of Object.entries(v)) if (!skip.has(k)) walk(x);
      } else if (typeof v === "string" && word.test(v)) found.add(v);
    };
    for (const def of [...BUILTIN_CARDS, ...TOKEN_CARDS]) for (const [k, v] of Object.entries(def)) if (!skip.has(k)) walk(v);
    expect([...found]).toEqual(["nonblack-creature"]);
  });

  it("no card that reads through a `resolve` hatch names a colour word or land type", () => {
    const words = /\b(non)?(white|blue|black|red|green|plains|islands?|swamps?|mountains?|forests?)/i;
    const hatched = (v: unknown): boolean =>
      typeof v === "function" ||
      (Array.isArray(v) ? v.some(hatched) : v !== null && typeof v === "object" && Object.values(v).some(hatched));
    const offenders = [...BUILTIN_CARDS, ...TOKEN_CARDS]
      .filter((def) => hatched(def) && words.test(def.text.replace(/\([^)]*\)/g, "").split(def.name).join("")))
      .map((def) => def.name);
    expect(offenders).toEqual([]);
  });
});
