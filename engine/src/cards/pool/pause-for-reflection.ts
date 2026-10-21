import { defineCard } from "../define.js";

// EDHREC rank 13763.

export default defineCard({
  name: "Pause for Reflection",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["instant"],
  convoke: true,
  text: "Convoke (Your creatures can help cast this spell. Each creature you tap while casting this spell pays for {1} or one mana of that creature's color.)\nPrevent all combat damage that would be dealt this turn.",
  targets: [],
  effect: { kind: "prevent-all-combat-damage" },
});
