import { defineCard } from "../define.js";

// Only the caster looks: the hand isn't revealed to anyone else.

export default defineCard({
  name: "Painful Memories",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["sorcery"],
  text: "Look at target opponent's hand and choose a card from it. Put that card on top of that player's library.",
  targets: ["opponent"],
  effect: { kind: "discard-chosen", target: 0, lookOnly: true, destination: "library-top" },
});
