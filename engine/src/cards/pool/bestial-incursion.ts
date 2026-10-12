import { defineCard } from "../define.js";

export default defineCard({
  name: "Bestial Incursion",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["sorcery"],
  flashback: { cost: "{5}{G}" },
  text: "Create a 4/4 green Beast creature token with trample.\nFlashback {5}{G} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  effect: { kind: "create-token", token: "Beast Token (Garruk, Veiled Butcher)", count: 1 },
});
