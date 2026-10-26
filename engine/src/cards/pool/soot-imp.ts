import { defineCard } from "../define.js";

// EDHREC rank 13693.
//
// Rulings:
//   [2008-08-01] This ability affects all players, including you.
//   [2008-08-01] A hybrid spell that's black and another color is *not* a nonblack spell.

const TEXT = "Whenever a player casts a nonblack spell, that player loses 1 life.";

export default defineCard({
  name: "Soot Imp",
  manaCost: "{1}{B}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Imp"],
  power: 1,
  toughness: 2,
  keywords: ["flying"],
  text: `Flying\n${TEXT}`,
  triggered: [
    {
      trigger: { on: "cast-spell", who: "any", filter: { notColors: ["B"] } },
      targets: [],
      effect: { kind: "lose-life", who: "trigger-controller", amount: 1 },
      resolve: null,
      text: TEXT,
    },
  ],
});
