import { defineCard } from "../define.js";

// EDHREC rank 20001.
const MONSTROSITY_TEXT =
  "{5}{W}{W}: Monstrosity 3. (If this creature isn't monstrous, put three +1/+1 counters on it and it becomes monstrous.)";
const EXILE_TEXT = "When this creature becomes monstrous, exile all artifacts and enchantments.";

export default defineCard({
  name: "Kalemne's Captain",
  manaCost: "{3}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Giant", "Soldier"],
  power: 5,
  toughness: 5,
  keywords: ["vigilance"],
  text: `Vigilance\n${MONSTROSITY_TEXT}\n${EXILE_TEXT}`,
  activated: [
    {
      cost: { mana: "{5}{W}{W}", tap: false },
      targets: [],
      effect: { kind: "monstrosity", amount: 3 },
      resolve: null,
      text: MONSTROSITY_TEXT,
    },
  ],
  triggered: [
    {
      trigger: { on: "becomes-monstrous", who: "self" },
      targets: [],
      effect: { kind: "exile-all", filter: { typesAnyOf: ["artifact", "enchantment"] } },
      resolve: null,
      text: EXILE_TEXT,
    },
  ],
});
