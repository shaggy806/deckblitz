import { defineCard } from "../define.js";

// EDHREC rank 23246. Plaza of Harmony's Gate intervening-if.

const TEXT = "When this creature enters, if you control two or more Gates, you may draw a card.";

export default defineCard({
  name: "Opal Lake Gatekeepers",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Vedalken", "Soldier"],
  power: 2,
  toughness: 4,
  text: TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "controls", filter: { subtype: "Gate" }, atLeast: 2 },
      targets: [],
      effect: { kind: "may", prompt: "Draw a card?", effect: { kind: "draw", amount: 1 } },
      resolve: null,
      text: TEXT,
    },
  ],
});
