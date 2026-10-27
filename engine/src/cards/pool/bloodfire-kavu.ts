import { defineCard } from "../define.js";

// Apocalypse (APC). EDHREC rank 28283. Downdraft's shape: "it" is the sacrificed Kavu, the
// ability's source as it last existed (rule 608.2h).
const TEXT = "{R}, Sacrifice this creature: It deals 2 damage to each creature.";

export default defineCard({
  name: "Bloodfire Kavu",
  manaCost: "{2}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Kavu"],
  power: 2,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: "{R}", tap: false, sacrifice: "self" },
      targets: [],
      effect: { kind: "damage-all", amount: 2, filter: { type: "creature" } },
      resolve: null,
      text: TEXT,
    },
  ],
});
