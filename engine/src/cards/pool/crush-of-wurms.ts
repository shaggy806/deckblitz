import { defineCard } from "../define.js";

export default defineCard({
  name: "Crush of Wurms",
  manaCost: "{6}{G}{G}{G}",
  colors: ["G"],
  types: ["sorcery"],
  flashback: { cost: "{9}{G}{G}{G}" },
  text: "Create three 6/6 green Wurm creature tokens.\nFlashback {9}{G}{G}{G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  effect: { kind: "create-token", token: "6/6 Wurm Token", count: 3 },
});
