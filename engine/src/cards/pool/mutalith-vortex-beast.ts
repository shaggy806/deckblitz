import { defineCard } from "../define.js";

// EDHREC rank 9808.
//
// One flip per opponent, each about that opponent: won, you draw a card; lost,
// this creature deals 3 damage to that player (the ruling — 3 to the player
// whose flip it was, not to each of them per lost flip).
const VORTEX_TEXT =
  "Warp Vortex — When this creature enters, flip a coin for each opponent you have. For each flip you win, draw a card. For each flip you lose, this creature deals 3 damage to that player.";

export default defineCard({
  name: "Mutalith Vortex Beast",
  manaCost: "{4}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Mutant", "Beast"],
  power: 6,
  toughness: 6,
  keywords: ["trample"],
  text: `Trample\n${VORTEX_TEXT}`,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "for-each-player",
        who: "each-opponent",
        effect: {
          kind: "flip-coin",
          won: { kind: "draw", amount: 1 },
          lost: { kind: "damage", amount: 3, who: "that-player" },
        },
      },
      resolve: null,
      text: VORTEX_TEXT,
    },
  ],
});
