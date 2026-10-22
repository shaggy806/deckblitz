import { defineCard } from "../define.js";

// EDHREC rank 18056.
export default defineCard({
  name: "Glacial Crevasses",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["enchantment"],
  text: "Sacrifice a snow Mountain: Prevent all combat damage that would be dealt this turn.",
  activated: [
    {
      cost: { mana: null, tap: false, sacrifice: { filter: { subtype: "Mountain", supertype: "snow" } } },
      targets: [],
      effect: { kind: "prevent-all-combat-damage" },
      resolve: null,
      text: "Sacrifice a snow Mountain: Prevent all combat damage that would be dealt this turn.",
    },
  ],
});
