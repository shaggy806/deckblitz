import { defineCard } from "../define.js";

// EDHREC rank 14685.
//
// Rulings:
//   [2024-01-12] Populate doesn't target the creature token you're copying. You choose that
//     creature token as you're taking the populate action. You can choose any creature token you
//     control.
//   [2024-01-12] If you control no creature tokens when you populate, nothing will happen.
//   [2024-01-12] The new token doesn't copy whether the original token is tapped or untapped,
//     whether it has any counters on it or Auras and Equipment attached to it, or any noncopy
//     effects that have changed its power, toughness, color, and so on.

export default defineCard({
  name: "Vitu-Ghazi Guildmage",
  manaCost: "{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Dryad", "Shaman"],
  power: 2,
  toughness: 2,
  text: "{4}{G}{W}: Create a 3/3 green Centaur creature token.\n{2}{G}{W}: Populate. (Create a token that's a copy of a creature token you control.)",
  activated: [
    {
      cost: { mana: "{4}{G}{W}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "3/3 Centaur Token", count: 1 },
      resolve: null,
      text: "{4}{G}{W}: Create a 3/3 green Centaur creature token.",
    },
    {
      cost: { mana: "{2}{G}{W}", tap: false },
      targets: [],
      effect: { kind: "populate" },
      resolve: null,
      text: "{2}{G}{W}: Populate. (Create a token that's a copy of a creature token you control.)",
    },
  ],
});
