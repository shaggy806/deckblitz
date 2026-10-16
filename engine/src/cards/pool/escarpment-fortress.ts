import { defineCard } from "../define.js";

// EDHREC rank 14383.

export default defineCard({
  name: "Escarpment Fortress",
  manaCost: "{4}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Wall"],
  power: 3,
  toughness: 5,
  keywords: ["defender", "reach"],
  text: "Defender (This creature can't attack.)\nReach (This creature can block creatures with flying.)\nOther creatures you control get +1/+0.\nWhenever you attack with two or more creatures, draw a card.",
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      grantPt: [1, 0],
      text: "Other creatures you control get +1/+0.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attack-with", who: "you", atLeast: 2 },
      targets: [],
      effect: { kind: "draw", amount: 1 },
      resolve: null,
      text: "Whenever you attack with two or more creatures, draw a card.",
    },
  ],
});
