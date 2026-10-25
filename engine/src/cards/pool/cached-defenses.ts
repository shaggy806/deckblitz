import { defineCard } from "../define.js";

// EDHREC rank 28454. Fate Reforged.

export default defineCard({
  name: "Cached Defenses",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Bolster 3. (Choose a creature with the least toughness among creatures you control and put three +1/+1 counters on it.)",
  effect: { kind: "bolster", amount: 3 },
});
