import { defineCard } from "../define.js";

// Amonkhet. Reflecting Pool's mana ability on a creature.
const TEXT = "{T}: Add one mana of any type that a land you control could produce.";

export default defineCard({
  name: "Naga Vitalist",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Snake", "Druid"],
  power: 1,
  toughness: 2,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { producedBy: "your-lands", anyType: true }, amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
