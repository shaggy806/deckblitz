import { defineCard } from "../define.js";

// EDHREC rank 26139.
//
// Rulings:
//   [2004-10-04] If both you and this card would be dealt damage at the same time, or if either
//     you or this card would be dealt damage from multiple sources at the same time, the
//     redirection will apply to both chunks of damage.

export default defineCard({
  name: "Glarecaster",
  manaCost: "{4}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Bird", "Cleric"],
  power: 3,
  toughness: 3,
  keywords: ["flying"],
  text: "Flying\n{5}{W}: The next time damage would be dealt to this creature and/or you this turn, that damage is dealt to any target instead.",
  activated: [
    {
      cost: { mana: "{5}{W}", tap: false },
      targets: ["any-target"],
      effect: { kind: "damage-rule", to: { target: "source", players: "you" }, amount: "next-time", redirectTo: 0 },
      resolve: null,
      text: "{5}{W}: The next time damage would be dealt to this creature and/or you this turn, that damage is dealt to any target instead.",
    },
  ],
});
