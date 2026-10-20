import { defineCard } from "../define.js";

// EDHREC rank 21046.

export default defineCard({
  name: "Dread Fugue",
  manaCost: "{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Cleave {2}{B} (You may cast this spell for its cleave cost. If you do, remove the words in square brackets.)\nTarget player reveals their hand. You choose a nonland card from it [with mana value 2 or less]. That player discards that card.",
  targets: ["player"],
  effect: {
    kind: "discard-chosen",
    target: 0,
    filter: { notTypes: ["land"], manaValue: { op: "lte", n: 2 } },
  },
  cleave: {
    cost: "{2}{B}",
    targets: ["player"],
    effect: { kind: "discard-chosen", target: 0, filter: { notTypes: ["land"] } },
  },
});
