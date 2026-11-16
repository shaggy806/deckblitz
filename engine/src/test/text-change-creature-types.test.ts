/**
 * Text-changing effects over creature types (rule 612.2): "change the text
 * of target spell or permanent by replacing all instances of one creature
 * type with another" (Artificial Evolution) or "with Vampire" (New Blood).
 * The word is changed wherever the text uses it as a creature type — the
 * type line (612.1), every filter, "non-" words, "becomes a …", amass, the
 * tokens it makes with their names (612.2a, 612.4), a would-create-token
 * replacement's tokens, a gift's token, what a face-down permanent is listed
 * as — and only where the text prints it: a keyword's creature type
 * (afterlife's Spirits, soulshift's Spirit) is no word on the card.
 */

import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import { BUILTIN_CARDS, TOKEN_CARDS } from "../cards/generated.js";
import { computeCharacteristics } from "../characteristics.js";
import { CREATURE_TYPES } from "../creature-types.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { nameOf, rulesTextName } from "../state.js";
import {
  changeDefinitionText,
  CREATURE_TYPE_WORD_KEYS,
  creatureTypeFields,
  creatureTypePlural,
  printsCreatureType,
} from "../text-change.js";
import {
  A,
  B,
  cast,
  destroy,
  keywords,
  lands,
  pickModes,
  pt,
  ref,
  registryOf,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
  zone,
} from "./harness.js";

type CreatureTypeOffer = Extract<LegalAction, { kind: "choose-creature-type" }>;

/** Answers each creature type choice in turn, recording each offer. */
const answer = (seat: ReturnType<typeof table>["a"], ...words: string[]): CreatureTypeOffer[] => {
  const offers: CreatureTypeOffer[] = [];
  seat.chooseCreatureTypeFn = (view) => {
    const offer = view.legalActions().find((a): a is CreatureTypeOffer => a.kind === "choose-creature-type");
    if (offer === undefined) throw new Error("no creature type choice offered");
    offers.push(offer);
    return words[offers.length - 1];
  };
  return offers;
};

const textOf = (game: Game, id: ObjectId): string => game.viewFor(A).objects[id].text;
const tokensOf = (game: Game, before: ReadonlySet<ObjectId>): ObjectId[] =>
  game.battlefield.filter((id) => !before.has(id) && game.state.objects[id].isToken === true);
const colorsOf = (game: Game, id: ObjectId): string[] => [...computeCharacteristics(game.state, registryOf(game), id).colors];
/** The rules text `id` has now (layer 3). */
const textDef = (game: Game, id: ObjectId) => registryOf(game).get(rulesTextName(game.state.objects[id]));

/** New Blood on `target`, the Vampire tapped for its cost, `word` replaced. */
function newBlood(game: Game, seat: ReturnType<typeof table>["a"], target: ObjectId, word: string): CreatureTypeOffer[] {
  lands(game, "Swamp", 4);
  const vampire = spawn(game, "Vampire Nighthawk");
  const offers = answer(seat, word);
  cast(game, toHand(game, "New Blood"), { targets: [ref(target)], tap: [vampire] });
  expect(game.state.objects[vampire].tapped).toBe(true);
  return offers;
}

