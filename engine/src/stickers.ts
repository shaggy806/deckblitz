/**
 * Stickers (rule 123): Unfinity's sticker sheets, and the name stickers on
 * them. See docs/plans/stickers.md.
 *
 * A player who plays with stickers brings at least ten sheets and three of
 * them, chosen at random as the game starts, are the stickers they have
 * access to (rules 103.2d, 123.2a); those three stay revealed (123.2c). Each
 * sticker is distinct (123.3a) and is put on something its player owns
 * (123.3b), from among those not on any object they own right now (123.3).
 *
 * Only **name stickers** are built (123.6): a word or words added to the name
 * of the object they're on, a text-changing effect (612.9) applied with the
 * other name changes in timestamp order. Ability, power/toughness and art
 * stickers, and the tickets that pay for the first two (107.17), aren't: no
 * card in the pool puts one.
 *
 * Pure: types from `state.ts` only, so `state.ts` may import the name rules
 * back as values.
 */

import type { CardDefinition } from "./cards/define.js";
import type { GameObject, GameState, PlacedSticker } from "./state.js";
import type { PlayerId } from "./primitives.js";

/** One of Unfinity's sticker sheets (rule 123.2) — "Sticker sheets are not
 * cards and have no characteristics". */
export interface StickerSheet {
  /** Scryfall's name for it: its three name stickers, in order. */
  readonly name: string;
  /** Its collector number in Unfinity Sticker Sheets (SUNF). */
  readonly collector: number;
  /** Its name stickers, each one or more words (123.6). */
  readonly names: readonly string[];
}

const sheet = (collector: number, ...names: string[]): StickerSheet => ({
  name: names.join(" "),
  collector,
  names,
});

/**
 * Every sticker sheet there is: the 48 of Unfinity Sticker Sheets (SUNF), by
 * collector number, each with its three name stickers. Scryfall names each
 * sheet for its name stickers (`test/stickers.test.ts` pins this list against
 * the Oracle snapshot's sheets); one of them has two words, "Hot Dog". Their
 * ability and power/toughness stickers (the sheets' Oracle text) and art
 * stickers aren't kept: nothing here puts one.
 */
export const STICKER_SHEETS: readonly StickerSheet[] = [
  sheet(1, "Eldrazi", "Guacamole", "Tightrope"),
  sheet(2, "Trendy", "Circus", "Pirate"),
  sheet(3, "Night", "Brushwagg", "Ringmaster"),
  sheet(4, "Urza's", "Dark", "Cannonball"),
  sheet(5, "Misunderstood", "Trapeze", "Elf"),
  sheet(6, "Zombie", "Cheese", "Magician"),
  sheet(7, "Carnival", "Elephant", "Meteor"),
  sheet(8, "Happy", "Dead", "Squirrel"),
  sheet(9, "Slimy", "Burrito", "Illusion"),
  sheet(10, "Spooky", "Clown", "Mox"),
  sheet(11, "Mystic", "Doom", "Sandwich"),
  sheet(12, "Narrow-Minded", "Baloney", "Fireworks"),
  sheet(13, "Unsanctioned", "Ancient", "Juggler"),
  sheet(14, "Deep-Fried", "Plague", "Myr"),
  sheet(15, "Contortionist", "Otter", "Storm"),
  sheet(16, "Sticky", "Kavu", "Daredevil"),
  sheet(17, "Goblin", "Coward", "Parade"),
  sheet(18, "Phyrexian", "Midway", "Bamboozle"),
  sheet(19, "Eternal", "Acrobat", "Toast"),
  sheet(20, "Jetpack", "Death", "Seltzer"),
  sheet(21, "Demonic", "Tourist", "Laser"),
  sheet(22, "Cursed", "Firebreathing", "Yogurt"),
  sheet(23, "Ancestral", "Hot Dog", "Minotaur"),
  sheet(24, "Familiar", "Beeble", "Mascot"),
  sheet(25, "Giant", "Mana", "Cake"),
  sheet(26, "Snazzy", "Aether", "Homunculus"),
  sheet(27, "Squid", "Fire", "Knight"),
  sheet(28, "Cool", "Fluffy", "Loxodon"),
  sheet(29, "Space", "Fungus", "Snickerdoodle"),
  sheet(30, "Playable", "Delusionary", "Hydra"),
  sheet(31, "Wrinkly", "Monkey", "Shenanigans"),
  sheet(32, "Geek", "Lotus", "Warrior"),
  sheet(33, "Primal", "Elder", "Kitty"),
  sheet(34, "Sassy", "Gremlin", "Blood"),
  sheet(35, "Yawgmoth", "Merfolk", "Soul"),
  sheet(36, "Unassuming", "Gelatinous", "Serpent"),
  sheet(37, "Squishy", "Sphinx", "Ninja"),
  sheet(38, "Unique", "Charmed", "Pants"),
  sheet(39, "Unhinged", "Beast", "Hunt"),
  sheet(40, "Wild", "Ogre", "Bupkis"),
  sheet(41, "Notorious", "Sliver", "War"),
  sheet(42, "Weird", "Angel", "Flame"),
  sheet(43, "Vampire", "Champion", "Fury"),
  sheet(44, "Trained", "Blessed", "Mind"),
  sheet(45, "Unglued", "Pea-Brained", "Dinosaur"),
  sheet(46, "Elemental", "Time", "Flamingo"),
  sheet(47, "Unstable", "Robot", "Dragon"),
  sheet(48, "Werewolf", "Lightning", "Mage"),
];

