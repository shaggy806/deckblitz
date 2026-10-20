import { defineCard } from "../define.js";

// EDHREC rank 23468.

export default defineCard({
  name: "Rise of the Ants",
  manaCost: "{4}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  flashback: { cost: "{6}{G}{G}" },
  text: "Create two 3/3 green Insect creature tokens. You gain 2 life.\nFlashback {6}{G}{G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  effect: {
    kind: "sequence",
    effects: [
      { kind: "create-token", token: "Insect Token (Rise of the Ants)", count: 2 },
      { kind: "gain-life", amount: 2 },
    ],
  },
});
