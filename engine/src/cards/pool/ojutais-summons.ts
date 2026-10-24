import { defineCard } from "../define.js";

export default defineCard({
  name: "Ojutai's Summons",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["sorcery"],
  rebound: true,
  text: "Create a 2/2 blue Djinn Monk creature token with flying.\nRebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  effect: { kind: "create-token", token: "Djinn Monk Token", count: 1 },
});
