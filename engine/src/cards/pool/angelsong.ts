import { defineCard } from "../define.js";

// Conflux (CON). EDHREC rank 8645.

export default defineCard({
  name: "Angelsong",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  cycling: { cost: "{2}" },
  text: "Prevent all combat damage that would be dealt this turn.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: [],
  effect: { kind: "prevent-all-combat-damage" },
});
