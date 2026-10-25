import { defineCard } from "../define.js";

export default defineCard({
  name: "Nomads' Assembly",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  rebound: true,
  text: "Create a 1/1 white Kor Soldier creature token for each creature you control.\nRebound (If you cast this spell from your hand, exile it as it resolves. At the beginning of your next upkeep, you may cast this card from exile without paying its mana cost.)",
  effect: {
    kind: "create-token",
    token: "Kor Soldier Token",
    count: { countOf: { type: "creature", controlledBy: "you" } },
  },
});
