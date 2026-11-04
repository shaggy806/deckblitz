import { defineCard } from "../define.js";

// Rulings:
//   Maralen prevents players from drawing cards for any reason, including as a cost, as an effect,
//   and in the draw step. No player can lose for drawing from an empty library while it's there.
//   Replacement effects that instruct a player to do something instead of drawing won't work.
//   The trigger is mandatory: the life loss isn't a payment, and unless the library is empty, the
//   player must put a card from it into their hand.
const CANT_TEXT = "Players can't draw cards.";
const STEP_TEXT =
  "At the beginning of each player's draw step, that player loses 3 life, searches their library for a card, puts it into their hand, then shuffles.";

export default defineCard({
  name: "Maralen of the Mornsong",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  supertypes: ["legendary"],
  subtypes: ["Elf", "Wizard"],
  power: 2,
  toughness: 3,
  text: `${CANT_TEXT}\n${STEP_TEXT}`,
  static: [
    {
      affects: { scope: "self" },
      prohibits: { who: "each-player", drawsPerTurn: 0 },
      text: CANT_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "step-begins", step: "draw", who: "any" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "lose-life", amount: 3, who: "active-player" },
          {
            kind: "for-each-player",
            who: "active-player",
            effect: { kind: "search-library", who: "that-player", filter: {}, destination: "hand", min: 1, max: 1 },
          },
        ],
      },
      resolve: null,
      text: STEP_TEXT,
    },
  ],
});
