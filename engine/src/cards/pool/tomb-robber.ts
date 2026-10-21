import { defineCard } from "../define.js";

// EDHREC rank 21218.

export default defineCard({
  name: "Tomb Robber",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Pirate"],
  power: 1,
  toughness: 1,
  keywords: ["menace"],
  text: "Menace\n{1}, Discard a card: This creature explores. (Reveal the top card of your library. Put that card into your hand if it's a land. Otherwise, put a +1/+1 counter on this creature, then put the card back or put it into your graveyard.)",
  activated: [
    {
      cost: { mana: "{1}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "explore", target: "source" },
      resolve: null,
      text: "{1}, Discard a card: This creature explores.",
    },
  ],
});
