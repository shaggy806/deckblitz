import { defineCard } from "../define.js";

export default defineCard({
  name: "Skyreaping",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Skyreaping deals damage to each creature with flying equal to your devotion to green. (Each {G} in the mana costs of permanents you control counts toward your devotion to green.)",
  effect: {
    kind: "damage-all",
    filter: { type: "creature", keyword: "flying" },
    amount: { devotionTo: ["G"] },
  },
});
