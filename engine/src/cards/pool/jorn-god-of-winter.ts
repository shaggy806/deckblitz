import { defineCard } from "../define.js";

// #499 of the old top-500 commanders. A modal DFC; the back face is Kaldring,
// the Rimestaff, which is also what makes Jorn three-colour (rule 903.4d).
// EDHREC rank 13168.
//
// Rulings:
//   [2021-02-05] Jorn's triggered ability will untap Jorn itself.
//   [2021-02-05] Snow is a supertype, not a card type. It has no rules meaning or function by
//     itself, but spells and abilities may refer to it.

const ATTACK_TEXT = "Whenever Jorn attacks, untap each snow permanent you control.";

export default defineCard({
  name: "Jorn, God of Winter",
  manaCost: "{2}{G}",
  colors: ["G"],
  supertypes: ["legendary", "snow"],
  types: ["creature"],
  subtypes: ["God"],
  power: 3,
  toughness: 3,
  text: ATTACK_TEXT,
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      // Preston Garvey's shape; Jorn is snow, so it untaps itself (the ruling).
      effect: { kind: "untap-all", filter: { supertype: "snow", controlledBy: "you" } },
      resolve: null,
      text: ATTACK_TEXT,
    },
  ],
  faces: ["Jorn, God of Winter", "Kaldring, the Rimestaff"],
});
