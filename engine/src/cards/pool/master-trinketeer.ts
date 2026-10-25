import { defineCard } from "../define.js";

// Kaladesh (KLD). EDHREC rank 17868.
//
// One static over "Servo or Thopter": a Servo Thopter gets +1/+1, not +2/+2
// (the ruling).
export default defineCard({
  name: "Master Trinketeer",
  manaCost: "{2}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Dwarf", "Artificer"],
  power: 3,
  toughness: 2,
  text: "Servos and Thopters you control get +1/+1.\n{3}{W}: Create a 1/1 colorless Servo artifact creature token.",
  static: [
    {
      affects: { scope: "filter", filter: { subtypes: ["Servo", "Thopter"], controlledBy: "you" } },
      grantPt: [1, 1],
      text: "Servos and Thopters you control get +1/+1.",
    },
  ],
  activated: [
    {
      cost: { mana: "{3}{W}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Servo Token", count: 1 },
      resolve: null,
      text: "{3}{W}: Create a 1/1 colorless Servo artifact creature token.",
    },
  ],
});
