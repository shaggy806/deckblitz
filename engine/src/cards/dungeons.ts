/**
 * The dungeon cards (rule 309) — what venturing walks through (rule 701.49).
 *
 * A dungeon isn't a card a deck holds: it begins outside the game and is put
 * into the command zone by a venture (309.2). Its rooms form a directed
 * graph, drawn top to bottom with arrows; each room has a triggered ability,
 * "When you move your venture marker into this room, [effect]", controlled
 * by the dungeon's owner and using the stack (309.4c). Room names are flavor
 * (309.4b). The bottommost room is the one no arrow leads out of; venturing
 * from it completes the dungeon (309.7, 701.49c), and so does a state-based
 * action once its last room ability has left the stack (309.6).
 *
 * The Oracle snapshot has no room text (Scryfall files the dungeons as
 * double-faced tokens), so each room's `text` is copied from
 * `data/oracle/dungeons.json` and `test/dungeons.test.ts` pins every room's
 * name, text and arrows against it.
 *
 * Four: Lost Mine of Phandelver, Dungeon of the Mad Mage and Tomb of
 * Annihilation, the three a plain "venture into the dungeon" chooses among
 * (701.49a), and Undercity — the one the initiative ventures into (rule
 * 726.2; 701.49d: "venture into Undercity"), and the one no plain venture may
 * enter (its own line: "You can't enter this dungeon unless you 'venture into
 * Undercity.'").
 */
import { defineCard } from "./define.js";
import type { CardDefinition } from "./define.js";
import type { DungeonMap } from "../actions.js";
import type { EffectSpec } from "../effects.js";
import type { TargetSpec } from "../target.js";

/** One room of a dungeon (rule 309.4). */
export interface DungeonRoom {
  /** Flavor (309.4b), but what the map and the log call it. */
  readonly name: string;
  /** The room ability's effect, as printed after the dash. */
  readonly text: string;
  /** The rooms its arrows lead to, by index; empty for the bottommost. */
  readonly next: readonly number[];
  readonly targets: readonly TargetSpec[];
  readonly effect: EffectSpec;
}

export interface DungeonDefinition {
  /** The card's name — also the registry name of its object's definition. */
  readonly name: string;
  /** Undercity: only "venture into Undercity" enters it (701.49d). */
  readonly undercity?: true;
  /** The rooms, topmost first (309.4a). */
  readonly rooms: readonly DungeonRoom[];
}

export const UNDERCITY = "Undercity";

const UNDERCITY_DUNGEON: DungeonDefinition = {
  name: UNDERCITY,
  undercity: true,
  rooms: [
    {
      name: "Secret Entrance",
      text: "Search your library for a basic land card, reveal it, put it into your hand, then shuffle.",
      next: [1, 2],
      targets: [],
      effect: {
        kind: "search-library",
        filter: { supertype: "basic", type: "land" },
        destination: "hand",
        reveal: true,
        min: 0,
        max: 1,
      },
    },
    {
      name: "Forge",
      text: "Put two +1/+1 counters on target creature.",
      next: [3, 4],
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 },
    },
    {
      name: "Lost Well",
      text: "Scry 2.",
      next: [4, 5],
      targets: [],
      effect: { kind: "scry", amount: 2 },
    },
    {
      name: "Trap!",
      text: "Target player loses 5 life.",
      next: [6],
      targets: ["player"],
      effect: { kind: "lose-life", amount: 5, target: 0 },
    },
    {
      name: "Arena",
      text: "Goad target creature.",
      next: [6, 7],
      targets: ["creature"],
      effect: { kind: "goad", target: 0 },
    },
    {
      name: "Stash",
      text: "Create a Treasure token.",
      next: [7],
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
    },
    {
      name: "Archives",
      text: "Draw a card.",
      next: [8],
      targets: [],
      effect: { kind: "draw", amount: 1 },
    },
    {
      name: "Catacombs",
      text: "Create a 4/1 black Skeleton creature token with menace.",
      next: [8],
      targets: [],
      effect: { kind: "create-token", token: "Skeleton Token (Gut, True Soul Zealot)", count: 1 },
    },
    {
      name: "Throne of the Dead Three",
      text:
        "Reveal the top ten cards of your library. Put a creature card from among them onto the battlefield with three +1/+1 counters on it. It gains hexproof until your next turn. Then shuffle.",
      next: [],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          {
            // "A creature card": one if there is one (it isn't "up to").
            kind: "look-and-choose",
            zone: "library",
            count: 10,
            reveal: true,
            min: 1,
            max: 1,
            filter: { type: "creature" },
            destination: "battlefield",
            withCounters: { kind: "+1/+1", amount: 3 },
            leftover: "stay",
            then: { kind: "grant-keyword", target: 0, keyword: "hexproof", duration: "until-your-next-turn" },
          },
          { kind: "shuffle-library" },
        ],
      },
    },
  ],
};

