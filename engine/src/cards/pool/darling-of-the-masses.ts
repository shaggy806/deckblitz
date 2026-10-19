import { defineCard } from "../define.js";

export default defineCard({
  name: "Darling of the Masses",
  manaCost: "{2}{G}{W}",
  colors: ["W", "G"],
  types: ["creature"],
  subtypes: ["Elf", "Citizen"],
  power: 2,
  toughness: 4,
  text: "Other Citizens you control get +1/+0.\nWhenever this creature attacks, create a 1/1 green and white Citizen creature token.",
  static: [
    {
      affects: { scope: "creatures-you-control", excludeSelf: true, subtype: "Citizen" },
      grantPt: [1, 0],
      text: "Other Citizens you control get +1/+0.",
    },
  ],
  triggered: [
    {
      trigger: { on: "attacks", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Citizen Token", count: 1 },
      resolve: null,
      text: "Whenever this creature attacks, create a 1/1 green and white Citizen creature token.",
    },
  ],
});
