import { defineCard } from "../define.js";

// EDHREC rank 15987.
//
// A token's mana value is 0 unless it copies something, and {X} counts as 0
// on the battlefield (the rulings) — both what `manaValue` reads.
export default defineCard({
  name: "Pest Control",
  manaCost: "{W}{B}",
  colors: ["W", "B"],
  types: ["sorcery"],
  cycling: { cost: "{2}" },
  text: "Destroy all nonland permanents with mana value 1 or less.\nCycling {2} ({2}, Discard this card: Draw a card.)",
  effect: { kind: "destroy-all", filter: { notTypes: ["land"], manaValue: { op: "lte", n: 1 } } },
});
