import { defineCard } from "../define.js";

export default defineCard({
  name: "Quantum Misalignment",
  manaCost: "{4}{U}",
  colors: ["U"],
  types: ["sorcery"],
  rebound: true,
  text:
    "Create a token that's a copy of target creature you control, except it isn't legendary.\n" +
    "Rebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  targets: ["creature-you-control"],
  effect: { kind: "create-token-copy", of: 0, count: 1, notLegendary: true },
});
