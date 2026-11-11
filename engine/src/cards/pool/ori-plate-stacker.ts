import { defineCard } from "../define.js";

// EDHREC rank 9169. Only what was actually destroyed counts (an indestructible
// one doesn't), wherever it went after (the rulings).
const ENTER_TEXT =
  "When Ori enters, destroy all artifacts and enchantments your opponents control. You gain 1 life for each permanent destroyed this way.";

export default defineCard({
  name: "Ori, Plate Stacker",
  manaCost: "{5}{W}{W}",
  colors: ["W"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Dwarf", "Bard"],
  power: 3,
  toughness: 3,
  text: ENTER_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "sequence",
        effects: [
          { kind: "destroy-all", filter: { typesAnyOf: ["artifact", "enchantment"], controlledBy: "opponent" } },
          { kind: "gain-life", amount: { thisWay: "destroyed" } },
        ],
      },
      resolve: null,
      text: ENTER_TEXT,
    },
  ],
});
