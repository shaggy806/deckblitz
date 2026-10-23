import { defineCard } from "../define.js";

// Mind Control with Palinchron's untap: any lands, chosen as it resolves,
// untargeted (the ruling).
export default defineCard({
  name: "Treachery",
  manaCost: "{3}{U}{U}",
  colors: ["U"],
  types: ["enchantment"],
  subtypes: ["Aura"],
  text: "Enchant creature\nWhen this Aura enters, untap up to five lands.\nYou control enchanted creature.",
  targets: ["creature"],
  controlEnchanted: true,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: {
        kind: "choose-permanents",
        filter: { type: "land" },
        upTo: 5,
        then: { kind: "untap", target: 0 },
        prompt: "Untap up to five lands",
      },
      resolve: null,
      text: "When this Aura enters, untap up to five lands.",
    },
  ],
});
