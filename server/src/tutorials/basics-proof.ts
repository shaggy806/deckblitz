/**
 * `basics-proof`: the tutorial room's proof lesson, not the real Learn
 * Commander content (`docs/plans/tutorials.md`, build order step 2). One short
 * game: play a land, cast a creature, pass the turn, and block the
 * opponent's scripted attack — every kind of chapter a lesson has (a Next
 * card, goals, a chapter opening on a game moment) on one board.
 *
 * You (alice) hold two Forests and Llanowar Elves, with Marwyn, the
 * Nurturer waiting in the command zone; Rowan (bob) has an Elvish Mystic
 * out. On turn 2 Rowan attacks with it, and your Elves can block: a 1/1 for
 * a 1/1, a fair trade.
 */

import { asPlayerId } from "engine";
import type { ScenarioCard } from "protocol";
import type { Lesson } from "./lesson.js";

const YOU = asPlayerId("alice");
const ROWAN = asPlayerId("bob");

const cards: ScenarioCard[] = [
  { key: "marwyn", name: "Marwyn, the Nurturer", owner: YOU, zone: "command", commander: true },
  { key: "forest-1", name: "Forest", owner: YOU, zone: "hand" },
  { key: "forest-2", name: "Forest", owner: YOU, zone: "hand" },
  { key: "elves", name: "Llanowar Elves", owner: YOU, zone: "hand" },
  { key: "your-draw", name: "Forest", owner: YOU, zone: "library" },
  { key: "rowan-forest-1", name: "Forest", owner: ROWAN, zone: "battlefield" },
  { key: "rowan-forest-2", name: "Forest", owner: ROWAN, zone: "battlefield" },
  { key: "mystic", name: "Elvish Mystic", owner: ROWAN, zone: "battlefield" },
  { key: "rowan-draw", name: "Forest", owner: ROWAN, zone: "library" },
];

export const BASICS_PROOF: Lesson = {
  id: "basics-proof",
  title: "The basics (proof)",
  chapters: [
    {
      id: "welcome",
      title: "Welcome",
      board: {
        spec: {
          seats: [
            { player: YOU, life: 40, bot: false },
            { player: ROWAN, life: 40, bot: true },
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
              moves: [{ do: "attack", card: "Elvish Mystic", at: "alice", on: { turn: 2 } }],
            },
          },
        },
      },
      steps: [
        {
          id: "welcome",
          title: "Welcome to the table!",
          body:
            "This is a game of Commander, and it's your turn. Your hand is at the bottom of the screen, " +
            "and your commander, Marwyn, waits in the command zone.\n\nLet's take it one step at a time.",
        },
      ],
    },
    {
      id: "land",
      title: "Play a land",
      steps: [
        {
          id: "play-land",
          title: "Play a land",
          body: "Lands make the mana you cast spells with. You can play one each turn — click a Forest in your hand to play it.",
          anchor: "card:Forest",
          placement: "top",
          goals: [{ id: "land-played", label: "Play a Forest", when: { event: "land-played", player: YOU } }],
        },
      ],
    },
    {
      id: "creature",
      title: "Cast a creature",
      steps: [
        {
          id: "cast-elves",
          title: "Cast Llanowar Elves",
          body: "Nice! Your Forest makes one green mana — just what Llanowar Elves costs. Cast them now.",
          anchor: "card:Llanowar Elves",
          placement: "top",
          goals: [
            {
              id: "elves-cast",
              label: "Cast Llanowar Elves",
              when: { event: "spell-cast", player: YOU, card: "Llanowar Elves" },
            },
          ],
        },
      ],
    },
    {
      id: "turn",
      title: "Pass the turn",
      steps: [
        {
          id: "pass-turn",
          title: "Over to Rowan",
          body:
            "Your Elves are on the battlefield, but a creature can't attack or tap on the turn it arrives. " +
            "That's all for this turn — pass it to Rowan.",
          anchor: "tour:game-pass-turn",
          placement: "top",
          holdPriority: true,
          goals: [{ id: "rowans-turn", label: "Pass the turn", when: { event: "turn-began", turn: 2 } }],
        },
      ],
    },
    {
      id: "block",
      title: "Block an attack",
      opensOn: { event: "attackers-declared", player: ROWAN },
      steps: [
        {
          id: "block",
          title: "Rowan attacks!",
          body:
            "Rowan's Elvish Mystic is coming at you. Your Elves can block it: they'll fight each other " +
            "instead of you losing life. Block with your Elves.",
          anchor: "card:Llanowar Elves",
          placement: "top",
          goals: [{ id: "blocked", label: "Block with Llanowar Elves", when: { event: "blocker-declared", player: YOU } }],
        },
        {
          id: "well-done",
          title: "Well blocked!",
          body: "A 1/1 for a 1/1 — a fair trade, and you kept your life total safe. That's the heart of every game: lands, spells, attacks and blocks.",
        },
      ],
    },
  ],
};
