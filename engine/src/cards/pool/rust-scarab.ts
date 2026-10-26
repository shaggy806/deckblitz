import { defineCard } from "../define.js";

export default defineCard({
  name: "Rust Scarab",
  manaCost: "{4}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Insect"],
  power: 4,
  toughness: 5,
  text: "Whenever this creature becomes blocked, you may destroy target artifact or enchantment defending player controls.",
  triggered: [
    {
      trigger: { on: "becomes-blocked", who: "self" },
      targets: [{ kind: "permanent", whose: "defending-player", filter: { typesAnyOf: ["artifact", "enchantment"] } }],
      effect: {
        kind: "may",
        prompt: "Destroy target artifact or enchantment defending player controls?",
        effect: { kind: "destroy", target: 0 },
      },
      resolve: null,
      text: "Whenever this creature becomes blocked, you may destroy target artifact or enchantment defending player controls.",
    },
  ],
});
