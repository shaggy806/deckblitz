/**
 * Stickers (rule 123): the sticker sheets a player plays with, putting a name
 * sticker on something (the `put-sticker` effect and the `put-name-sticker`
 * decision), the name it makes and what it counts — _____ Goblin, _____ Bird
 * Gets the Worm, Wizards of the _____. See docs/plans/stickers.md.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { AutomaticController } from "../controller.js";
import type { LegalAction } from "../actions.js";
import { Game } from "../game.js";
import { poolCounts } from "../mana.js";
import { nameOf } from "../state.js";
import {
  STICKER_SHEETS,
  availableNameStickers,
  blankSlot,
  nameWithSticker,
  stickerSheetProblems,
  uniqueVowels,
} from "../stickers.js";
import { DECISIONS } from "../decisions/registry.js";
import { viewFor } from "../view.js";
import { A, B, enter, life, settle, spawn, table } from "./harness.js";

const SNAPSHOT = fileURLToPath(new URL("../../data/oracle/cards.jsonl", import.meta.url));

/** Ten sheets: the table doesn't shuffle, so a player has the first three —
 * Ancestral / Hot Dog / Minotaur, Narrow-Minded / Baloney / Fireworks and
 * Spooky / Clown / Mox. */
const SHEETS = [
  "Ancestral Hot Dog Minotaur",
  "Narrow-Minded Baloney Fireworks",
  "Spooky Clown Mox",
  "Giant Mana Cake",
  "Zombie Cheese Magician",
  "Happy Dead Squirrel",
  "Slimy Burrito Illusion",
  "Mystic Doom Sandwich",
  "Cool Fluffy Loxodon",
  "Wild Ogre Bupkis",
];

type Offer = Extract<LegalAction, { kind: "put-name-sticker" }>;

/** A seat's answer: the sticker reading `text`, after `position` words. */
const answer = (text: string | null, position = 0) => (_view: unknown, offer: Offer) => {
  if (text === null) return { sticker: null, position: 0 };
  const s = offer.stickers.find((o) => o.text === text);
  if (s === undefined) throw new Error(`${text} wasn't offered: ${offer.stickers.map((o) => o.text).join(", ")}`);
  return { sticker: { sheet: s.sheet, index: s.index }, position };
};

const red = (game: Game, player = A): number => poolCounts(game.state.players[player].manaPool).R;

describe("the sticker sheets (rule 123.2)", () => {
  it("are Unfinity's 48, each named for its three name stickers — pinned against the Oracle snapshot", () => {
    const sheets: { name: string; collector: number }[] = [];
    for (const line of readFileSync(SNAPSHOT, "utf8").split("\n")) {
      if (!line.includes('"set":"sunf"')) continue;
      const card = JSON.parse(line) as { name: string; collector_number: string; type_line: string };
      if (card.type_line === "Stickers") sheets.push({ name: card.name, collector: Number(card.collector_number) });
    }
    sheets.sort((a, b) => a.collector - b.collector);
    expect(sheets).toHaveLength(48);
    expect(STICKER_SHEETS.map((s) => ({ name: s.name, collector: s.collector }))).toEqual(sheets);
    for (const s of STICKER_SHEETS) {
      expect(s.names).toHaveLength(3);
      expect(s.names.join(" ")).toBe(s.name);
    }
  });

  it("a player brings at least ten, each unique (123.2a)", () => {
    expect(stickerSheetProblems(SHEETS)).toEqual([]);
    expect(stickerSheetProblems(SHEETS.slice(0, 9))).toHaveLength(1);
    expect(stickerSheetProblems([...SHEETS, SHEETS[0]]).join(" ")).toMatch(/unique/);
    expect(stickerSheetProblems([...SHEETS, "Totally Real Sheet"]).join(" ")).toMatch(/Not a sticker sheet/);
  });

  it("three of them chosen at random are the ones a player has (103.2d); the table takes the first three", () => {
    const { game } = table({ stickerSheets: SHEETS });
    expect(game.state.players[A].stickerSheets).toEqual(SHEETS.slice(0, 3));
    expect(game.state.players[B].stickerSheets).toBeUndefined();
  });

  it("a deck with a card that puts stickers brings every sheet, and three are chosen on the seed", () => {
    const deck = (cards: readonly string[]) =>
      Game.create({
        seed: 7,
        decks: [
          { player: A, cards },
          { player: B, cards: Array<string>(40).fill("Wastes") },
        ],
      });
    const withGoblin = [...Array<string>(39).fill("Mountain"), "_____ Goblin"];
    const sheets = deck(withGoblin).state.players[A].stickerSheets ?? [];
    expect(sheets).toHaveLength(3);
    expect(new Set(sheets).size).toBe(3);
    expect(sheets.every((name) => STICKER_SHEETS.some((s) => s.name === name))).toBe(true);
    // The same seed, the same three; a deck without one plays without them.
    expect(deck(withGoblin).state.players[A].stickerSheets).toEqual(sheets);
    expect(deck(withGoblin).state.players[B].stickerSheets).toBeUndefined();
  });

  it("stay revealed: everyone's view shows each player's sheets and which stickers are on something (123.2c)", () => {
    const { game, a } = table({ stickerSheets: SHEETS });
    a.putNameStickerFn = answer("Baloney");
    enter(game, "_____ Goblin");
    const seen = viewFor(game.state, game.registry, B).players[A].stickerSheets;
    expect(seen.map((s) => s.name)).toEqual(SHEETS.slice(0, 3));
    expect(seen[1].names).toEqual([
      { text: "Narrow-Minded", used: false },
      { text: "Baloney", used: true },
      { text: "Fireworks", used: false },
    ]);
  });
});