const SHEETS_BY_NAME: ReadonlyMap<string, StickerSheet> = new Map(STICKER_SHEETS.map((s) => [s.name, s]));

/** The sheet of that name, or `undefined` for none. */
export const stickerSheet = (name: string): StickerSheet | undefined => SHEETS_BY_NAME.get(name);

const STICKER_PUTTERS = new WeakMap<CardDefinition, boolean>();

/** Whether a card's text puts a sticker on something — the `put-sticker`
 * effect anywhere in it — so that a deck with it plays with stickers (rule
 * 123.2a, `DeckList.stickerSheets`). Read from the definition's data, once. */
export function putsStickers(def: CardDefinition): boolean {
  let puts = STICKER_PUTTERS.get(def);
  if (puts === undefined) {
    puts = JSON.stringify(def).includes('"kind":"put-sticker"');
    STICKER_PUTTERS.set(def, puts);
  }
  return puts;
}

/** How many sheets a player who plays with stickers brings at least (rule
 * 123.2a), and how many of them are chosen at random to play with (103.2d). */
export const MIN_STICKER_SHEETS = 10;
export const STICKER_SHEETS_IN_PLAY = 3;

/** What's wrong with `names` as the sticker sheets a player brings to a
 * constructed game (rule 123.2a): at least ten, each unique, each a real one.
 * Empty when nothing is. */
export function stickerSheetProblems(names: readonly string[]): string[] {
  const problems: string[] = [];
  const unknown = names.filter((n) => !SHEETS_BY_NAME.has(n));
  if (unknown.length > 0) problems.push(`Not a sticker sheet: ${unknown.join(", ")}.`);
  const seen = new Set<string>();
  const repeated = names.filter((n) => (seen.has(n) ? true : (seen.add(n), false)));
  if (repeated.length > 0) problems.push(`Each sticker sheet must be unique (rule 123.2a): ${[...new Set(repeated)].join(", ")}.`);
  if (seen.size < MIN_STICKER_SHEETS) {
    problems.push(`A player playing with stickers brings at least ${MIN_STICKER_SHEETS} sticker sheets (rule 123.2a), not ${seen.size}.`);
  }
  return problems;
}

/** One name sticker a player has access to: which of their sheets, and
 * which of its name stickers (rule 123.3a — each is a sticker of its own,
 * whatever its words). */
export interface NameStickerRef {
  readonly sheet: string;
  readonly index: number;
}

/** A name sticker as offered: where it is, its words and its unique vowels. */
export interface NameStickerOption extends NameStickerRef {
  readonly text: string;
  readonly uniqueVowels: number;
}

/** The vowels, for the cards that count them (rule 123.6e). */
const VOWELS = ["a", "e", "i", "o", "u", "y"] as const;

/** "The number of unique vowels on that sticker" (rule 123.6e): how many of
 * A, E, I, O, U and Y appear on it, each once however often, a lowercase
 * letter the same as its uppercase. */
export const uniqueVowels = (text: string): number => {
  const lower = text.toLowerCase();
  return VOWELS.filter((v) => lower.includes(v)).length;
};

/** "The number of [letter]s" on a name sticker (rule 123.6d): a lowercase
 * letter and its uppercase are the same letter. */
export const letterCount = (text: string, letter: string): number => {
  const l = letter.toLowerCase();
  return [...text.toLowerCase()].filter((c) => c === l).length;
};

/** What a card counts on the name sticker it just put ("that sticker"):
 * `"unique-vowels"` (rule 123.6e). */
export type StickerCount = "unique-vowels";

/** `count` of the name sticker reading `text`. */
export const stickerCount = (text: string, count: StickerCount): number => {
  switch (count) {
    case "unique-vowels":
      return uniqueVowels(text);
  }
};

/** A blank line in a printed name ("_____ Goblin", "Wolf in _____
 * Clothing"): not a word (rule 123.6a). */
const isBlank = (token: string): boolean => /^_+$/.test(token);

/** How many words `name` has for the name-sticker rules (rule 123.6a): runs
 * of non-space characters, a hyphenated word or one with punctuation counted
 * once, a blank line not at all. `null` (no name, a face-down permanent) has
 * none. */
export const nameWordCount = (name: string | null): number =>
  name === null ? 0 : name.split(" ").filter((t) => t.length > 0 && !isBlank(t)).length;

/** After how many words a blank line in `name` waits for a sticker's words
 * (the first, if several), or 0 with none: where a player puts one by
 * default. */
