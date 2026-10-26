import { defineCard } from "../define.js";

const ENTERS = "When this Aura enters, if enchanted permanent is tapped, untap it.";

// Control Magic's shape on any permanent. The untap is an intervening-if: it
// doesn't trigger at all on an untapped permanent (the ruling).
export default defineCard({
  name: "Volition Reins",
  manaCost: "{3}{U}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: `Enchant permanent\n${ENTERS}\nYou control enchanted permanent.`,
  targets: ["permanent"],
  controlEnchanted: true,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      condition: { kind: "source", filter: { attachedTo: { tapped: true } } },
      targets: [],
      effect: { kind: "untap", target: "attached" },
      resolve: null,
      text: ENTERS,
    },
  ],
});
