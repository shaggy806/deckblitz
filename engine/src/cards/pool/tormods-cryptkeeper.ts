import { defineCard } from "../define.js";

const SAC_TEXT = "{T}, Sacrifice this creature: Exile target player's graveyard.";

export default defineCard({
  name: "Tormod's Cryptkeeper",
  manaCost: "{3}",
  colors: [],
  types: ["artifact", "creature"],
  subtypes: ["Golem"],
  power: 3,
  toughness: 2,
  keywords: ["vigilance"],
  text: `Vigilance\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: null, tap: true, sacrifice: "self" },
      targets: ["player"],
      effect: { kind: "exile-graveyard", target: 0 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