describe("New Blood — gain control, and one creature type becomes Vampire", () => {
  it("steals Goblin King, which is a Vampire lord now: its type line, its filter, its text", () => {
    const { game, a } = table();
    const king = spawn(game, "Goblin King", B);
    const goblin = spawn(game, "Goblin Piker", B);
    const offers = newBlood(game, a, king, "Goblin");
    expect(game.state.objects[king].controller).toBe(A);
    // A catalog of every creature type but Vampire, the target's own first.
    expect(offers).toHaveLength(1);
    expect(offers[0].catalog).toBe(true);
    expect(offers[0].options).not.toContain("Vampire");
    expect(offers[0].options).toHaveLength(CREATURE_TYPES.length - 1);
    expect(offers[0].suggested[0]).toBe("Goblin");
    expect(subtypes(game, king)).toEqual(["Vampire"]);
    // Other Vampires get +1/+1 and mountainwalk; Goblins don't.
    const nighthawk = game.battlefield.find((id) => game.state.objects[id].cardName === "Vampire Nighthawk")!;
    expect(pt(game, nighthawk)).toEqual({ power: 3, toughness: 4 });
    expect(keywords(game, nighthawk).has("mountainwalk")).toBe(true);
    expect(pt(game, goblin)).toEqual({ power: 2, toughness: 1 });
    expect(textOf(game, king)).toBe("Other Vampires get +1/+1 and have mountainwalk.");
    // Its name is no creature type word (612.2).
    expect(nameOf(game.state.objects[king])).toBe("Goblin King");
  });

  it("a creature type not on its type line leaves it no Vampire (the ruling)", () => {
    const { game, a } = table();
    const king = spawn(game, "Goblin King", B);
    newBlood(game, a, king, "Elf");
    expect(game.state.objects[king].controller).toBe(A);
    expect(subtypes(game, king)).toEqual(["Goblin"]);
    expect(textOf(game, king)).toBe("Other Goblins get +1/+1 and have mountainwalk.");
  });

  it("can't be cast without an untapped Vampire to tap", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const king = spawn(game, "Goblin King", B);
    const tapped = spawn(game, "Vampire Nighthawk", A, { tapped: true });
    expect(() => cast(game, toHand(game, "New Blood"), { targets: [ref(king)], tap: [tapped] })).toThrow(/tap/i);
  });

  it("Krenko's Goblins are Vampire tokens, named for it (612.2a), and it counts Vampires", () => {
    const { game, a } = table();
    const krenko = spawn(game, "Krenko, Mob Boss", B);
    newBlood(game, a, krenko, "Goblin");
    expect(subtypes(game, krenko)).toEqual(["Vampire", "Warrior"]);
    const before = new Set(game.battlefield);
    // Krenko and the Nighthawk are the Vampires: two tokens.
    game.debugApplyEffect(A, textDef(game, krenko).activated[0].effect!, [], { source: krenko });
    settle(game);
    const made = tokensOf(game, before);
    expect(made.reduce((n, id) => n + (game.state.objects[id].stackCount ?? 1), 0)).toBe(2);
    for (const id of made) {
      expect(subtypes(game, id)).toEqual(["Vampire"]);
      expect(nameOf(game.state.objects[id])).toBe("Vampire Token");
      expect(colorsOf(game, id)).toEqual(["R"]);
      expect(pt(game, id)).toEqual({ power: 1, toughness: 1 });
    }
    expect(textOf(game, krenko)).toBe(
      "{T}: Create X 1/1 red Vampire creature tokens, where X is the number of Vampires you control.",
    );
  });

  it("a copy of the changed token is what the text made it (rule 111.3), a copy of the creature isn't (707.2)", () => {
    const { game, a } = table();
    const krenko = spawn(game, "Krenko, Mob Boss", B);
    newBlood(game, a, krenko, "Goblin");
    const before = new Set(game.battlefield);
    game.debugApplyEffect(A, textDef(game, krenko).activated[0].effect!, [], { source: krenko });
    settle(game);
    const [token] = tokensOf(game, before);
    const seen = new Set(game.battlefield);
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 1, who: "you" }, [ref(token)]);
    settle(game);
    const [copy] = tokensOf(game, seen);
    expect(subtypes(game, copy)).toEqual(["Vampire"]);
    expect(nameOf(game.state.objects[copy])).toBe("Vampire Token");
    // A Clone of Krenko copies the printed text: a Goblin Warrior.
    const seen2 = new Set(game.battlefield);
    game.debugApplyEffect(A, { kind: "create-token-copy", of: 0, count: 1, who: "you" }, [ref(krenko)]);
    settle(game);
    const [clone] = tokensOf(game, seen2);
    expect(subtypes(game, clone)).toEqual(["Goblin", "Warrior"]);
  });

  it('"non-Spirit" changes; soulshift\'s Spirit, a keyword\'s, stays (Harbinger of Spring)', () => {
    const { game, a } = table();
    const harbinger = spawn(game, "Harbinger of Spring", B);
    newBlood(game, a, harbinger, "Spirit");
    expect(subtypes(game, harbinger)).toEqual(["Vampire"]);
    const def = textDef(game, harbinger);
    expect(JSON.stringify(def.static)).toContain('"notSubtypes":["Vampire"]');
    // Soulshift still returns a Spirit card (its reminder text's word).
    expect(JSON.stringify(def.triggered)).toContain('"subtype":"Spirit"');
    expect(textOf(game, harbinger)).toMatch(/^Protection from non-Vampire creatures\nSoulshift 4 \(.*Spirit card/);
  });

  it("amass's creature type is a word (Lazotep Reaver amasses Vampires)", () => {
    const { game, a } = table();
    const reaver = spawn(game, "Lazotep Reaver", B);
    newBlood(game, a, reaver, "Zombie");
    expect(subtypes(game, reaver)).toEqual(["Vampire", "Beast"]);
    expect(JSON.stringify(textDef(game, reaver).triggered)).toContain('"creatureType":"Vampire"');
  });

  it("Chatterfang's Squirrels, a replacement's tokens, are Vampires", () => {
    const { game, a } = table();
    const chatterfang = spawn(game, "Chatterfang, Squirrel General", B);
    newBlood(game, a, chatterfang, "Squirrel");
    const before = new Set(game.battlefield);
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 }, []);
    settle(game);
    const made = tokensOf(game, before);
    const vampires = made.filter((id) => subtypes(game, id).includes("Vampire"));
    expect(vampires).toHaveLength(1);
    expect(nameOf(game.state.objects[vampires[0]])).toBe("Vampire Token");
    expect(colorsOf(game, vampires[0])).toEqual(["G"]);
    expect(made.some((id) => subtypes(game, id).includes("Squirrel"))).toBe(false);
  });

  it("what an effect lists a face-down creature as: Illithid Harvester's 2/2 Vampires", () => {
    const { game, a } = table();
    const harvester = spawn(game, "Illithid Harvester", B);
    newBlood(game, a, harvester, "Horror");
    expect(textOf(game, harvester)).toMatch(/They're 2\/2 Vampire creatures\.$/);
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    game.debugApplyEffect(A, textDef(game, harvester).triggered[0].effect!, [ref(bears)], { source: harvester });
    settle(game);
    expect(game.state.objects[bears].faceDown?.as).toBe("2/2 Horror creature");
    expect(subtypes(game, bears)).toEqual(["Vampire"]);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Artificial Evolution — any creature type for another, never Wall", () => {
  it("asks both, the second never the first or Wall, and changes a creature spell on the stack (400.7a)", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    lands(game, "Island", 1);
    const piker = toHand(game, "Goblin Piker");
    cast(game, piker, { settle: false });
    const offers = answer(a, "Goblin", "Elf");
    cast(game, toHand(game, "Artificial Evolution"), { targets: [ref(piker)] });
    expect(offers).toHaveLength(2);
    expect(offers[0].catalog && offers[1].catalog).toBe(true);
    expect(offers[0].options).toContain("Wall");
    expect(offers[1].options).not.toContain("Goblin");
    expect(offers[1].options).not.toContain("Wall");
    expect(zone(game, piker)).toBe("battlefield");
    expect(subtypes(game, piker)).toEqual(["Elf", "Warrior"]);
  });

  it("the gift's Fish of a spell on the stack (Into the Flood Maw)", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const maw = toHand(game, "Into the Flood Maw");
    cast(game, maw, { targets: [ref(bears)], kicked: true, settle: false });
    answer(a, "Fish", "Shark");
    const before = new Set(game.battlefield);
    cast(game, toHand(game, "Artificial Evolution"), { targets: [ref(maw)] });
    const made = tokensOf(game, before);
    expect(made).toHaveLength(1);
    expect(game.state.objects[made[0]].controller).toBe(B);
    expect(subtypes(game, made[0])).toEqual(["Shark"]);
    expect(nameOf(game.state.objects[made[0]])).toBe("Shark Token");
    expect(game.state.objects[made[0]].tapped).toBe(true);
  });
});

