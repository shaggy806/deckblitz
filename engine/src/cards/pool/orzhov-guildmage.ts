import { defineCard } from "../define.js";

// Guildpact (GPT). EDHREC rank 21978.

export default defineCard({
  name: "Orzhov Guildmage",
  manaCost: "{W/B}{W/B}",
  colors: ["W", "B"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: "{2}{W}: Target player gains 1 life.\n{2}{B}: Each player loses 1 life.",
  activated: [
    {
      cost: { mana: "{2}{W}", tap: false },
      targets: ["player"],
      effect: { kind: "gain-life", amount: 1, toControllerOfTarget: 0 },
      resolve: null,
      text: "{2}{W}: Target player gains 1 life.",
    },
    {
      cost: { mana: "{2}{B}", tap: false },
      targets: [],
      effect: { kind: "lose-life", amount: 1, who: "each-player" },
      resolve: null,
      text: "{2}{B}: Each player loses 1 life.",
    },
  ],
});
