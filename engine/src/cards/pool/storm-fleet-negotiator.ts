import { defineCard } from "../define.js";
import { PARLEY_NONLAND, parley } from "../helpers.js";

// The Lost Caverns of Ixalan Commander (LCC). EDHREC rank 9307.
export default defineCard({
  name: "Storm Fleet Negotiator",
  manaCost: "{2}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Siren", "Pirate"],
  power: 2,
  toughness: 2,
  keywords: ["flying"],
  text: "Flying\nParley — Whenever this creature attacks, each player reveals the top card of their library. For each nonland card revealed this way, you create a Map token. Then each player draws a card. (A Map token is an artifact with \"{1}, {T}, Sacrifice this token: Target creature you control explores. Activate only as a sorcery.\")",
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: parley({ kind: "create-token", token: "Map Token", count: PARLEY_NONLAND }),
      resolve: null,
      text: "Parley — Whenever this creature attacks, each player reveals the top card of their library. For each nonland card revealed this way, you create a Map token. Then each player draws a card.",
    },
  ],
});
