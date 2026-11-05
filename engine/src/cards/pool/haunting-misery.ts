import { defineCard } from "../define.js";

// EDHREC rank 29096.

export default defineCard({
  name: "Haunting Misery",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["sorcery"],
  additionalCost: { exileFromGraveyard: { count: "x", filter: { type: "creature" } } },
  text: "As an additional cost to cast this spell, exile X creature cards from your graveyard.\nHaunting Misery deals X damage to target player or planeswalker.",
  targets: ["player-or-planeswalker"],
  effect: { kind: "damage", amount: "x", target: 0 },
});
