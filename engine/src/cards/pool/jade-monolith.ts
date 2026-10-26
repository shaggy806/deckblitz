import { defineCard } from "../define.js";

// EDHREC rank 16975.

export default defineCard({
  name: "Jade Monolith",
  manaCost: "{4}",
  colors: [],
  types: ["artifact"],
  text: "{1}: The next time a source of your choice would deal damage to target creature this turn, that source deals that damage to you instead.",
  activated: [
    {
      cost: { mana: "{1}", tap: false },
      targets: ["creature"],
      // Rule 614.9: a redirection.
      effect: { kind: "prevent-damage-from-chosen-source", to: 0, amount: "next-time", redirectTo: "you" },
      resolve: null,
      text: "{1}: The next time a source of your choice would deal damage to target creature this turn, that source deals that damage to you instead.",
    },
  ],
});
