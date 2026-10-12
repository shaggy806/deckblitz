import { defineCard } from "../define.js";

export default defineCard({
  name: "Whiptail Moloch",
  manaCost: "{4}{R}",
  colors: ["R"],
  types: ["creature"],
  subtypes: ["Lizard"],
  power: 6,
  toughness: 3,
  text: "When this creature enters, it deals 3 damage to target creature you control.",
  triggered: [
    {
      trigger: { on: "enters-battlefield", who: "self" },
      targets: ["creature-you-control"],
      effect: { kind: "damage", amount: 3, target: 0 },
      resolve: null,
      text: "When this creature enters, it deals 3 damage to target creature you control.",
    },
  ],
});
