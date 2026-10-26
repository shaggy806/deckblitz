import { defineCard } from "../define.js";

// Dissension. Two instances of the word "target", so an artifact enchantment
// may be both (rule 115.3, the ruling); they're destroyed together.
export default defineCard({
  name: "Stomp and Howl",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["sorcery"],
  text: "Destroy target artifact and target enchantment.",
  targets: ["artifact", "enchantment"],
  effect: {
    kind: "sequence",
    simultaneous: true,
    effects: [
      { kind: "destroy", target: 0 },
      { kind: "destroy", target: 1 },
    ],
  },
});
