/**
 * `board-tour`: the site tour's second half (`docs/plans/tutorials.md`) — the
 * game board, on a practice table, for players who already know Magic. It
 * points at what works differently here from a paper table: commander damage,
 * the command zone's tax, activated abilities, casting — and the one players
 * trip on, casting from a graveyard (flashback), through the zones' counts —
 * the phase track's stops, the priority buttons, the History, Settings and the
 * Game menu. Learn Commander teaches the game itself.
 *
 * You (alice) are on turn 5 with six lands and Mind Stone out, Grizzly Bears
 * in hand and Think Twice in the graveyard; Marwyn, the Nurturer was cast
 * once before (so carries {2} of tax). Rowan (bob) has Krenko, Mob Boss out,
 * which has already dealt you 6 commander damage. Rowan only ever passes.
 * Two cards ask for a cast (the Bears, then Think Twice's flashback); the
 * rest wait on Next.
 */

import { asPlayerId } from "engine/local";
import type { ScenarioCard } from "protocol";
import type { Lesson } from "./lesson.js";

const YOU = asPlayerId("alice");
const ROWAN = asPlayerId("bob");

const cards: ScenarioCard[] = [
  { key: "marwyn", name: "Marwyn, the Nurturer", owner: YOU, zone: "command", commander: true, casts: 1 },
  ...[1, 2, 3, 4].map((n): ScenarioCard => ({ key: `island-${n}`, name: "Island", owner: YOU, zone: "battlefield" })),
  ...[1, 2].map((n): ScenarioCard => ({ key: `forest-${n}`, name: "Forest", owner: YOU, zone: "battlefield" })),
  { key: "mind-stone", name: "Mind Stone", owner: YOU, zone: "battlefield" },
  { key: "bears", name: "Grizzly Bears", owner: YOU, zone: "hand" },
  { key: "elves", name: "Llanowar Elves", owner: YOU, zone: "hand" },
  { key: "think-twice", name: "Think Twice", owner: YOU, zone: "graveyard" },
  { key: "your-draw", name: "Island", owner: YOU, zone: "library" },
  {
    key: "krenko",
    name: "Krenko, Mob Boss",
    owner: ROWAN,
    zone: "battlefield",
    commander: true,
    commanderDamage: { [YOU]: 6 },
  },
  ...[1, 2, 3, 4, 5].map((n): ScenarioCard => ({ key: `rowan-mountain-${n}`, name: "Mountain", owner: ROWAN, zone: "battlefield" })),
];

export const BOARD_TOUR: Lesson = {
  id: "board-tour",
  title: "Tour the board",
  chapters: [
    {
      id: "board",
      title: "The board",
      board: {
        spec: {
          seats: [
            { player: YOU, life: 34, bot: false },
            { player: ROWAN, life: 40, bot: true },
          ],
          cards,
          active: YOU,
          step: "precombat-main",
          turn: 5,
          libraryFill: 20,
        },
        opponents: { bob: { name: "Rowan", script: { moves: [], otherwise: "pass" } } },
      },
      steps: [
        {
          id: "welcome",
          title: "A practice table",
          body:
            "Nothing here counts: it's a quick look at how a game works on this site, for anyone who already knows Magic. " +
            "Each player has a corner of the table; yours is the one with your hand along the bottom.",
        },
        {
          id: "player-panel",
          title: "A player's corner",
          body:
            "Name and life on top, then how many cards are in their hand, library, graveyard and exile. " +
            "Rest the pointer on any card on the table to read it in full.",
          anchor: "player:opponent",
          placement: "bottom",
        },
        {
          id: "commander-damage",
          title: "Commander damage",
          body:
            "Combat damage from each commander is a chip beside the life total, with the commander's art and the running count: " +
            "here, 6 from Rowan's Krenko. It turns amber at 15 and red at 18, and 21 from any one commander loses the game.",
          anchor: "tour:game-commander-damage",
        },
        {
          id: "command-zone",
          title: "Your commander",
          body:
            "Marwyn waits in the command zone: click her there to cast her. " +
            "Her cost already includes the tax, {2} more for each time she's been cast from the command zone.",
          anchor: "card:Marwyn, the Nurturer",
          placement: "left",
        },
        {
          id: "abilities",
          title: "Abilities",
          body:
            "Click a permanent to use it: a menu beside it lists what it can do right now. " +
            "Mind Stone, say, can tap for mana or be sacrificed to draw a card.",
          anchor: "card:Mind Stone",
          placement: "right",
        },
        {
          id: "cast-from-hand",
          title: "Casting a spell",
          body:
            "Click a card in your hand to cast it. The mana is paid from your lands for you, and anything it targets you pick on the board. " +
            "A card with more than one way to cast it shows a button for each.",
          anchor: "card:Grizzly Bears",
          placement: "top",
          goals: [{ id: "bears", label: "Cast Grizzly Bears", when: { event: "spell-cast", player: YOU, card: "Grizzly Bears" } }],
        },
        {
          id: "flashback",
          title: "Casting from the graveyard",
          body:
            "At a table you'd just say \"flashback\". Here, click the graveyard count to open your graveyard (every zone's count opens it), " +
            "then press Cast under Think Twice.",
          anchor: "zone:graveyard:me",
          goals: [{ id: "flashback", label: "Cast Think Twice from your graveyard", when: { event: "spell-cast", player: YOU, card: "Think Twice" } }],
        },
        {
          id: "phase-track",
          title: "The phase track, and stops",
          body:
            "Where the turn is. Click a step to make it a stop: the game will wait for you there even when you have nothing to answer, " +
            "say to cast an instant in someone's end step.",
          anchor: "tour:game-phase-track",
          placement: "bottom",
        },
        {
          id: "pass",
          title: "Pass",
          body:
            "Passes priority once; Space does too. " +
            "With spells on the stack, Resolve stack appears beside it and passes until the stack is empty, stopping if anything new happens.",
          anchor: "tour:game-pass",
          placement: "top",
        },
        {
          id: "pass-turn",
          title: "Pass Turn",
          body: "Passes for the rest of this turn, but still stops whenever you have something to decide, like blockers.",
          anchor: "tour:game-pass-turn",
          placement: "top",
        },
        {
          id: "auto-pass",
          title: "Auto-pass",
          body: "Keeps passing through everyone's turns until it's your turn again or something needs your decision. Click it again to stop.",
          anchor: "tour:game-auto-pass",
          placement: "top",
        },
        {
          id: "history",
          title: "History",
          body: "Everything that's happened this game, in order. Click an entry to see what it names on the board.",
          anchor: "tour:game-history",
          placement: "bottom",
        },
        {
          id: "settings",
          title: "Settings",
          body:
            "When the game stops for you: pass your upkeep and draw, pass through combat, skip windows where all you could do is make mana, " +
            "and the stops you've set. Bot and animation speed, and sound, are here too.",
          anchor: "tour:game-settings",
          placement: "bottom",
        },
        {
          id: "game-menu",
          title: "The Game menu",
          body: "Let a bot take over your seat, concede, or leave for the main menu.",
          anchor: "tour:game-menu",
          placement: "bottom",
        },
        {
          id: "done",
          title: "That's the board",
          body: "You're ready. Blitz a deck from the main menu, or open a table for friends and bots.",
        },
      ],
    },
  ],
};
