import { defineCard } from "../define.js";

// Ruling: the creature is returned before the combat damage step, so it
// neither deals nor is dealt combat damage.
const TEXT = "Whenever a creature you control becomes blocked, you may return it to its owner's hand.";

export default defineCard({
  name: "Cunning Evasion",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["enchantment"],
  text: TEXT,
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "you-control", filter: { type: "creature" } },
      targets: [],
      effect: {
        kind: "may",
        prompt: "Return that creature to its owner's hand?",
        effect: { kind: "return-to-hand", target: "trigger-object" },
      },
      resolve: null,
      text: TEXT,
    },
  ],
});
