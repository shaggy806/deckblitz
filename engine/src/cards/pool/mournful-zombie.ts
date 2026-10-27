import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 31661.
const TEXT = "{W}, {T}: Target player gains 1 life.";

export default defineCard({
  name: "Mournful Zombie",
  manaCost: "{2}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 2,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{W}", tap: true },
      targets: ["player"],
      effect: { kind: "gain-life", amount: 1, toControllerOfTarget: 0 },
      resolve: null,
      text: TEXT,
    },
  ],
});
