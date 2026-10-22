import { defineCard } from "../define.js";

// Amonkhet. EDHREC rank 13321.

export default defineCard({
  name: "Haze of Pollen",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["instant"],
  cycling: { cost: "{3}" },
  text: "Prevent all combat damage that would be dealt this turn.\nCycling {3} ({3}, Discard this card: Draw a card.)",
  targets: [],
  effect: { kind: "prevent-all-combat-damage" },
});
