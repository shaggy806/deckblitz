import { defineCard } from "../define.js";

const HEROIC_TEXT =
  "Heroic — Whenever you cast a spell that targets this creature, you may return target enchantment to its owner's hand.";

export default defineCard({
  name: "Triton Cavalry",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Soldier"],
  power: 2,
  toughness: 4,
  text: HEROIC_TEXT,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "you", filter: { targets: { source: true } } },
      targets: ["enchantment"],
      effect: {
        kind: "may",
        prompt: "Return the target enchantment to its owner's hand?",
        effect: { kind: "return-to-hand", target: 0 },
      },
      resolve: null,
      text: HEROIC_TEXT,
    },
  ],
});
