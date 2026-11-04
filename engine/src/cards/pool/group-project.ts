import { defineCard } from "../define.js";

export default defineCard({
  name: "Group Project",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Create a 2/2 red and white Spirit creature token.\nFlashback—Tap three untapped creatures you control. (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  effect: { kind: "create-token", token: "Spirit Token (Red-White 2/2)", count: 1 },
  flashback: { cost: "", tapCreatures: { count: 3, filter: { type: "creature" } } },
});
