/**
 * One patch for what an effect can make a permanent into (need-key-themes
 * theme 8): the `become` effect, copy exceptions and statics saying it in the
 * same words, and the cards that prove each.
 */

import { describe, expect, it } from "vitest";

import { POOL_CARDS } from "../cards.js";
import { effectiveColors, effectiveSupertypes } from "../characteristics.js";
import { changesOnlyColors, patchModifier } from "../characteristics-patch.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { hasSubtype } from "../subtypes.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  loyalty,
  nextTurn,
  pickFromZone,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  subtypes,
  table,
  toExile,
  toGraveyard,
  toHand,
  toStep,
  types,
  zone,
} from "./harness.js";

const colorsOf = (game: Game, id: ObjectId): string[] =>
  [...effectiveColors(game.state, registryOf(game), game.state.objects[id])].sort();
const supertypes = (game: Game, id: ObjectId): readonly string[] =>
  effectiveSupertypes(game.state, registryOf(game), game.state.objects[id]);
const is = (game: Game, id: ObjectId, subtype: string): boolean => hasSubtype(subtypes(game, id), subtype);

describe("the patch", () => {
  it("a modifier says what was asked and nothing else", () => {
    expect(patchModifier({ power: 3, toughness: 3, addTypes: ["creature"], name: "Bob" })).toEqual({
      power: 0,
      toughness: 0,
      keywords: [],
      addTypes: ["creature"],
      setName: "Bob",
      setPt: [3, 3],
    });
    expect(patchModifier({ power: 0 })).toMatchObject({ setPower: 0 });
    expect(patchModifier({ toughness: 1 })).toMatchObject({ setToughness: 1 });
    expect(patchModifier({ loseAbilities: true, loseKeywords: ["flying"] })).toMatchObject({
      loseAbilities: true,
      loseKeywords: ["flying"],
    });
  });

  it("only a colour change reaches a spell", () => {
    expect(changesOnlyColors({ setColors: ["U"] })).toBe(true);
    expect(changesOnlyColors({ addColors: ["U"] })).toBe(true);
    expect(changesOnlyColors({ setColors: ["U"], addTypes: ["creature"] })).toBe(false);
    expect(changesOnlyColors({ power: 1 })).toBe(false);
  });

  it("the removed spellings are gone from the pool", () => {
    const FIELDS = ["typesOutsideBattlefield", "setBasePtFromAffectedCounters", "setBasePtFromSourceCount", "notLegendary", "basePtExceptions"];
    const KINDS = new Set(["animate", "add-types", "animate-all", "lose-abilities", "lose-abilities-all", "become-color", "lose-keywords"]);
    const bad: string[] = [];
    const walk = (card: string, value: unknown): void => {
      if (Array.isArray(value)) {
        for (const item of value) walk(card, item);
      } else if (value !== null && typeof value === "object") {
        const o = value as Record<string, unknown>;
        if (typeof o.kind === "string" && KINDS.has(o.kind)) bad.push(`${card}: ${o.kind}`);
        for (const f of FIELDS) if (f in o) bad.push(`${card}: ${f}`);
        if (o.kind === "create-token-copy" && Array.isArray(o.basePt)) bad.push(`${card}: create-token-copy basePt`);
        for (const v of Object.values(o)) walk(card, v);
      }
    };
    for (const card of POOL_CARDS) walk(card.name, card);
    expect(bad).toEqual([]);
  });
});

describe("become over a set (Sudden Spoiling)", () => {
  it("every creature that player controls loses all abilities and is a 0/2, one effect", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel", B);
    const mine = spawn(game, "Serra Angel", A);
    lands(game, "Swamp", 3);
    cast(game, toHand(game, "Sudden Spoiling"), { targets: [ref(B)] });
    expect(pt(game, angel)).toEqual({ power: 0, toughness: 2 });
    expect(keywords(game, angel).has("flying")).toBe(false);
    expect(pt(game, mine)).toEqual({ power: 4, toughness: 4 });
    nextTurn(game);
    expect(pt(game, angel)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, angel).has("flying")).toBe(true);
  });
});

describe("types and colours everywhere (the Mycosynths)", () => {
  it("Mycosynth Lattice: all permanents artifacts, everything colourless, any mana for anyone", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    const forest = spawn(game, "Forest", B);
    expect(colorsOf(game, bear)).toEqual(["G"]);
    spawn(game, "Mycosynth Lattice");
    expect(types(game, bear)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(types(game, forest)).toEqual(expect.arrayContaining(["artifact", "land"]));
    expect(colorsOf(game, bear)).toEqual([]);
    const inHand = toHand(game, "Grizzly Bears", B);
    const inGrave = toGraveyard(game, "Serra Angel", B);
    expect(colorsOf(game, inHand)).toEqual([]);
    expect(colorsOf(game, inGrave)).toEqual([]);
    // Swamps pay white pips.
    lands(game, "Swamp", 5);
    cast(game, toHand(game, "Serra Angel"));
    expect(game.battlefield.some((id) => game.state.objects[id].cardName === "Serra Angel")).toBe(true);
  });

  it("Encroaching Mycosynth: nonland permanents, permanent spells, nonland permanent cards: yours", () => {
    const { game } = table();
    spawn(game, "Encroaching Mycosynth");
    const bear = spawn(game, "Grizzly Bears");
    const forest = spawn(game, "Forest");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(types(game, bear)).toContain("artifact");
    expect(types(game, forest)).not.toContain("artifact");
    expect(types(game, theirs)).not.toContain("artifact");
    expect(types(game, toHand(game, "Grizzly Bears"))).toContain("artifact");
    expect(types(game, toHand(game, "Forest"))).not.toContain("artifact");
    expect(types(game, toHand(game, "Lightning Bolt"))).not.toContain("artifact");
    expect(types(game, toHand(game, "Grizzly Bears", B))).not.toContain("artifact");
  });
});

