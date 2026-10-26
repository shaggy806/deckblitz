import { defineCard } from "../define.js";

// EDHREC rank 29130.
//
// "Can't block Humans" is "can block only non-Humans" (Burden of Proof's
// shape), checked as blockers are declared.

export default defineCard({
  name: "Hunted Ghoul",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Zombie"],
  power: 1,
  toughness: 2,
  text: "This creature can't block Humans.",
  static: [
    {
      affects: { scope: "self" },
      canBlockOnly: { notSubtypes: ["Human"] },
      text: "This creature can't block Humans.",
    },
  ],
});
