import { defineCard } from "../define.js";

// EDHREC rank 31499.

export default defineCard({
  name: "Royal Herbalist",
  manaCost: "{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 1,
  toughness: 1,
  text: "{2}, Exile the top card of your library: You gain 1 life.",
  activated: [
    {
      cost: { mana: "{2}", tap: false, exileTop: 1 },
      targets: [],
      effect: { kind: "gain-life", amount: 1 },
      resolve: null,
      text: "{2}, Exile the top card of your library: You gain 1 life.",
    },
  ],
});