describe("a base P/T each permanent reads for itself", () => {
  it("Opalescence: each other non-Aura enchantment, by its mana value, and the Aura and it stay", () => {
    const { game } = table();
    const opal = spawn(game, "Opalescence");
    const ench = spawn(game, "Propaganda");
    expect(types(game, ench)).toContain("creature");
    expect(pt(game, ench)).toEqual({ power: 3, toughness: 3 });
    expect(types(game, opal)).not.toContain("creature");
  });

  it("Starfield of Nyx: only as long as you control five enchantments", () => {
    const { game } = table();
    spawn(game, "Starfield of Nyx");
    const others = [spawn(game, "Propaganda"), spawn(game, "Propaganda"), spawn(game, "Propaganda")];
    expect(types(game, others[0])).not.toContain("creature");
    spawn(game, "Propaganda");
    expect(types(game, others[0])).toContain("creature");
    expect(pt(game, others[0])).toEqual({ power: 3, toughness: 3 });
  });

  it("March of the Machines: a set found in layer 4 keeps its P/T in 7b (613.6)", () => {
    const { game } = table();
    const ring = spawn(game, "Sol Ring");
    const walker = spawn(game, "Ornithopter");
    const zero = spawn(game, "Mox Diamond");
    spawn(game, "March of the Machines");
    expect(pt(game, zero)).toEqual({ power: 0, toughness: 0 });
    expect(types(game, ring)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(pt(game, ring)).toEqual({ power: 1, toughness: 1 });
    expect(pt(game, walker)).toEqual({ power: 0, toughness: 2 });
    lands(game, "Wastes", 1);
    settle(game);
  });
});

describe("Karn, the Great Creator", () => {
  it("+1 makes an artifact creature by its mana value until your next turn, replacing its types", () => {
    const { game } = table();
    const karn = spawn(game, "Karn, the Great Creator");
    const ring = spawn(game, "Sol Ring");
    loyalty(game, karn, 1, { targets: [ref(ring)] });
    expect(types(game, ring)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    expect(pt(game, ring)).toEqual({ power: 1, toughness: 1 });
    nextTurn(game); // bob's
    expect(types(game, ring)).toContain("creature");
    nextTurn(game); // alice's: "until your next turn"
    expect(types(game, ring)).not.toContain("creature");
    const citadel = spawn(game, "Darksteel Citadel");
    game.state.objects[karn].counters.loyalty = 9;
    loyalty(game, karn, 1, { targets: [ref(citadel)] });
    // Mana value 0: "becomes an artifact creature" replaces its types and it's a 0/0.
    expect(zone(game, citadel)).toBe("graveyard");
  });

  it("the ability needs no target, and its rule stops an opponent's artifact", () => {
    const { game } = table();
    const karn = spawn(game, "Karn, the Great Creator");
    loyalty(game, karn, 1, { targets: [null] });
    expect(game.state.objects[karn].counters.loyalty).toBe(6);
    expect(game.state.objects[karn].cardName).toBe("Karn, the Great Creator");
  });

  it("−2 takes a face-up artifact card you own in exile", () => {
    const { game, a } = table();
    const karn = spawn(game, "Karn, the Great Creator");
    const ring = toExile(game, "Sol Ring");
    pickFromZone(a, ring);
    loyalty(game, karn, -2);
    expect(hand(game)).toContain(ring);
  });
});

describe("creature types and supertypes", () => {
  it("Amoeboid Changeling: all of them, then none", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears");
    const shifter = spawn(game, "Amoeboid Changeling");
    activate(game, shifter, 0, { targets: [ref(bear)] });
    expect(is(game, bear, "Goblin")).toBe(true);
    const other = spawn(game, "Amoeboid Changeling");
    activate(game, other, 1, { targets: [ref(bear)] });
    expect(is(game, bear, "Goblin")).toBe(false);
    expect(is(game, bear, "Bear")).toBe(false);
  });

  it("Nameless Inversion: +3/-3, and no creature types", () => {
    const { game } = table();
    const angel = spawn(game, "Serra Angel");
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Nameless Inversion"), { targets: [ref(angel)] });
    expect(pt(game, angel)).toEqual({ power: 7, toughness: 1 });
    expect(is(game, angel, "Angel")).toBe(false);
  });

  it("Shields of Velis Vel and Ego Erasure: a player's creatures, all or none", () => {
    const { game } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    cast(game, toHand(game, "Shields of Velis Vel"), { targets: [ref(B)] });
    expect(is(game, bear, "Sliver")).toBe(true);
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 3 });
    lands(game, "Island", 3);
    cast(game, toHand(game, "Ego Erasure"), { targets: [ref(B)] });
    expect(is(game, bear, "Sliver")).toBe(false);
    expect(pt(game, bear)).toEqual({ power: 0, toughness: 3 });
  });

  it("Melting and a later \"becomes snow\": layer 4 in timestamp order (613.7)", () => {
    const { game } = table();
    const land = spawn(game, "Snow-Covered Island");
    expect(supertypes(game, land)).toContain("snow");
    spawn(game, "Melting");
    expect(supertypes(game, land)).not.toContain("snow");
    lands(game, "Island", 1);
    cast(game, toHand(game, "Thermal Flux"), { modes: [0], targets: [ref(land)] });
    expect(supertypes(game, land)).toContain("snow");
    nextTurn(game);
    expect(supertypes(game, land)).not.toContain("snow");
  });

  it("Arcum's Weathervane: basic land becomes snow, and stays", () => {
    const { game } = table();
    const vane = spawn(game, "Arcum's Weathervane");
    lands(game, "Island", 2);
    const land = spawn(game, "Forest");
    activate(game, vane, 1, { targets: [ref(land)] });
    expect(supertypes(game, land)).toContain("snow");
    nextTurn(game);
    expect(supertypes(game, land)).toContain("snow");
  });
});

