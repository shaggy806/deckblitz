import { defineCard } from "../define.js";

// EDHREC rank 26144.
// Makes Servo → use "Servo Token".

export default defineCard({
  name: "Countless Gears Renegade",
  manaCost: "{1}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Artificer"],
  power: 2,
  toughness: 2,
  text: "Revolt — When this creature enters, if a permanent left the battlefield under your control this turn, create a 1/1 colorless Servo artifact creature token.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Servo Token", count: 1 },
      resolve: null,
      text: "Revolt — When this creature enters, if a permanent left the battlefield under your control this turn, create a 1/1 colorless Servo artifact creature token.",
      condition: { kind: "turn-history", what: "left" },
    },
  ],
});
