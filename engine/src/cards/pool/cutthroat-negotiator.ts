import { defineCard } from "../define.js";
import { PARLEY_NONLAND, parley } from "../helpers.js";

// March of the Machine Commander (MOC). EDHREC rank 10635.
export default defineCard({
  name: "Cutthroat Negotiator",
  manaCost: "{2}{U}{R}",
  colors: ["U", "R"],
  types: ["creature"],
  subtypes: ["Orc", "Pirate"],
  power: 4,
  toughness: 3,
  text: "Parley — Whenever this creature attacks, each player reveals the top card of their library. For each nonland card revealed this way, you create a tapped Treasure token. Then each player draws a card.",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: parley({ kind: "create-token", token: "Treasure Token", count: PARLEY_NONLAND, tapped: true }),
      resolve: null,
      text: "Parley — Whenever this creature attacks, each player reveals the top card of their library. For each nonland card revealed this way, you create a tapped Treasure token. Then each player draws a card.",
    },
  ],
});
