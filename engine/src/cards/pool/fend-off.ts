import { defineCard } from "../define.js";

// EDHREC rank 28349.

export default defineCard({
  name: "Fend Off",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["instant"],
  cycling: { cost: "{2}" },
  text: "Prevent all combat damage that would be dealt by target creature this turn.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: ["creature"],
  effect: { kind: "damage-rule", by: { target: 0 }, combat: true },
});
