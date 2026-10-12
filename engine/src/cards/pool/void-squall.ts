import { defineCard } from "../define.js";

export default defineCard({
  name: "Void Squall",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  rebound: true,
  text: "Return target nonland permanent to its owner's hand.\nRebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  targets: ["nonland-permanent"],
  effect: { kind: "return-to-hand", target: 0 },
});