describe("the same reach for a colour word and a land type", () => {
  it("Sleight of Mind on Chatterfang: its Squirrels are blue (a replacement's tokens, rule 111.3)", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const chatterfang = spawn(game, "Chatterfang, Squirrel General");
    a.chooseCreatureTypeFn = ((words: string[]) => () => words.shift()!)(["green", "blue"]);
    cast(game, toHand(game, "Sleight of Mind"), { targets: [ref(chatterfang)] });
    const before = new Set(game.battlefield);
    game.debugApplyEffect(A, { kind: "create-token", token: "Treasure Token", count: 1 }, []);
    settle(game);
    const squirrel = tokensOf(game, before).find((id) => subtypes(game, id).includes("Squirrel"))!;
    expect(colorsOf(game, squirrel)).toEqual(["U"]);
    expect(nameOf(game.state.objects[squirrel])).toBe("Squirrel Token");
  });

  it("Magical Hack on Yedora: what it returns face down is an Island land (rule 708.2)", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const yedora = spawn(game, "Yedora, Grave Gardener");
    a.chooseCreatureTypeFn = ((words: string[]) => () => words.shift()!)(["Forest", "Island"]);
    cast(game, toHand(game, "Magical Hack"), { targets: [ref(yedora)] });
    expect(textOf(game, yedora)).toMatch(/It's an? Island land\./);
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    destroy(game, bears);
    settle(game);
    expect(game.state.objects[bears].faceDown).toMatchObject({ as: "Forest land" });
    expect(subtypes(game, bears)).toEqual(["Island"]);
  });
});

