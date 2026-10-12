import { defineCard } from "../define.js";

export default defineCard({
  name: "Rolling Temblor",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["sorcery"],
  flashback: { cost: "{4}{R}{R}" },
  text: "Rolling Temblor deals 2 damage to each creature without flying.\nFlashback {4}{R}{R} (You may cast this card from your graveyard for its flashback cost. Then exile it.)",
  effect: { kind: "damage-all", filter: { type: "creature", notKeyword: "flying" }, amount: 2 },
});
