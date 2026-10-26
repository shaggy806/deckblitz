import { defineCard } from "../define.js";

// Urza's Saga.
export default defineCard({
  name: "Hush",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  cycling: { cost: "{2}" },
  text: "Destroy all enchantments.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  targets: [],
  effect: { kind: "destroy-all", filter: { type: "enchantment" } },
});