const LOST_MINE_OF_PHANDELVER: DungeonDefinition = {
  name: "Lost Mine of Phandelver",
  rooms: [
    {
      name: "Cave Entrance",
      text: "Scry 1.",
      next: [1, 2],
      targets: [],
      effect: { kind: "scry", amount: 1 },
    },
    {
      name: "Goblin Lair",
      text: "Create a 1/1 red Goblin creature token.",
      next: [3, 4],
      targets: [],
      effect: { kind: "create-token", token: "Goblin Token", count: 1 },
    },
    {
      name: "Mine Tunnels",
      text: "Create a Treasure token.",
      next: [4, 5],
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
    },
    {
      name: "Storeroom",
      text: "Put a +1/+1 counter on target creature.",
      next: [6],
      targets: ["creature"],
      effect: { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 },
    },
    {
      name: "Dark Pool",
      text: "Each opponent loses 1 life and you gain 1 life.",
      next: [6],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 1, who: "each-opponent" },
          { kind: "gain-life", amount: 1 },
        ],
      },
    },
    {
      name: "Fungi Cavern",
      text: "Target creature gets -4/-0 until your next turn.",
      next: [6],
      targets: ["creature"],
      effect: { kind: "modify-pt", target: 0, power: -4, toughness: 0, duration: "until-your-next-turn" },
    },
    {
      name: "Temple of Dumathoin",
      text: "Draw a card.",
      next: [],
      targets: [],
      effect: { kind: "draw", amount: 1 },
    },
  ],
};

const DUNGEON_OF_THE_MAD_MAGE: DungeonDefinition = {
  name: "Dungeon of the Mad Mage",
  rooms: [
    {
      name: "Yawning Portal",
      text: "You gain 1 life.",
      next: [1],
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
    },
    {
      name: "Dungeon Level",
      text: "Scry 1.",
      next: [2, 3],
      targets: [],
      effect: { kind: "scry", amount: 1 },
    },
    {
      name: "Goblin Bazaar",
      text: "Create a Treasure token.",
      next: [4],
      targets: [],
      effect: { kind: "create-token", token: "Treasure Token", count: 1 },
    },
    {
      name: "Twisted Caverns",
      text: "Target creature can't attack until your next turn.",
      next: [4],
      targets: ["creature"],
      effect: { kind: "restrict", target: 0, restrictions: ["cant-attack"], duration: "until-your-next-turn" },
    },
    {
      name: "Lost Level",
      text: "Scry 2.",
      next: [5, 6],
      targets: [],
      effect: { kind: "scry", amount: 2 },
    },
    {
      name: "Runestone Caverns",
      text: "Exile the top two cards of your library. You may play them.",
      next: [7],
      targets: [],
      // No end to the permission: for as long as they remain exiled.
      effect: { kind: "impulse-exile", amount: 2, duration: "while-exiled" },
    },
    {
      name: "Muiral's Graveyard",
      text: "Create two 1/1 black Skeleton creature tokens.",
      next: [7],
      targets: [],
      effect: { kind: "create-token", token: "Skeleton Token", count: 2 },
    },
    {
      name: "Deep Mines",
      text: "Scry 3.",
      next: [8],
      targets: [],
      effect: { kind: "scry", amount: 3 },
    },
    {
      name: "Mad Wizard's Lair",
      text: "Draw three cards and reveal them. You may cast one of them without paying its mana cost.",
      next: [],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "draw", amount: 3 },
          { kind: "reveal-drawn" },
          { kind: "cast-now", from: "drawn-this-way", free: true },
        ],
      },
    },
  ],
};

