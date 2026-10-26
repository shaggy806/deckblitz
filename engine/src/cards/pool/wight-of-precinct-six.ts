import { defineCard } from "../define.js";

// EDHREC rank 9587.
//
// Rulings:
//   [2017-11-17] Wight of Precinct Six’s ability applies only while it’s on the battlefield. In
//     all other zones, it’s a 1/1 creature.
//   [2017-11-17] If Wight of Precinct Six is dealt lethal damage at the same time as a creature an
//     opponent controls, they’re destroyed at the same time. It won’t get an additional +1/+1 from
//     its ability in time to save it.

export default defineCard({
  name: "Wight of Precinct Six",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 1,
  toughness: 1,
  text: "This creature gets +1/+1 for each creature card in your opponents' graveyards.",
  static: [
    {
      affects: { scope: "self" },
      grantPtPerCount: { inGraveyard: { type: "creature", ownedBy: "opponent" }, pt: [1, 1] },
      text: "This creature gets +1/+1 for each creature card in your opponents' graveyards.",
    },
  ],
});
