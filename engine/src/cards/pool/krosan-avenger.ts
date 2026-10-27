import { defineCard } from "../define.js";

// Odyssey. EDHREC rank 31563.

export default defineCard({
  name: "Krosan Avenger",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 3,
  toughness: 1,
  keywords: ["trample"],
  text: "Trample\nThreshold — {1}{G}: Regenerate this creature. Activate only if there are seven or more cards in your graveyard.",
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      condition: { kind: "threshold" },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "Threshold — {1}{G}: Regenerate this creature. Activate only if there are seven or more cards in your graveyard.",
    },
  ],
});
