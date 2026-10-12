import { defineCard } from "../define.js";

export default defineCard({
  name: "Tyrant of Kher Ridges",
  manaCost: "{4}{R}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Dragon"],
  power: 4,
  toughness: 5,
  keywords: ["flying"],
  text: "Flying\nWhen this creature enters, it deals 4 damage to any target.\n{R}: This creature gets +1/+0 until end of turn.",
  activated: [
    {
      cost: { mana: "{R}", tap: false },
      targets: [],
      effect: { kind: "modify-pt", target: "source", power: 1, toughness: 0, duration: "end-of-turn" },
      resolve: null,
      text: "{R}: This creature gets +1/+0 until end of turn.",
    },
  ],
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["any-target"],
      effect: { kind: "damage", amount: 4, target: 0 },
      resolve: null,
      text: "When this creature enters, it deals 4 damage to any target.",
    },
  ],
});
