import { defineCard } from "../define.js";

export default defineCard({
  name: "Lull",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  cycling: { cost: "{2}" },
  text: "Prevent all combat damage that would be dealt this turn.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: [],
  effect: { kind: "prevent-all-combat-damage" },
});
