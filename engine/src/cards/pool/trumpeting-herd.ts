import { defineCard } from "../define.js";

export default defineCard({
  name: "Trumpeting Herd",
  manaCost: "{2}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  rebound: true,
  text: "Create a 3/3 green Elephant creature token.\nRebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  effect: { kind: "create-token", token: "Elephant Token", count: 1 },
});