describe("a name sticker's words and the name they make (rule 123.6)", () => {
  it("counts unique vowels, Y one of them, each once, either case (123.6e)", () => {
    expect(uniqueVowels("Hot Dog")).toBe(1);
    expect(uniqueVowels("Narrow-Minded")).toBe(4);
    expect(uniqueVowels("Baloney")).toBe(4);
    expect(uniqueVowels("Yawgmoth")).toBe(3);
    expect(uniqueVowels("Myr")).toBe(1);
  });

  it("goes at the beginning or after any number of words (the rule's Bear Cub example, 123.6b)", () => {
    expect([0, 1, 2].map((p) => nameWithSticker("Bear Cub", "Dark", p))).toEqual([
      "Dark Bear Cub",
      "Bear Dark Cub",
      "Bear Cub Dark",
    ]);
    // After more words than the name has now: at its end (123.6c).
    expect(nameWithSticker("Bear Cub", "Dark", 5)).toBe("Bear Cub Dark");
    // A name of none becomes the sticker's words.
    expect(nameWithSticker(null, "Hot Dog", 0)).toBe("Hot Dog");
  });

  it("fills a blank line where it goes — a blank isn't a word (123.6a)", () => {
    expect(nameWithSticker("_____ Goblin", "Hot Dog", 0)).toBe("Hot Dog Goblin");
    expect(nameWithSticker("_____ Goblin", "Hot Dog", 1)).toBe("_____ Goblin Hot Dog");
    expect(nameWithSticker("Wizards of the _____", "Mox", 3)).toBe("Wizards of the Mox");
    expect(nameWithSticker("_____ _____ Rocketship", "Space", 0)).toBe("Space _____ Rocketship");
    expect(blankSlot("_____ Goblin")).toBe(0);
    expect(blankSlot("Wizards of the _____")).toBe(3);
    expect(blankSlot("Bear Cub")).toBe(0);
  });
});

