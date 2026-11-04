import { defineCard } from "../define.js";

// "Flashback—Tap three untapped white creatures you control": no mana, and the
// Birds of the first cast can pay, summoning sick or not (rule 302.6).
export default defineCard({
  name: "Battle Screech",
  manaCost: "{2}{W}{W}",
  colors: ["W"],
  types: ["sorcery"],
  text: "Create two 1/1 white Bird creature tokens with flying.\nFlashback—Tap three untapped white creatures you control. (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  effect: { kind: "create-token", token: "Bird Token", count: 2 },
  flashback: { cost: "", tapCreatures: { count: 3, filter: { type: "creature", colors: ["W"] } } },
});
