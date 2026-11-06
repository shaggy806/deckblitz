import { defineCard } from "../define.js";


export default defineCard({
  name: "Tenacious Drone",
  manaCost: "{1}{B}",
  colors: ["B"],
  types: ["artifact", "creature"],
  subtypes: ["Borg"],
  power: 2,
  toughness: 1,
  text: "When this creature dies, create a 1/1 colorless Borg artifact creature token.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "Borg Token", count: 1 },
      resolve: null,
      text: "When this creature dies, create a 1/1 colorless Borg artifact creature token.",
    },
  ],
});