describe("the words: where a creature type is written", () => {
  it("the word, its plural, non-, typecycling — not part of another word or a name", () => {
    expect(printsCreatureType("Other Goblins get +1/+1.", "Goblin")).toBe(true);
    expect(printsCreatureType("protection from non-Human creatures", "Human")).toBe(true);
    expect(printsCreatureType("Slivercycling {3}", "Sliver")).toBe(true);
    expect(printsCreatureType("Each Sliver card in each player's hand has slivercycling {3}.", "Sliver")).toBe(true);
    expect(printsCreatureType("Elves you control get +1/+1.", "Elf")).toBe(true);
    expect(printsCreatureType("{T}: Add {C}. Search for a Power-Plant.", "Plant")).toBe(false);
    expect(printsCreatureType("Afterlife 1 (When this creature dies, create a 1/1 Spirit token.)", "Spirit")).toBe(false);
    expect(printsCreatureType("Goblinoid", "Goblin")).toBe(false);
    expect(creatureTypePlural("Mouse")).toBe("Mice");
    expect(creatureTypePlural("Ally")).toBe("Allies");
    expect(creatureTypePlural("Sphinx")).toBe("Sphinxes");
    expect(creatureTypePlural("Merfolk")).toBe("Merfolk");
  });

  it("keeps a card's name in its text, and counts the new type (Pack Rat)", () => {
    const registry = registryOf(table().game);
    const rat = changeDefinitionText(registry.get("Pack Rat"), [{ from: "Rat", to: "Vampire" }]);
    expect(rat.text.split("\n")[0]).toBe("Pack Rat's power and toughness are each equal to the number of Vampires you control.");
    const { game, a } = table();
    const packRat = spawn(game, "Pack Rat", B);
    spawn(game, "Pack Rat", B);
    newBlood(game, a, packRat, "Rat");
    // Itself and the Nighthawk.
    expect(pt(game, packRat)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("the pool's text holds no creature type the change can't reach", () => {
  // A creature type in any other field is a name (a card's, a token's) or a
  // choice's value (Mirrodin Besieged's "Mirran or Phyrexian" faction).
  const NOT_WORDS = new Set(["name", "tokenName", "faces", "value", "chooseOnEnter"]);
  const creature = new Set(CREATURE_TYPES);

  it("every field holding a creature type is a creature-type word field or a known non-word one", () => {
    const unknown = new Map<string, string>();
    const walk = (v: unknown, key: string | null, name: string): void => {
      if (Array.isArray(v)) {
        for (const x of v) walk(x, key, name);
      } else if (v !== null && typeof v === "object") {
        for (const [k, x] of Object.entries(v)) if (k !== "text") walk(x, k, name);
      } else if (typeof v === "string" && key !== null && creature.has(v)) {
        if (!CREATURE_TYPE_WORD_KEYS.has(key) && !NOT_WORDS.has(key) && !unknown.has(key)) unknown.set(key, name);
      }
    };
    for (const def of [...BUILTIN_CARDS, ...TOKEN_CARDS]) {
      for (const [k, v] of Object.entries(def)) if (k !== "text") walk(v, k, def.name);
    }
    expect([...unknown]).toEqual([]);
  });

  it("a creature type its line doesn't print, though another line does, is a keyword's or a batch word's", () => {
    // Each is reviewed: soulshift's Spirit, "outlaw"'s Assassin and
    // Mercenary, assimilate's and embalm's types — the line says "Soulshift
    // 4", "outlaws", "Assimilate" or "Embalm", never the word (it's in
    // reminder text), so a change of the word another line prints leaves it
    // (rule 612.2). A new one is a card to read before adding it here.
    const found = new Set<string>();
    for (const def of BUILTIN_CARDS) {
      for (const field of creatureTypeFields(def)) {
        if (!field.printed && printsCreatureType(def.text, field.type)) found.add(`${def.name}: ${field.key} ${field.type}`);
      }
    }
    expect([...found].sort()).toEqual([
      "At Knifepoint: subtypes Mercenary",
      "Elder Pine of Jukai: subtype Spirit",
      "Harbinger of Spring: subtype Spirit",
      "He Who Hungers: subtype Spirit",
      "Hellspur Posse Boss: subtypes Mercenary",
      "Laughing Jasper Flint: subtypes Mercenary",
      "Rakish Crew: subtypes Mercenary",
      "The Best of Both Worlds: setSubtypes Borg",
      "Thief of Hope: subtype Spirit",
      "Vihaan, Goldwaker: subtypes Assassin",
      "Vizier of Many Faces: addSubtypes Zombie",
    ]);
  });

  it("no card that reads through a `resolve` hatch prints a creature type in its rules text", () => {
    const hatched = (v: unknown): boolean =>
      typeof v === "function" ||
      (Array.isArray(v) ? v.some(hatched) : v !== null && typeof v === "object" && Object.values(v).some(hatched));
    const offenders = [...BUILTIN_CARDS, ...TOKEN_CARDS]
      .filter((def) => hatched(def))
      .filter((def) => {
        const text = def.text.split(def.name).join("");
        return CREATURE_TYPES.some((type) => printsCreatureType(text, type));
      })
      .map((def) => def.name);
    expect(offenders).toEqual([]);
  });
});

