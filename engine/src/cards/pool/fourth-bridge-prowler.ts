import { defineCard } from "../define.js";

// EDHREC rank 14945.
//
// Rulings:
//   [2017-02-09] Fourth Bridge Prowler can be the target of its own ability.

const ETB_TEXT = "When this creature enters, you may have target creature get -1/-1 until end of turn.";

export default defineCard({
  name: "Fourth Bridge Prowler",
  manaCost: "{B}",
  colors: ["B"],
  types: ["creature"],
  subtypes: ["Human", "Rogue"],
  power: 1,
  toughness: 1,
  text: ETB_TEXT,
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature"],
      effect: {
        kind: "may",
        prompt: "Have the target creature get -1/-1 until end of turn?",
        effect: { kind: "modify-pt", target: 0, power: -1, toughness: -1, duration: "end-of-turn" },
      },
      resolve: null,
      text: ETB_TEXT,
    },
  ],
});
