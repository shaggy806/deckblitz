import { defineCard } from "../define.js";

export default defineCard({
  name: "Shinka Gatekeeper",
  manaCost: "{2}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Ogre", "Warrior"],
  power: 3,
  toughness: 2,
  text: "Whenever this creature is dealt damage, it deals that much damage to you.",
  triggered: [
    {
      trigger: { on: "dealt-damage", who: "self" },
      targets: [],
      effect: { kind: "damage", amount: { triggerValue: true }, who: "you" },
      resolve: null,
      text: "Whenever this creature is dealt damage, it deals that much damage to you.",
    },
  ],
});
