/**
 * `learn-commander`: Learn Commander's first game (`docs/plans/tutorials.md`,
 * section 3), for someone who has never played. One whole game, won on turn 7,
 * with the lessons as chapters inside it: the table, land and mana, a creature,
 * the turn, attacking, blocking, the graveyard, casting your commander, winning.
 *
 * Every card is a creature with no rules text or a basic land, so each teaches
 * only itself. You (alice) play black; Rowan (bob) red, on 13 life rather than
 * 40 to keep the game short (a card says so). The damage is exact:
 *
 * - Turn 3: Muck Rats hit for 1, leaving 12.
 * - Turn 4: Rowan's Dwarven Trader attacks; Cabal Evangel blocks and kills it.
 * - Turn 5: Muck Rats and Cabal Evangel hit for 3, leaving 9.
 * - Turn 7: Tyrox blocks the Rats, and Kalakscion and the Evangel hit for 9.
 *
 * The lesson is `scripted`, so the player can only do what the card up asks.
 */

import { asPlayerId } from "engine/local";
import type { ScenarioCard } from "protocol";
import type { TutorialCondition } from "./conditions.js";
import type { Lesson, LessonGoal, LessonStep } from "./lesson.js";

const YOU = asPlayerId("alice");
const ROWAN = asPlayerId("bob");

const LAND = "Swamp";
const RATS = "Muck Rats";
const EVANGEL = "Cabal Evangel";
const COMMANDER = "Kalakscion, Hunger Tyrant";
const TRADER = "Dwarven Trader";
const TYROX = "Tyrox, Saurid Tyrant";

const cards: ScenarioCard[] = [
  { key: "commander", name: COMMANDER, owner: YOU, zone: "command", commander: true },
  ...[1, 2, 3].map((n): ScenarioCard => ({ key: `swamp-${n}`, name: LAND, owner: YOU, zone: "hand" })),
  { key: "rats", name: RATS, owner: YOU, zone: "hand" },
  { key: "evangel", name: EVANGEL, owner: YOU, zone: "hand" },
  { key: "vampire", name: "Barony Vampire", owner: YOU, zone: "hand" },
  { key: "pangolin", name: "Gloom Pangolin", owner: YOU, zone: "hand" },
  // Every draw is listed: the library's filler is whatever basic comes first,
  // which would have a black deck drawing Plains.
  ...[1, 2, 3].map((n): ScenarioCard => ({ key: `your-draw-${n}`, name: LAND, owner: YOU, zone: "library" })),
  ...[1, 2, 3].map((n): ScenarioCard => ({ key: `rowan-draw-${n}`, name: "Mountain", owner: ROWAN, zone: "library" })),
  { key: "tyrox", name: TYROX, owner: ROWAN, zone: "command", commander: true },
  ...[1, 2, 3, 4, 5].map((n): ScenarioCard => ({ key: `mountain-${n}`, name: "Mountain", owner: ROWAN, zone: "hand" })),
  { key: "trader", name: TRADER, owner: ROWAN, zone: "hand" },
  { key: "guard", name: "Capital Guard", owner: ROWAN, zone: "hand" },
];

const mainOf = (player: typeof YOU): TutorialCondition => ({ event: "step-began", step: "precombat-main", player });

/** "Play a land": the card that opens each of your turns but the last. */
const playLand = (id: string, title: string, body: string): LessonStep => ({
  id,
  title,
  body,
  anchor: `card:${LAND}`,
  placement: "top",
  showHand: true,
  allow: [{ do: "play-land", card: LAND }],
  goals: [{ id: `${id}-done`, label: `Play a ${LAND}`, when: { event: "land-played", player: YOU } }],
});

/** Cast `card`, the goal met once it has resolved, so it's on the battlefield
 * for the card after this one to point at. */
const cast = (id: string, card: string, title: string, body: string, fromHand: boolean): LessonStep => ({
  id,
  title,
  body,
  anchor: `card:${card}`,
  placement: fromHand ? "top" : "left",
  ...(fromHand ? { showHand: true } : {}),
  allow: [{ do: "cast", card }],
  goals: [{ id: `${id}-done`, label: `Cast ${card}`, when: { event: "spell-resolved", card } }],
});

