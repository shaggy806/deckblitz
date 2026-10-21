import { defineCard } from "../define.js";

export default defineCard({
  name: "Storm Caller",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Shaman"],
  power: 3,
  toughness: 2,
  text: "When this creature enters, it deals 2 damage to each opponent.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: 2, who: "each-opponent" },
      resolve: null,
      text: "When this creature enters, it deals 2 damage to each opponent.",
    },
  ],
});
