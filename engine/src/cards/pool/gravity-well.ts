import { defineCard } from "../define.js";

// EDHREC rank 13724. Resolves in the declare attackers step, so the attacker
// has lost flying by the time blockers are declared; flying granted after it
// resolves works normally (the rulings).

const TEXT = "Whenever a creature with flying attacks, it loses flying until end of turn.";

export default defineCard({
  name: "Gravity Well",
  manaCost: "{1}{G}{G}",
  colors: ["G"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "any", filter: { keyword: "flying" } },
      targets: [],
      effect: { kind: "lose-keywords", target: "trigger-object", keywords: ["flying"], duration: "end-of-turn" },
      resolve: null,
      text: TEXT,
    },
  ],
});
