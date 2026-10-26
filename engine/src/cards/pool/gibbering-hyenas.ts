import { defineCard } from "../define.js";

// Mirage (MIR). EDHREC rank 31794.
//
// "Can't block black creatures" is "can block only nonblack creatures",
// the attacker's colours read as blockers are declared.

export default defineCard({
  name: "Gibbering Hyenas",
  manaCost: "{2}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Hyena"],
  power: 3,
  toughness: 2,
  text: "This creature can't block black creatures.",
  static: [
    {
      affects: { scope: "self" },
      canBlockOnly: { notColors: ["B"] },
      text: "This creature can't block black creatures.",
    },
  ],
});
