import { defineCard } from "../define.js";

export default defineCard({
  name: "Thraben Doomsayer",
  manaCost: "{1}{W}{W}",
  colors: ["W"],
  types: ["creature"],
  subtypes: ["Human", "Cleric"],
  power: 2,
  toughness: 2,
  text: "{T}: Create a 1/1 white Human creature token.\nFateful hour — As long as you have 5 or less life, other creatures you control get +2/+2.",
  activated: [
    {
      cost: { mana: null, tap: true },
      targets: [],
      effect: { kind: "create-token", token: "Human Token", count: 1 },
      resolve: null,
      text: "{T}: Create a 1/1 white Human creature token.",
    },
  ],
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true },
      condition: { kind: "life-total", who: "you", atMost: 5 },
      grantPt: [2, 2],
      text: "Fateful hour — As long as you have 5 or less life, other creatures you control get +2/+2.",
    },
  ],
});
