import { defineCard } from "../define.js";

// EDHREC rank 19276.
//
// Rulings:
//   [2023-06-30] Being goaded isn't an ability the creature has. Once it's been goaded, it must
//     attack as detailed above even if it loses all abilities.
//   [2023-06-30] Attacking with a goaded creature doesn't cause it to stop being goaded.

export default defineCard({
  name: "Jeering Homunculus",
  manaCost: "{1}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Homunculus"],
  power: 0,
  toughness: 4,
  text: "When this creature enters, you may goad target creature. (Until your next turn, that creature attacks each combat if able and attacks a player other than you if able.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: { kind: "may", prompt: "Goad the target creature?", effect: { kind: "goad", target: 0 } },
      resolve: null,
      text: "When this creature enters, you may goad target creature.",
    },
  ],
});