const TOMB_OF_ANNIHILATION: DungeonDefinition = {
  name: "Tomb of Annihilation",
  rooms: [
    {
      name: "Trapped Entry",
      text: "Each player loses 1 life.",
      next: [1, 3],
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "each-player" },
    },
    {
      name: "Veils of Fear",
      text: "Each player loses 2 life unless they discard a card.",
      next: [2],
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-player",
        options: [{ discard: 1, text: "Discard a card" }],
        ifDidnt: { kind: "lose-life", amount: 2, who: "that-player" },
      },
    },
    {
      name: "Sandfall Cell",
      text: "Each player loses 2 life unless they sacrifice a creature, artifact, or land of their choice.",
      next: [4],
      targets: [],
      effect: {
        kind: "each-player-may",
        who: "each-player",
        options: [
          {
            sacrifice: { typesAnyOf: ["creature", "artifact", "land"] },
            text: "Sacrifice a creature, artifact, or land",
          },
        ],
        ifDidnt: { kind: "lose-life", amount: 2, who: "that-player" },
      },
    },
    {
      name: "Oubliette",
      text: "Discard a card and sacrifice a creature, an artifact, and a land.",
      next: [4],
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "discard", target: "you", amount: 1 },
          {
            kind: "sacrifice",
            who: "you",
            filter: { type: "creature" },
            count: 1,
            andEach: [{ type: "artifact" }, { type: "land" }],
          },
        ],
      },
    },
    {
      name: "Cradle of the Death God",
      text: "Create The Atropal, a legendary 4/4 black God Horror creature token with deathtouch.",
      next: [],
      targets: [],
      effect: { kind: "create-token", token: "The Atropal", count: 1 },
    },
  ],
};

/** Every dungeon the engine knows, by name: the three a plain "venture into
 * the dungeon" chooses among (701.49a), and Undercity. */
export const DUNGEONS: ReadonlyMap<string, DungeonDefinition> = new Map(
  [LOST_MINE_OF_PHANDELVER, DUNGEON_OF_THE_MAD_MAGE, TOMB_OF_ANNIHILATION, UNDERCITY_DUNGEON].map((d) => [
    d.name,
    d,
  ]),
);

/** A dungeon as a driver draws it — see `DungeonMap`. */
export function dungeonMap(name: string): DungeonMap | undefined {
  const dungeon = DUNGEONS.get(name);
  if (dungeon === undefined) return undefined;
  return { name, rooms: dungeon.rooms.map((r) => ({ name: r.name, text: r.text, next: [...r.next] })) };
}

/** The rooms' printed lines, as the card reads: "Forge — Put two +1/+1
 * counters on target creature. (Leads to: Trap!, Arena)". */
export function dungeonText(dungeon: DungeonDefinition): string {
  const lines = dungeon.rooms.map((room) => {
    const leads = room.next.map((i) => dungeon.rooms[i]!.name).join(", ");
    return `${room.name} — ${room.text}${leads === "" ? "" : ` (Leads to: ${leads})`}`;
  });
  return [
    ...(dungeon.undercity === true ? ['You can\'t enter this dungeon unless you "venture into Undercity."'] : []),
    ...lines,
  ].join("\n");
}

/** The definitions a dungeon's object is read through: no colours, no
 * types the engine's `CardType` knows (a dungeon is its own card type, rule
 * 309.1, which nothing else asks about), and the card's text. Its room
 * abilities aren't on it — `Game` puts each on the stack as the marker
 * enters the room, from `DUNGEONS`, the way Saga chapters are fired.
 * Registered beside the pool; not a card a deck can hold. */
export const DUNGEON_DEFINITIONS: readonly CardDefinition[] = [...DUNGEONS.values()].map((dungeon) =>
  defineCard({
    name: dungeon.name,
    colors: [],
    types: [],
    text: dungeonText(dungeon),
  }),
);