describe("_____ Goblin", () => {
  it("puts the name sticker chosen on itself and adds {R} for each unique vowel on it", () => {
    const { game, a } = table({ stickerSheets: SHEETS });
    let offered: Offer | undefined;
    a.putNameStickerFn = (view, offer) => {
      offered = offer;
      return answer("Baloney")(view, offer);
    };
    const goblin = enter(game, "_____ Goblin");
    expect(offered?.stickers.map((s) => s.text)).toEqual([
      "Ancestral",
      "Hot Dog",
      "Minotaur",
      "Narrow-Minded",
      "Baloney",
      "Fireworks",
      "Spooky",
      "Clown",
      "Mox",
    ]);
    expect(offered?.optional).toBe(true);
    // Its one word, so two places, and the blank before it is the first.
    expect(offered?.names[4]).toEqual(["Baloney Goblin", "_____ Goblin Baloney"]);
    expect(offered?.fill).toBe(0);
    expect(nameOf(game.state.objects[goblin])).toBe("Baloney Goblin");
    expect(red(game)).toBe(4);
    expect(viewFor(game.state, game.registry, B).objects[goblin]).toMatchObject({
      name: "Baloney Goblin",
      nameStickers: ["Baloney"],
    });
    expect(game.state.eventLog.some((e) => e.type === "name-sticker-put" && e.name === "Baloney Goblin")).toBe(true);
  });

  it("puts nothing when its controller declines, and adds nothing", () => {
    const { game, a } = table({ stickerSheets: SHEETS });
    a.putNameStickerFn = answer(null);
    const goblin = enter(game, "_____ Goblin");
    expect(game.state.objects[goblin].stickers).toBeUndefined();
    expect(nameOf(game.state.objects[goblin])).toBe("_____ Goblin");
    expect(red(game)).toBe(0);
  });

  it("asks nothing of a player who plays without stickers (123.3)", () => {
    const { game, a } = table();
    let asked = false;
    a.putNameStickerFn = () => {
      asked = true;
      return { sticker: null, position: 0 };
    };
    enter(game, "_____ Goblin");
    expect(asked).toBe(false);
    expect(red(game)).toBe(0);
  });

  it("can't use a sticker that's on something its player owns, until that goes to a hand (123.3, 123.5)", () => {
    const { game, a } = table({ stickerSheets: SHEETS });
    a.putNameStickerFn = answer("Minotaur");
    const first = enter(game, "_____ Goblin");
    expect(availableNameStickers(game.state, A).map((s) => s.text)).not.toContain("Minotaur");
    // Dying keeps it on the card: a graveyard is a public zone.
    game.debugMove(first, "graveyard");
    expect(nameOf(game.state.objects[first])).toBe("Minotaur Goblin");
    expect(availableNameStickers(game.state, A).map((s) => s.text)).not.toContain("Minotaur");
    // To a hand it's lost, and the player may put it again.
    game.debugMove(first, "hand");
    expect(game.state.objects[first].stickers).toBeUndefined();
    expect(nameOf(game.state.objects[first])).toBe("_____ Goblin");
    expect(availableNameStickers(game.state, A).map((s) => s.text)).toContain("Minotaur");
  });

  it("puts nothing on itself once it has left the battlefield (rule 400.7)", () => {
    const { game, a } = table({ stickerSheets: SHEETS });
    let asked = false;
    a.putNameStickerFn = (view, offer) => {
      asked = true;
      return answer("Baloney")(view, offer);
    };
    const goblin = enter(game, "_____ Goblin", A, { settle: false });
    expect(game.state.zones.shared.stack).toHaveLength(1);
    game.debugMove(goblin, "graveyard");
    settle(game);
    expect(asked).toBe(false);
    expect(game.state.objects[goblin].stickers).toBeUndefined();
    expect(red(game)).toBe(0);
  });

  it("is placed by the creature's controller when someone else's: the owner chooses the sticker (123.3b, 123.6b)", () => {
    const { game, a, b } = table({ stickerSheets: SHEETS });
    a.putNameStickerFn = answer("Hot Dog");
    let placing: Offer | undefined;
    b.putNameStickerFn = (_view, offer) => {
      placing = offer;
      return { sticker: { sheet: offer.stickers[0].sheet, index: offer.stickers[0].index }, position: 1 };
    };
    const goblin = enter(game, "_____ Goblin", A, { settle: false });
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [{ kind: "object", object: goblin }]);
    settle(game);
    expect(placing?.stage).toBe("place");
    expect(placing?.stickers.map((s) => s.text)).toEqual(["Hot Dog"]);
    expect(nameOf(game.state.objects[goblin])).toBe("_____ Goblin Hot Dog");
    // The mana is the ability's controller's.
    expect(red(game, A)).toBe(1);
  });

  it("gives nothing to a player putting one on what they don't own (123.3b)", () => {
    const { game, b } = table({ stickerSheets: { [B]: SHEETS } });
    let asked = false;
    b.putNameStickerFn = () => {
      asked = true;
      return { sticker: null, position: 0 };
    };
    // Alice's Goblin, under Bob's control as it enters: Bob's ability.
    const goblin = spawn(game, "_____ Goblin");
    game.state.objects[goblin].controller = B;
    game.debugAnnounceEntry(goblin);
    expect(game.state.zones.shared.stack.length + game.state.pendingTriggers.length).toBe(1);
    settle(game);
    expect(asked).toBe(false);
    expect(red(game, B)).toBe(0);
  });

  it("keeps its name stickers with other naming effects in timestamp order (123.6c)", () => {
    const { game, a } = table({ stickerSheets: SHEETS });
    a.putNameStickerFn = answer("Clown");
    const goblin = enter(game, "_____ Goblin");
    const object = game.state.objects[goblin];
    // A later effect that names it replaces the whole name, sticker and all
    // (Witness Protection's example)...
    object.modifiers.push({
      timestamp: game.state.timestampSeq + 1,
      power: 0,
      toughness: 0,
      keywords: [],
      untilEndOfTurn: false,
      setName: "Legitimate Businessperson",
    });
    expect(nameOf(object)).toBe("Legitimate Businessperson");
    // ...and a sticker put on after it adds to that name.
    object.stickers = [...(object.stickers ?? []), { kind: "name", sheet: SHEETS[2], index: 2, text: "Mox", position: 2, timestamp: game.state.timestampSeq + 2 }];
    expect(nameOf(object)).toBe("Legitimate Businessperson Mox");
  });

  it("a plain controller takes the sticker with the most unique vowels, over the blank", () => {
    const { game, a } = table({ stickerSheets: SHEETS });
    let picked: unknown;
    a.putNameStickerFn = (view, offer) => {
      picked = new AutomaticController(A).putNameSticker(view, offer);
      return picked as ReturnType<typeof a.putNameStickerFn>;
    };
    const goblin = enter(game, "_____ Goblin");
    // Minotaur, Narrow-Minded and Baloney have four; Minotaur comes first.
    expect(picked).toEqual({ sticker: { sheet: SHEETS[0], index: 2 }, position: 0 });
    expect(nameOf(game.state.objects[goblin])).toBe("Minotaur Goblin");
    expect(red(game)).toBe(4);
  });

  it("offers the searching bots each sticker, the most vowels first, then none", () => {
    const { game, a } = table({ stickerSheets: SHEETS });
    let offered: Offer | undefined;
    a.putNameStickerFn = (view, offer) => {
      offered = offer;
      return answer("Mox")(view, offer);
    };
    enter(game, "_____ Goblin");
    const candidates = DECISIONS["put-name-sticker"].candidates?.(offered as Offer, A, 3, undefined as never) ?? [];
    const texts = (offered as Offer).stickers;
    expect(
      candidates.map((c) =>
        c.type !== "put-name-sticker" || c.sticker === null
          ? null
          : texts.find((s) => s.sheet === c.sticker?.sheet && s.index === c.sticker.index)?.text,
      ),
    ).toEqual(["Minotaur", "Narrow-Minded", "Baloney", null]);
  });
});