export const blankSlot = (name: string | null): number => {
  if (name === null) return 0;
  let words = 0;
  for (const token of name.split(" ")) {
    if (token.length === 0) continue;
    if (isBlank(token)) return words;
    words += 1;
  }
  return 0;
};

/**
 * `name` with a name sticker's words added after `position` of its words
 * (rules 123.6b, 123.6c): at the beginning for 0, at the end when it has
 * fewer words than that now. A name with none (`null` — face down) becomes
 * the sticker's words.
 *
 * A blank line where the words go — the gap the card was printed with for
 * them, "_____ Goblin" — is filled by them: "Hot Dog Goblin", not "Hot Dog
 * _____ Goblin". The rules say only that a blank isn't a word (123.6a); the
 * sticker is put over it, and so it's no longer there to read. Only the
 * first blank in that place is: "_____ _____ Rocketship" keeps its second
 * for a second sticker. Nothing else in the name changes (123.6b).
 */
export function nameWithSticker(name: string | null, words: string, position: number): string {
  const tokens = name === null ? [] : name.split(" ").filter((t) => t.length > 0);
  // The place after `position` words: the index just past the last of them.
  let at = 0;
  let seen = 0;
  if (position > 0) {
    at = tokens.length;
    for (let i = 0; i < tokens.length; i += 1) {
      if (isBlank(tokens[i])) continue;
      seen += 1;
      if (seen === position) {
        at = i + 1;
        break;
      }
    }
  }
  const added = words.split(" ").filter((t) => t.length > 0);
  const fills = at < tokens.length && isBlank(tokens[at]) ? 1 : 0;
  return [...tokens.slice(0, at), ...added, ...tokens.slice(at + fills)].join(" ");
}

/**
 * `object`'s name with its name stickers (rule 123.6c): from `base`, its
 * name before any (its copiable values', or the name a later naming effect
 * gave it — `nameOf` decides), adding each sticker put on it after `since`
 * in timestamp order. `undefined` when it has none to add.
 */
export function nameWithStickers(
  object: GameObject,
  base: string | null,
  since: number,
): string | undefined {
  const stickers = object.stickers;
  if (stickers === undefined || stickers.length === 0) return undefined;
  const after = stickers.filter((s) => s.kind === "name" && s.timestamp > since);
  if (after.length === 0) return undefined;
  let name = base;
  for (const s of [...after].sort((a, b) => a.timestamp - b.timestamp)) {
    name = nameWithSticker(name, s.text, s.position);
  }
  return name ?? undefined;
}

/** The name stickers on `object`, oldest first. */
export const nameStickersOn = (object: GameObject): readonly PlacedSticker[] =>
  (object.stickers ?? []).filter((s) => s.kind === "name");

/** Whether `object` is "stickered" (rule 123.4): it has a sticker of any
 * kind on it now. */
export const isStickered = (object: GameObject): boolean => (object.stickers?.length ?? 0) > 0;

/** The stickers `player` has put on objects they own that are on one now
 * (rule 123.3): a sticker on an object that went to a hand or library was
 * lost with it (123.5) and is theirs to put again. */
function stickersInUse(state: GameState, player: PlayerId): Set<string> {
  const used = new Set<string>();
  for (const object of Object.values(state.objects)) {
    if (object.owner !== player || object.stickers === undefined) continue;
    for (const s of object.stickers) used.add(`${s.sheet}\u0000${s.index}`);
  }
  return used;
}

/** The name stickers `player` may put on something now (rule 123.3): those
 * on their chosen sheets (`PlayerState.stickerSheets`) that aren't on any
 * object they own, in sheet order. None for a player who plays without
 * stickers. */
export function availableNameStickers(state: GameState, player: PlayerId): NameStickerOption[] {
  const sheets = state.players[player]?.stickerSheets ?? [];
  if (sheets.length === 0) return [];
  const used = stickersInUse(state, player);
  const options: NameStickerOption[] = [];
  for (const name of sheets) {
    const s = stickerSheet(name);
    if (s === undefined) continue;
    s.names.forEach((text, index) => {
      if (!used.has(`${name}\u0000${index}`)) options.push({ sheet: name, index, text, uniqueVowels: uniqueVowels(text) });
    });
  }
  return options;
}

/** Each of `player`'s chosen sticker sheets with its name stickers and
 * whether each is on an object they own — what's revealed of them (rule
 * 123.2c), for the view. */
export function stickerSheetsView(
  state: GameState,
  player: PlayerId,
): { readonly name: string; readonly names: readonly { readonly text: string; readonly used: boolean }[] }[] {
  const sheets = state.players[player]?.stickerSheets ?? [];
  if (sheets.length === 0) return [];
  const used = stickersInUse(state, player);
  return sheets.flatMap((name) => {
    const s = stickerSheet(name);
    return s === undefined
      ? []
      : [{ name, names: s.names.map((text, index) => ({ text, used: used.has(`${name}\u0000${index}`) })) }];
  });
}
