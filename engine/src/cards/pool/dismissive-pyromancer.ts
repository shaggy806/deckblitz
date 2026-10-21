import { defineCard } from "../define.js";

const LOOT_TEXT = "{R}, {T}, Discard a card: Draw a card.";
const SAC_TEXT = "{2}{R}, {T}, Sacrifice this creature: It deals 4 damage to target creature.";

export default defineCard({
  name: "Dismissive Pyromancer",
  manaCost: "{1}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Human", "Wizard"],
  power: 2,
  toughness: 2,
  text: `${LOOT_TEXT}\n${SAC_TEXT}`,
  activated: [
    {
      cost: { mana: "{R}", tap: true, discard: { count: 1 } },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: LOOT_TEXT,
    },
    {
      cost: { mana: "{2}{R}", tap: true, sacrifice: "self" },
      targets: ["creature"],
      effect: { kind: "damage", target: 0, amount: 4 },
      resolve: null,
      text: SAC_TEXT,
    },
  ],
});
