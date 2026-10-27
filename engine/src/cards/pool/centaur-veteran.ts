import { defineCard } from "../define.js";

// Torment. EDHREC rank 32044.

const TEXT = "{G}, Discard a card: Regenerate this creature.";

export default defineCard({
  name: "Centaur Veteran",
  manaCost: "{5}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Centaur"],
  power: 3,
  toughness: 3,
  keywords: ["trample"],
  text: `Trample\n${TEXT}`,
  activated: [
    {
      cost: { mana: "{G}", tap: false, discard: { count: 1 } },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: TEXT,
    },
  ],
});