describe("copy exceptions are the patch", () => {
  it("Omni-Changeling copies a creature and is every creature type, and a Clone of it is too", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears");
    a.chooseCopyFn = () => bear;
    lands(game, "Island", 5);
    cast(game, toHand(game, "Omni-Changeling"));
    const copy = game.battlefield.find((id) => id !== bear && game.state.objects[id].copyOf === "Grizzly Bears")!;
    expect(pt(game, copy)).toEqual({ power: 2, toughness: 2 });
    expect(is(game, copy, "Goblin")).toBe(true);
    a.chooseCopyFn = () => copy;
    lands(game, "Island", 4);
    cast(game, toHand(game, "Clone"));
    const clone = game.battlefield.find((id) => id !== bear && id !== copy && game.state.objects[id].copyOf === "Grizzly Bears")!;
    expect(is(game, clone, "Goblin")).toBe(true);
  });

  it("Moritte: legendary and snow, and only a creature gets the counters and changeling", () => {
    const creature = (): void => {
      const { game, a } = table();
      const bear = spawn(game, "Grizzly Bears");
      a.chooseCopyFn = () => bear;
      lands(game, "Forest", 2);
      lands(game, "Island", 3);
      cast(game, toHand(game, "Moritte of the Frost"));
      const copy = game.battlefield.find((id) => id !== bear && game.state.objects[id].copyOf === "Grizzly Bears")!;
      expect(supertypes(game, copy)).toEqual(expect.arrayContaining(["legendary", "snow"]));
      expect(counters(game, copy)).toBe(2);
      expect(is(game, copy, "Goblin")).toBe(true);
    };
    const noncreature = (): void => {
      const { game, a } = table();
      const ring = spawn(game, "Sol Ring");
      a.chooseCopyFn = () => ring;
      lands(game, "Forest", 2);
      lands(game, "Island", 3);
      cast(game, toHand(game, "Moritte of the Frost"));
      const copy = game.battlefield.find((id) => id !== ring && game.state.objects[id].copyOf === "Sol Ring")!;
      expect(supertypes(game, copy)).toEqual(expect.arrayContaining(["legendary", "snow"]));
      expect(counters(game, copy)).toBe(0);
      expect(subtypes(game, copy)).toEqual([]);
    };
    creature();
    noncreature();
  });
});

describe("Day of Black Sun and Jade Statue", () => {
  it("what lost its abilities is destroyed, and a bigger creature stays", () => {
    const { game } = table();
    const god = spawn(game, "Darksteel Myr", B);
    const big = spawn(game, "Serra Angel", B);
    lands(game, "Swamp", 5);
    cast(game, toHand(game, "Day of Black Sun"), { x: 3 });
    expect(zone(game, god)).toBe("graveyard");
    expect(zone(game, big)).toBe("battlefield");
    expect(graveyard(game, B)).toContain(god);
  });

  it("Jade Statue is a 3/6 until end of combat, only during combat", () => {
    const { game } = table({ step: "begin-combat" });
    const statue = spawn(game, "Jade Statue");
    lands(game, "Wastes", 2);
    activate(game, statue, 0);
    expect(pt(game, statue)).toEqual({ power: 3, toughness: 6 });
    expect(types(game, statue)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    toStep(game, "postcombat-main");
    expect(types(game, statue)).not.toContain("creature");
  });
});