const passTurn = (id: string, title: string, body: string, opensOn?: TutorialCondition): LessonStep => ({
  id,
  title,
  body,
  anchor: "tour:game-pass-turn",
  placement: "top",
  holdPriority: true,
  ...(opensOn !== undefined ? { opensOn } : {}),
  allow: [{ do: "pass-turn" }],
  goals: [{ id: `${id}-done`, label: "Press Pass Turn", when: { event: "turn-began", player: ROWAN } }],
});

/** Pass out of the main phase. Its goal is combat beginning, not attackers
 * being asked for: the window that begins combat then passes itself. */
const toCombat = (id: string, title: string, body: string): LessonStep => ({
  id,
  title,
  body,
  anchor: "tour:game-pass",
  placement: "top",
  holdPriority: true,
  allow: [{ do: "pass" }],
  goals: [{ id: `${id}-done`, label: "Press Pass", when: { event: "step-began", step: "begin-combat", player: YOU } }],
});

const attack = (id: string, attackers: readonly string[], label: string, title: string, body: string): LessonStep => {
  const goal: LessonGoal = {
    id: `${id}-done`,
    label,
    when: { event: "attackers-declared", player: YOU, atLeast: attackers.length },
  };
  return {
    id,
    title,
    body,
    anchor: `card:${attackers[0]}`,
    // Above them, over Rowan's side: beside the first would cover the next one.
    placement: "top",
    allow: [{ do: "attack", card: attackers, atLeast: attackers.length }],
    goals: [goal],
  };
};

