import { defineCard } from "../define.js";

// EDHREC rank 20752.
//
// "Any color" a land you control could produce (Reflecting Pool's list, rule
// 106.7): colours only — a land making only {C} adds nothing here.

const TEXT = "{T}: Add one mana of any color that a land you control could produce.";

export default defineCard({
  name: "Harvester Druid",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Human", "Druid"],
  power: 1,
  toughness: 1,
  text: TEXT,
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "add-mana", mana: { producedBy: "your-lands" }, amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
