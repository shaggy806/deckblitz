import { defineCard } from "../define.js";

// EDHREC rank 16030.

export default defineCard({
  name: "Geyser Leaper",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Human", "Warrior", "Ally"],
  power: 4,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\nWaterbend {4}: Draw a card, then discard a card. (While paying a waterbend cost, you can tap your artifacts and creatures to help. Each one pays for {1}.)",
  activated: [
    {
      cost: { mana: "{4}", tap: false, waterbend: true },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [{ kind: "draw", amount: 1 }, { kind: "discard", target: "you", amount: 1 }],
      },
      resolve: null,
      text: "Waterbend {4}: Draw a card, then discard a card.",
    },
  ],
});