export const LEARN_COMMANDER: Lesson = {
  id: "learn-commander",
  title: "Learn Commander",
  scripted: true,
  chapters: [
    {
      id: "table",
      title: "The table",
      board: {
        spec: {
          seats: [
            { player: YOU, life: 40, bot: false },
            { player: ROWAN, life: 13, bot: true },
          ],
          cards,
          active: YOU,
          step: "precombat-main",
          libraryFill: 20,
        },
        opponents: {
          bob: {
            name: "Rowan",
            script: {
              moves: [
                { do: "play-land", card: "Mountain", on: { turn: 2 } },
                { do: "cast", card: TRADER, on: { turn: 2 } },
                { do: "play-land", card: "Mountain", on: { turn: 4 } },
                { do: "attack", card: TRADER, at: "alice", on: { turn: 4 } },
                { do: "play-land", card: "Mountain", on: { turn: 6 } },
                { do: "cast", card: TYROX, on: { turn: 6 } },
                { do: "block", card: TYROX, at: RATS, on: { turn: 7 } },
              ],
              otherwise: "pass",
            },
          },
        },
      },
      steps: [
        {
          id: "welcome",
          title: "Welcome!",
          body:
            "You're about to play a whole game of Commander against Rowan, and we'll go through it one step at a time. No experience needed.\n\n" +
            "In Commander, each player brings a deck of 100 different cards, led by one special creature: their commander.",
        },
        {
          id: "life",
          title: "How you win",
          body:
            "Each player starts with 40 life, and a player who reaches 0 is out. Last one standing wins.\n\n" +
            "That's Rowan's corner of the table. They're starting on 13, only so this game doesn't take all evening.",
          anchor: "player:opponent",
          placement: "bottom",
        },
        {
          id: "hand",
          title: "Your hand",
          body: "These are your cards. Only you can see them. Rest the pointer on any card, anywhere on the table, to read it up close.",
          anchor: "css:.hand-cards",
          placement: "top",
          showHand: true,
        },
        {
          id: "read-a-card",
          title: "Reading a card",
          body:
            "The symbols in the corner are its cost: {1}{B} means one mana of any kind plus one black. " +
            "The numbers at the bottom are the creature's power and toughness.\n\n" +
            "Power is the damage it deals. Toughness is the damage it takes to destroy it, so this 2/2 deals 2 and is destroyed by 2.",
          anchor: `card:${EVANGEL}`,
          placement: "top",
          showHand: true,
        },
        {
          id: "command-zone",
          title: "Your commander",
          body:
            "This is yours, waiting in the command zone. It isn't in your hand or your deck, so you can always get to it. " +
            "You just need enough mana, and we'll get there.",
          anchor: `card:${COMMANDER}`,
          placement: "left",
        },
        {
          id: "library",
          title: "Your library",
          body: "Your library is your deck, face down. You draw its top card at the start of your turn. The numbers here count what's in each pile.",
          anchor: "zone:library:me",
          placement: "bottom",
        },
      ],
    },
    {
      id: "mana",
      title: "Land and mana",
      steps: [
        playLand(
          "first-land",
          "Play a land",
          "Lands make mana, and mana pays for everything else. You can play one land each turn. Click a Swamp in your hand.",
        ),
        cast(
          "cast-rats",
          RATS,
          "Cast a creature",
          "A Swamp makes one black mana, which is exactly what Muck Rats cost. Click them to cast them.",
          true,
        ),
        {
          id: "tapped",
          title: "Tapped",
          body:
            "See your Swamp lying sideways? It's tapped: it has made its mana this turn. It stands back up at the start of your next turn.\n\n" +
            "You don't have to tap lands yourself. Casting a spell does it for you.",
          anchor: `battlefield:${LAND}`,
          placement: "right",
        },
        {
          id: "summoning-sick",
          title: "Your first creature",
          body: "A creature can't attack on the turn it arrives, so your Rats have to wait. Next turn they're ready.",
          anchor: `card:${RATS}`,
          placement: "right",
        },
        passTurn("first-pass", "That's your turn", "You've done everything you can for now. Press Pass Turn to hand over to Rowan."),
      ],
    },
    {
      id: "rowans-turn",
      title: "Rowan's turn",
      opensOn: mainOf(ROWAN),
      steps: [
        {
          id: "phase-track",
          title: "How a turn goes",
          body:
            "Every turn runs in the same order: untap everything, draw a card, a main phase for playing cards, combat, a second main phase, then the end. " +
            "This track shows where the turn is.",
          anchor: "tour:game-phase-track",
          placement: "bottom",
        },
        {
          id: "rowan-creature",
          title: "Rowan casts a creature",
          body: "Rowan played a land and cast a Dwarven Trader, a 1/1. Like your Rats, it can't attack this turn.",
          anchor: `card:${TRADER}`,
          placement: "right",
          opensOn: { event: "spell-resolved", card: TRADER },
        },
      ],
    },
    {
      id: "attack",
      title: "Attack",
      opensOn: mainOf(YOU),
      steps: [
        {
          id: "your-turn-again",
          title: "Your turn again",
          body: "Your Swamp has stood back up and you've drawn a card. That happens at the start of every turn you take.",
          anchor: `battlefield:${LAND}`,
          placement: "right",
        },
        playLand("second-land", "Another land", "A new turn means you can play another land."),
        cast(
          "cast-evangel",
          EVANGEL,
          "Two lands, two mana",
          "Cabal Evangel costs {1}{B}, and your two Swamps can pay for that. Cast it.",
          true,
        ),
        toCombat(
          "first-to-combat",
          "On to combat",
          "Your Rats have been here since last turn, so they can attack. The Pass button moves the game on one step: press it to go to combat.",
        ),
        attack(
          "first-attack",
          [RATS],
          `Attack with ${RATS}`,
          "Attack!",
          "Click your Muck Rats to send them at Rowan, then press Attack with 1 in the corner.",
        ),
        {
          id: "first-hit",
          title: "1 damage",
          body:
            "Rowan could have blocked with their Trader but didn't, so the Rats' 1 power came off Rowan's life.\n\n" +
            "Attacking tapped your Rats, and they won't stand back up until your next turn. A creature that attacks can't block on your opponent's turn, so it's always a trade-off.",
          anchor: "player:opponent",
          placement: "bottom",
          opensOn: { lifeAtMost: { player: ROWAN, value: 12 } },
        },
        passTurn("second-pass", "Over to Rowan", "Nothing more to do this turn. Pass Turn stops by itself if you need to decide something."),
      ],
    },
    {
      id: "block",
      title: "Block",
      opensOn: { event: "attackers-declared", player: ROWAN },
      steps: [
        {
          id: "block",
          title: "Rowan attacks!",
          body:
            "The Trader is coming at you. Your Rats are still tapped, but your Evangel isn't, and a creature that blocks takes the hit instead of you. " +
            "Click your Evangel, then press Block in the corner.",
          anchor: `card:${EVANGEL}`,
          placement: "right",
          allow: [{ do: "block", card: [EVANGEL], atLeast: 1 }],
          goals: [{ id: "blocked", label: `Block with ${EVANGEL}`, when: { event: "blocker-declared", player: YOU } }],
        },
        {
          id: "block-result",
          title: "Good block",
          body:
            "They hit each other at once. The Evangel's 2 damage was enough for the Trader's 1 toughness, so the Trader is gone. " +
            "The Trader's 1 damage wasn't enough for the Evangel's 2 toughness, so it survives, and damage wears off at the end of each turn.",
          anchor: `card:${EVANGEL}`,
          placement: "right",
          opensOn: { event: "combat-damage" },
        },
        {
          id: "graveyard",
          title: "The graveyard",
          body: "A destroyed creature goes to its owner's graveyard, the pile for cards that are finished with. Click this count in any game to look through a graveyard.",
          anchor: "zone:graveyard:opponent",
          placement: "bottom",
        },
      ],
    },
    {
      id: "commander",
      title: "Your commander",
      opensOn: mainOf(YOU),
      steps: [
        playLand("third-land", "Three lands", "Your third land makes three mana, which is what your commander has been waiting for."),
        cast(
          "cast-commander",
          COMMANDER,
          "Cast your commander",
          "You cast it from the command zone, just like a card from your hand. Click it.",
          false,
        ),
        {
          id: "commander-rules",
          title: "What makes a commander special",
          body:
            "If it would ever be destroyed, you can send it back to the command zone instead of the graveyard. You can then cast it again, for {2} more each time.\n\n" +
            "And 21 combat damage from one commander knocks a player out, whatever their life total.",
          anchor: `card:${COMMANDER}`,
          placement: "right",
        },
        toCombat("second-to-combat", "Combat again", "It just arrived, so your commander has to wait until next turn. Your other two creatures don't. Press Pass."),
        attack(
          "second-attack",
          [RATS, EVANGEL],
          "Attack with both creatures",
          "Attack with both",
          "Rowan has no creatures left to block with. Click your Rats and your Evangel, then press Attack with 2.",
        ),
        passTurn(
          "third-pass",
          "Rowan is on 9",
          "Two more creatures' worth of damage landed. Press Pass Turn.",
          { lifeAtMost: { player: ROWAN, value: 9 } },
        ),
      ],
    },
    {
      id: "finish",
      title: "Finish them",
      opensOn: { event: "spell-resolved", card: TYROX },
      steps: [
        {
          id: "rowan-commander",
          title: "Rowan's commander",
          body: "Rowan has cast their own commander from the command zone. It can't attack yet, but a creature doesn't need to wait before it can block.",
          anchor: `card:${TYROX}`,
          placement: "right",
        },
        {
          id: "last-turn",
          title: "Time to win",
          body:
            "Rowan has 9 life, and your three creatures have 10 power between them: 7, 2 and 1. Rowan's commander can block one of them, so let's see which.\n\n" +
            "You've got spare mana and cards too, but this is the moment to attack.",
          anchor: "player:opponent",
          placement: "bottom",
          opensOn: mainOf(YOU),
        },
        toCombat("last-to-combat", "To combat", "You know how this goes. Press Pass."),
        attack(
          "last-attack",
          [COMMANDER, EVANGEL, RATS],
          "Attack with all three",
          "Everything attacks",
          "Click all three creatures, or press All attack, then press Attack with 3.",
        ),
        {
          id: "blocked",
          title: "Rowan blocks",
          body: "Tyrox blocks your Rats, so the Rats' damage goes to Tyrox and not to Rowan. Blocking your commander would have saved Rowan, but that leaves your other two, and they deal exactly 9.",
          anchor: `card:${TYROX}`,
          placement: "right",
          opensOn: { event: "blocker-declared", player: ROWAN },
        },
        {
          id: "won",
          title: "You won!",
          body: "Rowan is out of life, and that's the game. You played lands, cast creatures, attacked, blocked and brought your commander out to finish it.",
          opensOn: { event: "player-lost", player: ROWAN },
        },
      ],
    },
  ],
};
