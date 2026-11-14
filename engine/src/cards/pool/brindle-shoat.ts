import { defineCard } from "../define.js";

export default defineCard({
  name: "Brindle Shoat",
  manaCost: "{1}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Boar"],
  power: 1,
  toughness: 1,
  text: "When this creature dies, create a 3/3 green Boar creature token.",
  triggered: [
    {
      trigger: { on: "dies", who: "self" },
      targets: [],
      effect: { kind: "create-token", token: "3/3 Green Boar Token", count: 1 },
      resolve: null,
      text: "When this creature dies, create a 3/3 green Boar creature token.",
    },
  ],
});
