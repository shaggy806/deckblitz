import { defineCard } from "../define.js";

// EDHREC rank 8488. Devotion is counted as the trigger resolves (the ruling),
// Master of Waves itself included if it's still there.

export default defineCard({
  name: "Master of Waves",
  manaCost: "{3}{U}",
  colors: ["U"],
  types: ["creature"],
  subtypes: ["Merfolk", "Wizard"],
  power: 2,
  toughness: 1,
  text: "Protection from red\nElemental creatures you control get +1/+1.\nWhen this creature enters, create a number of 1/0 blue Elemental creature tokens equal to your devotion to blue. (Each {U} in the mana costs of permanents you control counts toward your devotion to blue.)",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "1/0 Blue Elemental Token", count: { devotionTo: "U" } },
      resolve: null,
      text: "When this creature enters, create a number of 1/0 blue Elemental creature tokens equal to your devotion to blue.",
    },
  ],
  static: [
    { affects: { scope: "self" }, protection: { colors: ["R"] }, text: "Protection from red" },
    {
      affects: { scope: "creatures-you-control", subtype: "Elemental" },
      grantPt: [1, 1],
      text: "Elemental creatures you control get +1/+1.",
    },
  ],
});
