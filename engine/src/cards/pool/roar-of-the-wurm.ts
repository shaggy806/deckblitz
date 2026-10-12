import { defineCard } from "../define.js";

export default defineCard({
  name: "Roar of the Wurm",
  manaCost: "{6}{G}",
  colors: ["G"],
  types: ["sorcery"],
  flashback: { cost: "{3}{G}" },
  text: "Create a 6/6 green Wurm creature token.\nFlashback {3}{G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  effect: { kind: "create-token", token: "6/6 Wurm Token", count: 1 },
});