describe("the other name-sticker cards", () => {
  it("_____ Bird Gets the Worm: you gain X life, X the sticker's unique vowels", () => {
    const { game, a } = table({ stickerSheets: SHEETS });
    a.putNameStickerFn = answer("Fireworks");
    const bird = enter(game, "_____ Bird Gets the Worm");
    expect(nameOf(game.state.objects[bird])).toBe("Fireworks Bird Gets the Worm");
    expect(life(game)).toBe(23);
  });

  it("Wizards of the _____: looks at the top X cards and takes one, its blank at the end", () => {
    const { game, a } = table({ stickerSheets: SHEETS });
    a.putNameStickerFn = answer("Spooky", 3);
    let looked = 0;
    a.chooseFromZoneFn = (_view, eligible) => {
      looked = eligible.length;
      return [eligible[0]];
    };
    const handBefore = game.state.zones.perPlayer[A].hand.length;
    const wizards = enter(game, "Wizards of the _____");
    expect(nameOf(game.state.objects[wizards])).toBe("Wizards of the Spooky");
    expect(looked).toBe(2);
    expect(game.state.zones.perPlayer[A].hand.length).toBe(handBefore + 1);
  });
});

describe("the put-name-sticker decision", () => {
  it("refuses a sticker it didn't offer, a place past the name's end, and none when one must be put", () => {
    const { game, a } = table({ stickerSheets: SHEETS });
    let offered: Offer | undefined;
    a.putNameStickerFn = (_view, offer) => {
      offered = offer;
      // Answered by hand below.
      throw new Error("stop");
    };
    const goblin = enter(game, "_____ Goblin", A, { settle: false });
    expect(() => settle(game)).toThrow(/stop/);
    expect(game.state.awaiting?.kind).toBe("put-name-sticker");
    const s = offered?.stickers[0];
    expect(s).toBeDefined();
    expect(game.canDispatch({ type: "put-name-sticker", player: A, sticker: { sheet: "Wild Ogre Bupkis", index: 0 }, position: 0 })).toMatch(/can't put/);
    expect(game.canDispatch({ type: "put-name-sticker", player: A, sticker: { sheet: s!.sheet, index: s!.index }, position: 2 })).toMatch(/after 0 to 1/);
    expect(game.canDispatch({ type: "put-name-sticker", player: B, sticker: null, position: 0 })).toMatch(/not being asked/);
    game.dispatch({ type: "put-name-sticker", player: A, sticker: { sheet: s!.sheet, index: s!.index }, position: 0 });
    expect(nameOf(game.state.objects[goblin])).toBe("Ancestral Goblin");
  });

  it("a seat left to its default answers it as a plain controller would", () => {
    const { game } = table({ stickerSheets: SHEETS });
    spawn(game, "_____ Goblin");
    expect(availableNameStickers(game.state, A)).toHaveLength(9);
    const goblin = enter(game, "_____ Goblin");
    expect(nameOf(game.state.objects[goblin])).toBe("Minotaur Goblin");
    expect(availableNameStickers(game.state, A)).toHaveLength(8);
  });
});
