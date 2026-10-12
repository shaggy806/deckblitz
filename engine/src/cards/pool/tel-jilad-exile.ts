import { defineCard } from "../define.js";

export default defineCard({
  name: "Tel-Jilad Exile",
  manaCost: "{3}{G}",
  colors: ["G"],
  types: ["creature"],
  subtypes: ["Troll", "Warrior"],
  power: 2,
  toughness: 3,
  text: "{1}{G}: Regenerate this creature.",
  activated: [
    {
      cost: { mana: "{1}{G}", tap: false },
      targets: [],
      effect: { kind: "regenerate", target: "source" },
      resolve: null,
      text: "{1}{G}: Regenerate this creature.",
    },
  ],
});
