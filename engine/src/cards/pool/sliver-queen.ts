import { defineCard } from "../define.js";

export default defineCard({
  name: "Sliver Queen",
  manaCost: "{W}{U}{B}{R}{G}",
  colors: ["W", "U", "B", "R", "G"],
  supertypes: ["legendary"],
  types: ["creature"],
  subtypes: ["Sliver"],
  power: 7,
  toughness: 7,
  text: "{2}: Create a 1/1 colorless Sliver creature token.",
  activated: [
    {
      cost: { mana: "{2}", tap: false },
      targets: [],
      effect: { kind: "create-token", token: "Sliver Token", count: 1 },
      resolve: null,
      text: "{2}: Create a 1/1 colorless Sliver creature token.",
    },
  ],
});
