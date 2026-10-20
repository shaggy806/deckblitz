import { defineCard } from "../define.js";

// EDHREC rank 17112. An intervening-if (rule 603.4) over the turn's history:
// any land that entered under your control this turn — played or put there by
// an effect, still there or not.

const TEXT =
  "At the beginning of your end step, if you had a land enter the battlefield under your control this turn, venture into the dungeon.";

export default defineCard({
  name: "Wandering Troubadour",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Dragon", "Bard"],
  power: 4,
  toughness: 2,
  text: `${TEXT} (Enter the first room or advance to the next room.)`,
  triggered: [
    {
      trigger: { on: "step-begins", step: "end", who: "you" },
      condition: { kind: "turn-history", what: "entered", filter: { type: "land" } },
      targets: [],
      effect: { kind: "venture" },
      resolve: null,
      text: TEXT,
    },
  ],
});
